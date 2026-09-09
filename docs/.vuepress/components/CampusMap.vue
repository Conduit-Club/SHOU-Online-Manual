<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDarkMode } from "@vuepress/theme-default/client";
import { layers, LIGHT, DARK } from "@protomaps/basemaps";
import { withBase } from "vuepress/client";
import { loadPmtiles } from "./campusOverlay.js";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
setWorkerUrl(workerUrl);

const props = defineProps({
  center: { type: Array, default: () => [121.9, 30.9] },
  zoom: { type: Number, default: 12 },
  height: { type: String, default: "420px" },
  label: { type: String, default: "OpenStreetMap 地图" },
  pmtiles: { type: String, default: "/maps/campus.pmtiles" },
  markers: { type: Array, default: () => [] },
});

const isDark = useDarkMode();
const flavors = {
  light: {
    ...LIGHT,
    water: "#9bd8f0",
    buildings: "#d5cec4",
    school: "#f3e8cf",
    park_a: "#d9ead3",
    park_b: "#b8ddb0",
  },
  dark: DARK,
};
const flavorName = () => (isDark.value ? "dark" : "light");
const basemapLayers = () => layers("campus", flavors[flavorName()], { lang: "zh-Hans" });
const mapStyle = () => ({
  version: 8,
  glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${flavorName()}`,
  sources: {},
  layers: basemapLayers().filter((layer) => !layer.source),
});
const container = ref(null);
const loading = ref(true);
const error = ref("");
let map;
let observer;
let disposed = false;
let styleReady = false;
let overlay;
let overlayRequest = 0;
let MarkerClass;
let PopupClass;
let activeMarkers = [];

function renderMarkers() {
  activeMarkers.forEach((m) => m.remove());
  activeMarkers = [];
  if (!map || !MarkerClass || !props.markers || !props.markers.length) return;

  for (const item of props.markers) {
    if (!item) continue;
    try {
      let coords = null;
      if (Array.isArray(item) && item.length >= 2) {
        coords = item;
      } else if (Array.isArray(item.position) && item.position.length >= 2) {
        coords = item.position;
      } else if (item.lng !== undefined && item.lat !== undefined) {
        coords = [item.lng, item.lat];
      }
      if (!coords || typeof coords[0] !== "number" || typeof coords[1] !== "number") continue;

      const title = item.title || item.label || "";
      const description = item.description || item.desc || "";
      const color = item.color || "#e03e3e";

      const escape = (str) =>
        String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      const el = document.createElement("div");
      el.className = "osm-map__marker";
      el.innerHTML = `
        <div class="osm-map__marker-pin">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="${escape(color)}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${title ? `<div class="osm-map__marker-label">${escape(title)}</div>` : ""}
      `;

      const marker = new MarkerClass({ element: el, anchor: "bottom" }).setLngLat(coords);

      if (title || description) {
        const html = `<div class="osm-map__popup-content"><strong>${escape(title)}</strong>${
          description ? `<p style="margin:4px 0 0;font-size:12px;">${escape(description)}</p>` : ""
        }</div>`;
        const popup = new PopupClass({ offset: [0, -32], closeOnClick: false }).setHTML(html);
        marker.setPopup(popup);
      }

      marker.addTo(map);

      if (item.openPopup) {
        try {
          marker.togglePopup();
        } catch {
          // ignore
        }
      }

      activeMarkers.push(marker);
    } catch (err) {
      console.warn("Failed to render marker:", item, err);
    }
  }
}

function constrainCamera() {
  if (!map || !overlay) return;
  const { minLon, minLat, maxLon, maxLat, minZoom } = overlay.header;
  const mercatorY = (lat) => (1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2;
  const width = (maxLon - minLon) / 360;
  const height = mercatorY(minLat) - mercatorY(maxLat);
  // Cover the viewport, rather than fitting the archive inside it with empty margins.
  const minimum = Math.max(
    minZoom,
    Math.log2(Math.max(container.value.clientWidth / (512 * width), container.value.clientHeight / (512 * height))) +
      0.01,
  );
  map.setMinZoom(minimum);
  map.setMaxBounds([
    [minLon, minLat],
    [maxLon, maxLat],
  ]);
}

function applyOverlay() {
  if (!map || !styleReady) return;
  for (const layer of map.getStyle().layers) {
    if (layer.source === "campus") map.removeLayer(layer.id);
  }
  if (map.getSource("campus")) map.removeSource("campus");
  if (overlay) {
    map.addSource("campus", {
      type: "vector",
      url: `pmtiles://${overlay.url}`,
      minzoom: overlay.header.minZoom,
      maxzoom: overlay.header.maxZoom,
      bounds: [overlay.header.minLon, overlay.header.minLat, overlay.header.maxLon, overlay.header.maxLat],
      attribution: overlay.metadata.attribution,
    });
    const available = new Set(overlay.metadata.vector_layers.map((layer) => layer.id));
    for (const layer of basemapLayers()) {
      if (layer.source && available.has(layer["source-layer"])) map.addLayer(layer);
    }
    constrainCamera();
    loading.value = false;
  }
}

async function updateOverlay() {
  const request = ++overlayRequest;
  overlay = undefined;
  loading.value = true;
  error.value = "";
  applyOverlay();
  try {
    if (!props.pmtiles) throw new Error("请指定 PMTiles 文件");
    const { protocol, PMTiles } = await loadPmtiles();
    if (disposed || request !== overlayRequest) return;
    const path =
      props.pmtiles.startsWith("/") && !props.pmtiles.startsWith("//") ? withBase(props.pmtiles) : props.pmtiles;
    const url = new URL(path, window.location.href).href;
    const archive = new PMTiles(url);
    const [header, metadata] = await Promise.all([archive.getHeader(), archive.getMetadata()]);
    if (disposed || request !== overlayRequest) return;
    if (header.tileType !== 1 || !Array.isArray(metadata.vector_layers))
      throw new Error("需要 Protomaps 矢量 PMTiles 文件");
    protocol.add(archive);
    overlay = { url, header, metadata };
    applyOverlay();
  } catch (cause) {
    if (!disposed && request === overlayRequest) {
      loading.value = false;
      error.value = `校园地图加载失败：${cause.message}`;
    }
  }
}

watch(isDark, () => {
  if (!map) return;
  styleReady = false;
  loading.value = true;
  error.value = "";
  // Replacing the style keeps the current camera and emits style.load again.
  map.setStyle(mapStyle(), { diff: false });
});

watch(
  () => [props.center, props.zoom],
  () => map?.jumpTo({ center: props.center, zoom: props.zoom }),
  { deep: true },
);

watch(() => props.markers, renderMarkers, { deep: true });

onMounted(async () => {
  watch(() => props.pmtiles, updateOverlay, { immediate: true });
  try {
    const { Map, NavigationControl, Marker, Popup } = await import("maplibre-gl");
    if (disposed) return;
    MarkerClass = Marker;
    PopupClass = Popup;

    map = new Map({
      container: container.value,
      style: mapStyle(),
      localIdeographFontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      center: props.center,
      zoom: props.zoom,
      attributionControl: { compact: false },
      renderWorldCopies: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
      touchPitch: false,
    });
    map.addControl(new NavigationControl(), "top-right");
    map.scrollZoom.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.on("style.load", () => {
      styleReady = true;
      applyOverlay();
      renderMarkers();
    });
    map.on("load", () => {
      renderMarkers();
    });
    map.on("error", () => {
      loading.value = false;
      error.value = "部分地图资源加载失败，请检查网络连接后刷新页面。";
    });
    observer = new ResizeObserver(() => {
      map.resize();
      constrainCamera();
    });
    observer.observe(container.value);
  } catch (cause) {
    if (disposed) return;
    observer?.disconnect();
    map?.remove();
    map = undefined;
    loading.value = false;
    error.value = `无法加载地图：${cause.message}`;
  }
});

onBeforeUnmount(() => {
  disposed = true;
  activeMarkers.forEach((m) => m.remove());
  activeMarkers = [];
  observer?.disconnect();
  map?.remove();
  map = undefined;
});
</script>

<template>
  <div class="osm-map" :class="{ 'osm-map--dark': isDark }" :style="{ height }">
    <div ref="container" class="osm-map__canvas" role="region" :aria-label="label" />
    <p v-if="error" class="osm-map__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="osm-map__status" role="status">正在加载地图…</p>
  </div>
</template>

<style scoped>
.osm-map {
  --map-bg: #fff;
  --map-text: #222;
  position: relative;
  width: 100%;
  min-height: 200px;
  margin: 1rem 0;
}
.osm-map--dark {
  --map-bg: #242424;
  --map-text: #eee;
  color-scheme: dark;
}
.osm-map :deep(.maplibregl-ctrl-group),
.osm-map :deep(.maplibregl-ctrl-attrib) {
  background: var(--map-bg);
  color: var(--map-text);
}
.osm-map :deep(.maplibregl-ctrl-attrib a) {
  color: var(--map-text);
}
.osm-map--dark :deep(.maplibregl-ctrl-icon) {
  filter: invert(1);
}
.osm-map__canvas {
  width: 100%;
  height: 100%;
}
.osm-map__status {
  position: absolute;
  inset: 0;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: var(--map-bg);
  color: var(--map-text);
}
.osm-map__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 3rem;
  margin: 0;
  padding: 0.75rem;
  background: var(--map-bg);
  color: var(--map-text);
}
.osm-map :deep(.maplibregl-popup-content) {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
}
.osm-map--dark :deep(.maplibregl-popup-content) {
  background: var(--map-bg);
  color: var(--map-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.osm-map--dark :deep(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
  border-bottom-color: var(--map-bg);
}
.osm-map--dark :deep(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
  border-top-color: var(--map-bg);
}
.osm-map--dark :deep(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
  border-right-color: var(--map-bg);
}
.osm-map--dark :deep(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
  border-left-color: var(--map-bg);
}
.osm-map--dark :deep(.maplibregl-popup-close-button) {
  color: var(--map-text);
}
.osm-map :deep(.osm-map__marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform: translate3d(0, 0, 0);
  user-select: none;
}
.osm-map :deep(.osm-map__marker-pin) {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
  transition: transform 0.15s ease;
}
.osm-map :deep(.osm-map__marker:hover .osm-map__marker-pin) {
  transform: scale(1.18);
}
.osm-map :deep(.osm-map__marker-label) {
  margin-top: -2px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.95);
  color: #111;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  pointer-events: none;
}
.osm-map--dark :deep(.osm-map__marker-label) {
  background: rgba(36, 36, 36, 0.95);
  color: #eee;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
</style>
