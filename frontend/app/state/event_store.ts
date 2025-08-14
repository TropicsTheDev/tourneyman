import { createStore } from "@xstate/store";
import type { Store } from "@xstate/store";

export interface Event {
  id: string;
  name: string;
  date: string; // ISO string for simplicity
  location: { city: string; state: string };
  bannerUrl: string;
  ruleSet: "IBJJF" | "ADCC";
}

export interface EventStoreContext {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export type EventStoreEvents =
  | { type: "set_events"; value: Event[] }
  | { type: "add_event"; value: Event }
  | { type: "set_loading"; value: boolean }
  | { type: "set_error"; value: string | null };

export type EventStore = Store<EventStoreContext, EventStoreEvents, never>;

const event_store = createStore({
  context: {
    events: [],
    loading: false,
    error: null,
  } as EventStoreContext,
  on: {
    set_events: (ctx, events: Event[]) => ({ ...ctx, events }),
    add_event: (ctx, event: Event) => ({
      ...ctx,
      events: [event, ...ctx.events],
    }),
    set_loading: (ctx, loading: boolean) => ({ ...ctx, loading }),
    set_error: (ctx, error: string | null) => ({ ...ctx, error }),
  },
});

console.log(typeof event_store);

export default event_store;
