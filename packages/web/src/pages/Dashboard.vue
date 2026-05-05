<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useActivityManagement } from '../composables/useActivityManagement.js';

const { activities, loading, error, startActivity, stopActivity, subscribeToStateChanges } = useActivityManagement();

const currentTime = ref('00:00:00');
const activeTab = ref('all');

const navTabs = [
  { id: 'all', label: 'ALL AGENTS', color: 'bg-cyan-400' },
  { id: 'active', label: 'ACTIVE', color: 'bg-green-400' },
  { id: 'idle', label: 'IDLE', color: 'bg-yellow-400' },
  { id: 'error', label: 'ERROR', color: 'bg-red-400' },
];

const filteredActivities = computed(() => {
  if (activeTab.value === 'all') return activities.value;
  return activities.value.filter((a) => a.state === activeTab.value);
});

const totalAgents = computed(() => activities.value.length);
const activeAgents = computed(() => activities.value.filter((a) => a.state === 'running').length);

// Update time every second
onMounted(() => {
  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString();
  };
  updateTime();
  setInterval(updateTime, 1000);

  // Subscribe to all activities' state changes
  activities.value.forEach((activity) => {
    subscribeToStateChanges(activity.id);
  });
});

// Handle activity action
async function handleActivityAction(activityId: string, action: 'start' | 'stop') {
  try {
    if (action === 'start') {
      await startActivity(activityId);
    } else {
      await stopActivity(activityId);
    }
  } catch (err) {
    console.error(`Failed to ${action} activity:`, err);
  }
}

// Get state color
function getStateColor(state: string) {
  switch (state) {
    case 'running':
      return 'bg-green-500 animate-pulse';
    case 'starting':
      return 'bg-yellow-500 animate-pulse';
    case 'stopping':
      return 'bg-orange-500 animate-pulse';
    case 'stopped':
      return 'bg-slate-600';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-slate-700';
  }
}

function getStateBadge(state: string) {
  const badges: Record<string, string> = {
    running: 'RUNNING',
    starting: 'STARTING',
    stopping: 'STOPPING',
    stopped: 'STOPPED',
    error: 'ERROR',
    idle: 'IDLE',
  };
  return badges[state] || 'UNKNOWN';
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Agent HQ — Live Operations</h1>
      <p class="text-slate-400">Real-time activity monitoring {{ currentTime }}</p>
    </div>

    <!-- Status -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-slate-400">Loading activities...</p>
    </div>

    <div v-else-if="error" class="bg-red-900 border border-red-700 p-4 rounded mb-6">
      <p class="text-red-200">{{ error }}</p>
    </div>

    <!-- Activities Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="bg-slate-900 rounded border border-slate-800 p-4 hover:border-slate-700 transition"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <h3 class="font-semibold text-sm">{{ activity.name }}</h3>
          <span :class="`px-2 py-1 text-xs rounded font-bold ${getStateColor(activity.state)}`">
            {{ getStateBadge(activity.state) }}
          </span>
        </div>

        <!-- State Indicator -->
        <div class="flex items-center gap-2 mb-3">
          <div :class="`w-2 h-2 rounded-full ${getStateColor(activity.state)}`" />
          <span class="text-xs text-slate-400">{{ activity.missionId || 'No mission' }}</span>
        </div>

        <!-- Error Display -->
        <div v-if="activity.error" class="bg-red-900 bg-opacity-20 border border-red-700 rounded p-2 mb-3">
          <p class="text-xs text-red-300">{{ activity.error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            v-if="activity.state === 'idle' || activity.state === 'stopped'"
            @click="handleActivityAction(activity.id, 'start')"
            class="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded transition font-semibold"
          >
            Start
          </button>
          <button
            v-if="activity.state === 'running' || activity.state === 'starting'"
            @click="handleActivityAction(activity.id, 'stop')"
            class="flex-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded transition font-semibold"
          >
            Stop
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="mt-12 grid grid-cols-3 gap-4">
      <div class="bg-slate-900 p-4 rounded border border-slate-800">
        <p class="text-slate-400 text-sm">Total Agents</p>
        <p class="text-3xl font-bold mt-1">{{ totalAgents }}</p>
      </div>
      <div class="bg-slate-900 p-4 rounded border border-slate-800">
        <p class="text-slate-400 text-sm">Active Now</p>
        <p class="text-3xl font-bold text-green-400 mt-1">{{ activeAgents }}</p>
      </div>
      <div class="bg-slate-900 p-4 rounded border border-slate-800">
        <p class="text-slate-400 text-sm">Idle</p>
        <p class="text-3xl font-bold text-yellow-400 mt-1">{{ totalAgents - activeAgents }}</p>
      </div>
    </div>
  </div>
</template>
