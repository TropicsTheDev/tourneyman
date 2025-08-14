<template>
  <div v-if="is_loading" class="py-8">
    <w-skeleton-loader type="card" :count="1" class="mb-4" />
    <w-skeleton-loader type="tab" :count="4" />
  </div>
  <div v-else-if="event" class="event_detail_page">
    <w-card class="mb-4 p-0" bg-color="card-bg">
      <w-image :src="event.bannerUrl" aspect-ratio="2.5" class="rounded-t" />
      <div class="p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div class="text-2xl font-bold mb-1">{{ event.name }}</div>
            <div class="text-secondary text-sm mb-1">{{ format_date(event.date) }}</div>
            <div class="text-xs text-tertiary mb-2">{{ event.location.city }}, {{ event.location.state }}</div>
            <w-chip :label="event.ruleSet" color="primary" size="sm" />
          </div>
          <w-button
            :disabled="is_past_event"
            :loading="is_registering"
            color="primary"
            class="w-full md:w-auto"
            @click="register_for_event"
          >
            Register
          </w-button>
        </div>
        <w-notification
          v-if="is_past_event"
          type="warning"
          class="mt-2"
        >
          Registration closed. This event has ended.
        </w-notification>
        <w-notification
          v-else-if="is_deadline_near"
          type="warning"
          class="mt-2"
        >
          Registration deadline is approaching soon!
        </w-notification>
      </div>
    </w-card>

    <w-tabs v-model="tab" :tabs="tabs" class="mb-4" />
    <div v-if="tab === 'Overview'">
      <w-card bg-color="card-bg">
        <div class="prose dark:prose-invert">
          <p>Welcome to {{ event.name }}! Please review the divisions, schedule, and location tabs for more details.</p>
        </div>
      </w-card>
    </div>
    <div v-else-if="tab === 'Divisions'">
      <w-card bg-color="card-bg">
        <div class="prose dark:prose-invert">
          <p>Divisions information coming soon.</p>
        </div>
      </w-card>
    </div>
    <div v-else-if="tab === 'Schedule'">
      <w-card bg-color="card-bg">
        <div class="prose dark:prose-invert">
          <p>Schedule details will be published closer to the event date.</p>
        </div>
      </w-card>
    </div>
    <div v-else-if="tab === 'Location'">
      <w-card bg-color="card-bg">
        <div class="prose dark:prose-invert">
          <p>{{ event.location.city }}, {{ event.location.state }}</p>
        </div>
      </w-card>
    </div>
  </div>
  <div v-else class="py-8 text-center text-error">
    <w-notification type="error">Event not found.</w-notification>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, definePageMeta, useNuxtApp } from 'nuxt/app';
import { useWaveUI } from 'wave-ui';

// Page meta validation for event id
definePageMeta({
  validate: async (route) => {
    return /^[a-f0-9]{8}-[a-f0-9]{4}$/.test(route.params.id as string);
  }
});

const wave_ui = useWaveUI();
wave_ui.setTheme('dark');

const { state, services } = useNuxtApp();
const event_store = state.event_store;
const event_service = services.event_service;

const route = useRoute();
const event_id = computed(() => route.params.id as string);
const is_loading = computed(() => event_store.get().loading);
const event = computed(() => event_store.get().events.find(e => e.id === event_id.value) || null);

const is_registering = ref(false);
const tab = ref('Overview');
const tabs = ['Overview', 'Divisions', 'Schedule', 'Location'];

const is_past_event = computed(() => {
  if (!event.value) return false;
  return new Date(event.value.date) < new Date();
});
const is_deadline_near = computed(() => {
  if (!event.value) return false;
  const event_date = new Date(event.value.date);
  const now = new Date();
  const diff = (event_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff < 7 && diff > 0;
});

function format_date(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetch_event() {
  await event_service.get_events(); // Ensures store is populated
}

async function register_for_event() {
  is_registering.value = true;
  setTimeout(() => {
    is_registering.value = false;
    wave_ui.notify({ message: 'Registration successful!', type: 'success' });
  }, 1200);
}

onMounted(fetch_event);
</script>

<style scoped>
.event_detail_page {
  padding: 1.5rem 0;
}
</style>
