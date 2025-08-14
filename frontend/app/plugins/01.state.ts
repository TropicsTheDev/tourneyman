import { defineNuxtPlugin } from "#app";
import * as state from "../state";

export default defineNuxtPlugin((nuxtApp) => ({
  provide: {
    state: state,
  },
}));
