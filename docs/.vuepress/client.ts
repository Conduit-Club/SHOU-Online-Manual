import { defineClientConfig } from "vuepress/client";
import CampusMap from "./components/CampusMap.vue";
import "./styles/index.css";

export default defineClientConfig({
  enhance({ app }) {
    app.component("CampusMap", CampusMap);
  },
});
