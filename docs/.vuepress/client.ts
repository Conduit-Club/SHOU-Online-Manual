import { defineClientConfig } from "vuepress/client";
import CampusMap from "./components/CampusMap.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component("CampusMap", CampusMap);
  },
});
