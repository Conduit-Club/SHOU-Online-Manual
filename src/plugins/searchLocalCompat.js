const searchLocalModule = require("@easyops-cn/docusaurus-search-local");
const processDocInfosModule = require("@easyops-cn/docusaurus-search-local/dist/server/server/utils/processDocInfos.js");

const searchLocalPlugin = searchLocalModule.default ?? searchLocalModule;

/**
 * Keep the legacy Docusaurus output shape while fixing search-local's
 * undefined-trailingSlash assumption for explicit .html permalinks.
 */
function searchLocalCompat(context, options) {
  const plugin = searchLocalPlugin(context, options);
  if (!plugin?.postBuild) return plugin;

  const originalPostBuild = plugin.postBuild;
  return {
    ...plugin,
    async postBuild(props) {
      const originalProcessDocInfos = processDocInfosModule.processDocInfos;
      processDocInfosModule.processDocInfos = (buildData, config) =>
        originalProcessDocInfos(buildData, config).map((versionData) => ({
          ...versionData,
          paths: versionData.paths.map((entry) => {
            const pathname = entry.url.split(/[?#]/)[0];
            if (!/\.html?$/i.test(pathname)) return entry;

            return {
              ...entry,
              filePath: entry.filePath.replace(/[\\/]index\.html$/i, ""),
            };
          }),
        }));

      try {
        return await originalPostBuild(props);
      } finally {
        processDocInfosModule.processDocInfos = originalProcessDocInfos;
      }
    },
  };
}

searchLocalCompat.validateOptions = searchLocalModule.validateOptions;

module.exports = searchLocalCompat;
