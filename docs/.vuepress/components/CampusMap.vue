<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useDarkMode } from "@vuepress/theme-default/client";
import { campusLayers } from "./campusThemes.js";
import { withBase } from "vuepress/client";
import { loadPmtiles } from "./campusOverlay.js";
import "maplibre-gl/dist/maplibre-gl.css";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

const props = defineProps({
  center: { type: Array, default: () => [121.9, 30.9] },
  zoom: { type: Number, default: 12 },
  height: { type: String, default: "420px" },
  label: { type: String, default: "OpenStreetMap 地图" },
  pmtiles: { type: String, default: "/maps/campus.pmtiles" },
});

const isDark = useDarkMode();
const flavorName = () => (isDark.value ? "dark" : "light");
const basemapLayers = () => campusLayers("campus", flavorName());
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

  if (!map.getSource("canteens")) {
    map.addSource("canteens", { type: "geojson", data: withBase("/maps/canteens.json") });
  }
  if (!map.getLayer("canteens-point")) {
    map.addLayer({
      id: "canteens-point",
      type: "symbol",
      source: "canteens",
      minzoom: 14,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 13,
      },
      paint: {
        "text-color": isDark.value ? "#dfdfdf" : "#1c1c1e",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("canteens-point");

  if (!map.getSource("undergrad-dorms")) {
    map.addSource("undergrad-dorms", { type: "geojson", data: withBase("/maps/undergrad-dorms.json") });
  }
  if (!map.getLayer("undergrad-dorms-point")) {
    map.addLayer({
      id: "undergrad-dorms-point",
      type: "symbol",
      source: "undergrad-dorms",
      minzoom: 15,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 12,
      },
      paint: {
        "text-color": isDark.value ? "#efe3c2" : "#5f4700",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("undergrad-dorms-point");

  if (!map.getSource("grad-dorms")) {
    map.addSource("grad-dorms", { type: "geojson", data: withBase("/maps/grad-dorms.json") });
  }
  if (!map.getLayer("grad-dorms-point")) {
    map.addLayer({
      id: "grad-dorms-point",
      type: "symbol",
      source: "grad-dorms",
      minzoom: 15,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 12,
      },
      paint: {
        "text-color": isDark.value ? "#efe3c2" : "#5f4700",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("grad-dorms-point");

  if (!map.getSource("edu")) {
    map.addSource("edu", { type: "geojson", data: withBase("/maps/edu.json") });
  }
  if (!map.getLayer("edu-point")) {
    map.addLayer({
      id: "edu-point",
      type: "symbol",
      source: "edu",
      minzoom: 14.5,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 13,
      },
      paint: {
        "text-color": isDark.value ? "#cde6ff" : "#184c7c",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("edu-point");

  if (!map.getSource("sports")) {
    map.addSource("sports", { type: "geojson", data: withBase("/maps/sports.json") });
  }
  if (!map.getLayer("sports-fill")) {
    map.addLayer({
      id: "sports-fill",
      type: "fill",
      source: "sports",
      minzoom: 14.5,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: {
        "fill-color": "#4ccb5e80",
      },
    });
  }
  // Keep polygon fills above the basemap and below all campus labels after overlay updates.
  map.moveLayer("sports-fill", "canteens-point");
  if (!map.getLayer("sports-point")) {
    map.addLayer({
      id: "sports-point",
      type: "symbol",
      source: "sports",
      minzoom: 14.5,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 14,
      },
      paint: {
        "text-color": isDark.value ? "#c2ece3" : "#005548",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("sports-point");

  if (!map.getSource("gates")) {
    map.addSource("gates", { type: "geojson", data: withBase("/maps/gates.json") });
  }
  if (!map.getLayer("gates-point")) {
    map.addLayer({
      id: "gates-point",
      type: "symbol",
      source: "gates",
      minzoom: 13,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 14,
      },
      paint: {
        "text-color": isDark.value ? "#dfdfdf" : "#1c1c1e",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("gates-point");

  if (!map.getSource("other")) {
    map.addSource("other", { type: "geojson", data: withBase("/maps/other.json") });
  }
  if (!map.getLayer("other-point")) {
    map.addLayer({
      id: "other-point",
      type: "symbol",
      source: "other",
      minzoom: 16,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 10,
      },
      paint: {
        "text-color": isDark.value ? "#dfdfdf" : "#1c1c1e",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("other-point");

  if (!map.getSource("university")) {
    map.addSource("university", {
      type: "geojson",
      data: withBase("/maps/university.json"),
    });
  }
  if (!map.getLayer("university-point")) {
    map.addLayer({
      id: "university-point",
      type: "symbol",
      source: "university",
      maxzoom: 14.5,
      layout: {
        "text-field": ["get", "label"],
        "text-anchor": "center",
        "text-allow-overlap": true,
        "text-size": 16,
      },
      paint: {
        "text-color": isDark.value ? "#dfdfdf" : "#1c1c1e",
        "text-halo-color": isDark.value ? "#242424" : "#ffffff",
        "text-halo-width": 1,
      },
    });
  }
  map.moveLayer("university-point");
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

onMounted(async () => {
  watch(() => props.pmtiles, updateOverlay, { immediate: true });
  try {
    const { Map, NavigationControl, FullscreenControl, setWorkerUrl } = await import("maplibre-gl");
    if (disposed) return;
    setWorkerUrl(workerUrl);

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
    map.addControl(new NavigationControl());
    map.addControl(new FullscreenControl());
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.on("style.load", () => {
      styleReady = true;
      applyOverlay();
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
</style>
