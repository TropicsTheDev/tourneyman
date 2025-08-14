import { defineNuxtPlugin } from "#app";
import * as services from "../services";

export default defineNuxtPlugin((nuxtApp) => {
  const { $state } = nuxtApp;
  return {
    provide: {
      services: {
        event_service: services.create_event_service($state.event_store),
      },
    },
  };
});
