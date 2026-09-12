// Register the PMTiles protocol once for all maps. Removing one map must not
// unregister a protocol that another map is still using.
let protocolPromise;

export function loadPmtiles() {
  protocolPromise ??= Promise.all([import("maplibre-gl/dist/maplibre-gl.mjs"), import("pmtiles")]).then(
    ([maplibre, { Protocol, PMTiles }]) => {
      const protocol = new Protocol();
      maplibre.addProtocol("pmtiles", protocol.tile);
      return { maplibre, protocol, PMTiles };
    },
  );
  return protocolPromise;
}
