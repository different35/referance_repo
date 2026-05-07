<template>
  <div class="min-h-screen bg-slate-950 text-white p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-yellow-400 mb-2">🤖 Agent Swarm Monitor</h1>
      <p class="text-slate-400">Real-time monitoring of autonomous agent tasks</p>
    </div>

    <!-- Control Panel -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- Status Card -->
      <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div class="text-sm text-slate-400 mb-2">Active Tasks</div>
        <div class="text-3xl font-bold text-blue-400">{{ activeTasks }}</div>
      </div>

      <!-- Completed Card -->
      <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div class="text-sm text-slate-400 mb-2">Completed</div>
        <div class="text-3xl font-bold text-green-400">{{ completedTasks }}</div>
      </div>

      <!-- Failed Card -->
      <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div class="text-sm text-slate-400 mb-2">Failed</div>
        <div class="text-3xl font-bold text-red-400">{{ failedTasks }}</div>
      </div>
    </div>

    <!-- Test Submit Button -->
    <div class="mb-6">
      <button
        @click="submitTestTask"
        :disabled="isSubmitting"
        class="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50"
      >
        {{ isSubmitting ? "Submitting..." : "Test Agent Task" }}
      </button>
    </div>

    <!-- Live Event Stream -->
    <div class="bg-slate-900 rounded-lg p-6 border border-slate-700 h-96 overflow-y-auto">
      <div class="font-mono text-sm space-y-2">
        <div v-if="events.length === 0" class="text-slate-500">
          Waiting for agent events...
        </div>

        <div
          v-for="(event, idx) in events"
          :key="idx"
          class="flex gap-3 text-xs"
          :class="{
            'text-green-400': event.type === 'completed',
            'text-blue-400': event.type === 'thinking',
            'text-yellow-400': event.type === 'approval_needed',
            'text-red-400': event.type === 'error',
          }"
        >
          <span class="text-slate-600 flex-shrink-0">
            {{ new Date(event.timestamp).toLocaleTimeString() }}
          </span>
          <span class="font-semibold flex-shrink-0">{{ event.type }}</span>
          <span class="text-slate-400">
            [{{ event.agentId }}] {{ JSON.stringify(event.data).substring(0, 80) }}...
          </span>
        </div>
      </div>
    </div>

    <!-- Agent State Machine Visualization -->
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- State Flow -->
      <div class="bg-slate-900 rounded-lg p-6 border border-slate-700">
        <h3 class="text-lg font-bold text-yellow-400 mb-4">State Machine Flow</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-blue-400"></div>
            <span>idle → thinking</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-green-400"></div>
            <span>thinking → researching</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span>researching → writing</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full animate-pulse bg-yellow-400"></div>
            <span>writing → awaitingApproval</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-green-400"></div>
            <span>awaitingApproval → completed</span>
          </div>
        </div>
      </div>

      <!-- Vector Store Status -->
      <div class="bg-slate-900 rounded-lg p-6 border border-slate-700">
        <h3 class="text-lg font-bold text-yellow-400 mb-4">Research Memory</h3>
        <div class="space-y-2 text-sm text-slate-400">
          <div>📚 Vector Store: ChromaDB</div>
          <div>🔍 Search: Campaign similarity</div>
          <div>💾 Storage: NotebookLM references</div>
          <div>🎯 Optimization: Token budgeting</div>
          <div class="mt-3 text-yellow-400">
            Campaigns stored: {{ campaignCount }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { trpc } from "../lib/trpc";
import { ref, onMounted, onUnmounted } from "vue";

interface AgentEvent {
  type: string;
  agentId: string;
  taskId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

const events = ref<AgentEvent[]>([]);
const activeTasks = ref(0);
const completedTasks = ref(0);
const failedTasks = ref(0);
const campaignCount = ref(0);
const isSubmitting = ref(false);
let eventSource: EventSource | null = null;

onMounted(() => {
  connectToEventStream();
  fetchCampaignCount();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
  }
});

function connectToEventStream() {
  eventSource = new EventSource("/events");

  eventSource.onmessage = (ev) => {
    try {
      const event: AgentEvent = JSON.parse(ev.data);

      events.value.unshift(event);
      if (events.value.length > 100) {
        events.value.pop();
      }

      updateTaskCounts(event);
    } catch (e) {
      console.log("Heartbeat or parse error (expected)");
    }
  };

  eventSource.onerror = () => {
    console.error("EventSource error");
    eventSource?.close();
    setTimeout(connectToEventStream, 3000);
  };
}

function updateTaskCounts(event: AgentEvent) {
  if (event.type === "task_submitted") activeTasks.value++;
  if (event.type === "completed") {
    activeTasks.value = Math.max(0, activeTasks.value - 1);
    completedTasks.value++;
  }
  if (event.type === "error") {
    activeTasks.value = Math.max(0, activeTasks.value - 1);
    failedTasks.value++;
  }
}

async function submitTestTask() {
  isSubmitting.value = true;
  try {
    const useLocal = confirm("Use LM Studio local model? (Cancel = Claude API)");
    await trpc.agent.executeAgent.mutate({
      agentId: `agent-${Math.random().toString(36).slice(2, 9)}`,
      input: "Analyze current campaign performance and suggest optimizations",
      useLocal,
    });

    activeTasks.value++;
  } catch (error) {
    console.error("Error submitting task:", error);
  } finally {
    isSubmitting.value = false;
  }
}



async function fetchCampaignCount() {
  try {
    const result = await trpc.agent.getCampaigns.query();
    campaignCount.value = result.count || 0;
  } catch (error) {
    console.error("Error fetching campaign count:", error);
  }
}

</script>
