import { defineClientConfig } from "vuepress/client";
import { defineAsyncComponent } from "vue";
import GpaCalculator from "./components/GpaCalculator.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component(
      "CampusMap",
      defineAsyncComponent(() => import("./components/CampusMap.vue")),
    );
    app.component("GpaCalculator", GpaCalculator);
  },
});
