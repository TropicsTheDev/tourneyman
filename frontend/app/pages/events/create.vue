<template>
  <div class="create_event_page">
    <w-card bg-color="card-bg" class="mb-4">
      <div class="text-2xl font-bold mb-2">Create New Event</div>
      <w-stepper v-model="step" :steps="steps" class="mb-4" />
      <form @submit.prevent="submit_form">
        <div v-if="step === 0">
          <!-- Basic Info -->
          <w-input
            v-model="form.name"
            label="Event Name"
            :error="errors.name"
            required
            class="mb-3"
          />
          <w-date-picker
            v-model="form.date"
            label="Event Date"
            :blackout-dates="blackout_dates"
            :error="errors.date"
            required
            class="mb-3"
          />
          <w-input
            v-model="form.city"
            label="City"
            :error="errors.city"
            required
            class="mb-3"
          />
          <w-input
            v-model="form.state"
            label="State"
            :error="errors.state"
            required
            class="mb-3"
          />
          <w-checkbox
            v-model="form.rule_sets"
            :options="rule_set_options"
            label="Rule Sets"
            :error="errors.rule_sets"
            required
            class="mb-3"
          />
          <w-file-upload
            v-model="form.banner_url"
            label="Banner Image"
            accept="image/*"
            :error="errors.banner_url"
            required
            class="mb-3"
          />
        </div>
        <div v-else-if="step === 1">
          <!-- Divisions -->
          <div class="mb-2 font-semibold">Divisions</div>
          <div
            v-for="(division, i) in form.divisions"
            :key="i"
            class="mb-2 flex gap-2 items-end"
          >
            <w-input
              v-model="division.weight"
              label="Weight"
              class="w-1/4"
              required
            />
            <w-input
              v-model="division.belt"
              label="Belt"
              class="w-1/4"
              required
            />
            <w-input
              v-model="division.age"
              label="Age"
              class="w-1/4"
              required
            />
            <w-button
              color="error"
              icon="delete"
              @click="remove_division(i)"
              size="sm"
            />
          </div>
          <w-button
            color="primary"
            icon="add"
            @click="add_division"
            size="sm"
            class="mb-3"
            >Add Division</w-button
          >
        </div>
        <div v-else-if="step === 2">
          <!-- Pricing -->
          <w-input
            v-model="form.price"
            label="Registration Price ($)"
            type="number"
            min="0"
            :error="errors.price"
            required
            class="mb-3"
          />
        </div>
        <div v-else-if="step === 3">
          <!-- Review -->
          <div class="mb-2 font-semibold">Review Event Details</div>
          <ul class="mb-2">
            <li><b>Name:</b> {{ form.name }}</li>
            <li><b>Date:</b> {{ form.date }}</li>
            <li><b>Location:</b> {{ form.city }}, {{ form.state }}</li>
            <li><b>Rule Sets:</b> {{ form.rule_sets.join(", ") }}</li>
            <li>
              <b>Divisions:</b>
              <ul>
                <li v-for="(d, i) in form.divisions" :key="i">
                  {{ d.weight }} / {{ d.belt }} / {{ d.age }}
                </li>
              </ul>
            </li>
            <li><b>Price:</b> ${{ form.price }}</li>
          </ul>
          <w-image
            v-if="form.banner_url"
            :src="form.banner_url"
            aspect-ratio="2.5"
            class="mb-2"
          />
        </div>
        <div class="flex justify-between mt-4">
          <w-button v-if="step > 0" @click="step--" color="secondary"
            >Back</w-button
          >
          <w-button
            v-if="step < steps.length - 1"
            @click="next_step"
            color="primary"
            :disabled="!can_proceed"
            >Next</w-button
          >
          <w-button
            v-if="step === steps.length - 1"
            type="submit"
            color="success"
            :loading="is_submitting"
            >Create Event</w-button
          >
        </div>
      </form>
    </w-card>
    <w-notification v-if="submit_success" type="success" class="mt-4">
      Event created successfully!
    </w-notification>
    <w-notification v-if="submit_error" type="error" class="mt-4">
      {{ submit_error }}
    </w-notification>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useWaveUI } from "wave-ui";
import { useNuxtApp } from "#app";

const wave_ui = useWaveUI();
wave_ui.setTheme("dark");

const { $state, $services } = useNuxtApp();
const event_store = $state.event_store;
const event_service = $services.event_service;

const step = ref(0);
const steps = ["Basic Info", "Divisions", "Pricing", "Review"];
const is_submitting = ref(false);
const submit_success = ref(false);
const submit_error = ref("");

const blackout_dates = [new Date("2024-07-04"), new Date("2024-12-25")];
const rule_set_options = [
  { label: "IBJJF", value: "IBJJF" },
  { label: "ADCC", value: "ADCC" },
];

const form = reactive({
  name: "",
  date: null as Date | null,
  city: "",
  state: "",
  rule_sets: [] as string[],
  banner_url: "",
  divisions: [] as { weight: string; belt: string; age: string }[],
  price: "",
});

const errors = reactive({
  name: "",
  date: "",
  city: "",
  state: "",
  rule_sets: "",
  banner_url: "",
  price: "",
});

function validate_step() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  if (step.value === 0) {
    if (!form.name) errors.name = "Event name is required.";
    if (!form.date) errors.date = "Date is required.";
    if (!form.city) errors.city = "City is required.";
    if (!form.state) errors.state = "State is required.";
    if (!form.rule_sets.length)
      errors.rule_sets = "Select at least one rule set.";
    if (!form.banner_url) errors.banner_url = "Banner image required.";
    return !Object.values(errors).some(Boolean);
  }
  if (step.value === 2) {
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errors.price = "Valid price required.";
    return !Object.values(errors).some(Boolean);
  }
  return true;
}

const can_proceed = computed(() => validate_step());

function next_step() {
  if (validate_step()) step.value++;
}

function add_division() {
  form.divisions.push({ weight: "", belt: "", age: "" });
}
function remove_division(i: number) {
  form.divisions.splice(i, 1);
}

async function submit_form() {
  if (!validate_step()) return;
  is_submitting.value = true;
  submit_error.value = "";
  try {
    const event_payload = {
      id: crypto.randomUUID(),
      name: form.name,
      date: form.date ? form.date.toISOString() : "",
      location: { city: form.city, state: form.state },
      bannerUrl: form.banner_url,
      ruleSet: form.rule_sets[0] || "",
      // You may want to extend this to support multiple rule sets and divisions
    };
    await event_service.create_event(event_payload);
    submit_success.value = true;
  } catch (e: any) {
    submit_error.value = e.message || "Failed to create event.";
  } finally {
    is_submitting.value = false;
  }
}
</script>

<style scoped>
.create_event_page {
  padding: 1.5rem 0;
  max-width: 700px;
  margin: 0 auto;
}
</style>
