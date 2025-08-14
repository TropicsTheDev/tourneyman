<template>
  <div class="events_page">
    <w-card class="mb-4">
      <div class="filters flex flex-col md:flex-row gap-4 items-center">
        <!-- <w-input
          v-model="search_query"
          placeholder="Search by event name"
          icon="search"
        /> -->

        <w-select
          v-model="selected_location"
          :items="location_options"
          placeholder="Location (50km radius)"
        />
        <!-- <w-input v-model="date_range" type="date" placeholder="Date range" /> -->

        <w-select
          v-model="selected_type"
          :items="[{}]"
          placeholder="Tournament type"
        />
      </div>
    </w-card>

    <w-spinner v-if="true" class="mb-4" />

    <!-- <w-grid v-else :cols="grid_cols" gap="4">
      <w-card
        v-for="event in paginated_events"
        :key="event.id"
        class="event_tile"
        bg-color="card-bg"
      >
        <w-image :src="event.bannerUrl" aspect-ratio="2.5" class="mb-2" />
        <div class="font-bold text-lg mb-1">{{ event.name }}</div>
        <div class="text-sm text-secondary mb-1">
          {{ format_date(event.date) }}
        </div>
        <div class="text-xs text-tertiary mb-2">
          {{ event.location.city }}, {{ event.location.state }}
        </div>
        <w-chip :label="event.ruleSet" color="primary" size="sm" />
        <NuxtLink :to="`/events/${event.id}`">
          <w-button class="mt-2 w-full" color="primary">View Details</w-button>
        </NuxtLink>
      </w-card>
    </w-grid> -->

    <!-- <div class="flex justify-center mt-6">
      <w-pagination
        v-model="page"
        :total="filtered_events.length"
        :per-page="per_page"
      />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNuxtApp } from "#app";
import use_store from "~/composables/use_store";

const { $state, $services } = useNuxtApp();
const event_store = use_store($state.event_store);
const event_service = $services.event_service;

const is_loading = computed(() => event_store.state.value?.loading ?? true);
const events = computed(() => event_store.state.value?.events ?? []);

const search_query = ref("");
const selected_location = ref("");
const date_range = ref<[Date | null, Date | null]>([null, null]);
const selected_type = ref("");
const page = ref(1);
const per_page = 9;

// Fix: Ensure we always return an array for Wave UI
const location_options = computed(() => {
  try {
    // Safeguard against undefined and non-array values
    if (!Array.isArray(events.value)) return [];

    return [
      ...new Set(
        events.value.map((e) => `${e.location.city},${e.location.state}`)
      ),
    ].map((l) => ({ label: l }));
  } catch {
    return [];
  }
});

// Fix: Always return an array for Wave UI
const type_options = computed(() => [
  { label: "Gi", value: "IBJJF" },
  { label: "No-Gi", value: "ADCC" },
]);

const filtered_events = computed(() => {
  try {
    // Safeguard against undefined and non-array values
    if (!Array.isArray(events.value)) return [];

    let filtered = [...events.value];
    if (search_query.value) {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(search_query.value.toLowerCase())
      );
    }
    if (selected_location.value) {
      const [city, state] = selected_location.value.split(",");
      filtered = filtered.filter(
        (e) => e.location.city === city && e.location.state === state
      );
    }
    if (selected_type.value) {
      filtered = filtered.filter((e) => e.ruleSet === selected_type.value);
    }
    if (date_range.value[0] && date_range.value[1]) {
      filtered = filtered.filter((e) => {
        const d = new Date(e.date);
        return d >= date_range.value[0]! && d <= date_range.value[1]!;
      });
    }
    return filtered;
  } catch {
    return [];
  }
});

const paginated_events = computed(() => {
  const start = (page.value - 1) * per_page;
  return filtered_events.value.slice(start, start + per_page);
});

const grid_cols = computed(() => {
  if (typeof window !== "undefined" && window.innerWidth < 768) return 1;
  return 3;
});

function format_date(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MOCK_EVENTS = [
  {
    id: "mock1",
    name: "Mock Open 2024",
    date: new Date().toISOString(),
    location: { city: "Austin", state: "TX" },
    bannerUrl: "https://via.placeholder.com/600x240?text=Mock+Open+2024",
    ruleSet: "IBJJF",
  },
  {
    id: "mock2",
    name: "Sample Invitational",
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    location: { city: "Dallas", state: "TX" },
    bannerUrl: "https://via.placeholder.com/600x240?text=Sample+Invitational",
    ruleSet: "ADCC",
  },
];

onMounted(async () => {
  try {
    await event_service.get_events();
    console.log("getting events");
    if (events.value.length === 0 && import.meta.env.DEV) {
      event_store.triggers.set_events(MOCK_EVENTS);
    }
  } catch (error) {
    console.error("Error loading events:", error);
    if (import.meta.env.DEV) {
      event_store.triggers.set_events(MOCK_EVENTS);
    }
  }
});
</script>

<style scoped>
.events_page {
  padding: 1.5rem 0;
}
.event_tile {
  min-width: 0;
}
</style>
