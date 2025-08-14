import "wave-ui/dist/wave-ui.css";
import WaveUI from "wave-ui";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(WaveUI, { on: "#__nuxt" });
});
