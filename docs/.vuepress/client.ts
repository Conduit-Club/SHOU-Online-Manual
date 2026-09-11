import { defineClientConfig } from "vuepress/client";
import CampusMap from "./components/CampusMap.vue";
import GpaCalculator from "./components/GpaCalculator.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component("CampusMap", CampusMap);
    app.component("GpaCalculator", GpaCalculator);
  },
});
