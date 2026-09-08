// Register once for all maps. Removing a map must not remove another map's protocol.
let protocolPromise;
export function loadPmtiles() {
  protocolPromise ??= Promise.all([import("maplibre-gl"), import("pmtiles")]).then(
    ([{ addProtocol }, { Protocol, PMTiles }]) => {
      const protocol = new Protocol();
      addProtocol("pmtiles", protocol.tile);
      return { protocol, PMTiles };
    },
  );
  return protocolPromise;
}
