import type { Event, EventStore } from "../state/event_store";

export default function create_event_service(event_store: EventStore) {
  // Fetches events and updates the event_store
  async function get_events() {
    event_store.trigger.set_loading(true);
    event_store.trigger.set_error(null);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const events: Event[] = await res.json();
      event_store.send("set_events", events);
    } catch (err: any) {
      event_store.send("set_error", err.message || "Unknown error");
    } finally {
      event_store.send("set_loading", false);
    }
  }

  // Creates a new event and updates the event_store
  async function create_event(event: Event) {
    event_store.send("set_loading", true);
    event_store.send("set_error", null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const created: Event = await res.json();
      event_store.send("addEvent", created);
      return created;
    } catch (err: any) {
      event_store.send("set_error", err.message || "Unknown error");
      throw err;
    } finally {
      event_store.send("set_loading", false);
    }
  }

  return {
    get_events,
    create_event,
  };
}
