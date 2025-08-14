// types/nuxt.d.ts
import * as State from "../app/state";
import * as Services from "../app/services";

declare module "#app" {
  interface NuxtApp {
    $state: typeof State;
    $services: typeof Services;
  }
}
