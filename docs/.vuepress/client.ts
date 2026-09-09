import { defineClientConfig } from "vuepress/client";
import { defineAsyncComponent } from "vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component(
      "CampusMap",
      defineAsyncComponent(() => import("./components/CampusMap.vue")),
    );
  },
});
