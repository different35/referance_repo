<template>
  <div
    class="relative flex flex-col bg-[#0d1117] border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:border-opacity-60 select-none"
    :class="[statusBorderClass, isSelected ? 'ring-1 ring-white/20' : '']"
    style="width: 320px; min-height: 220px;"
    @click="$emit('select', agent.id)"
  >
    <!-- Top status bar -->
    <div class="h-0.5 w-full" :class="statusBarClass" />

    <!-- Header -->
    <div class="flex items-start justify-between px-4 pt-3 pb-2">
      <div>
        <div class="flex items-center gap-2 mb-0.5">
          <span class="text-xs font-bold tracking-widest" :class="nameColorClass">
            {{ agent.name }}
          </span>
          <span
            v-if="agent.status !== 'idle'"
            class="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            :class="statusBadgeClass"
          >
            <span
              v-if="agent.status === 'active'"
              class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
            />
            {{ agent.status.toUpperCase() }}
          </span>
        </div>
        <p class="text-[11px] text-slate-500 leading-tight">{{ agent.subtitle }}</p>
      </div>

      <!-- Thumbnail -->
      <div
        v-if="agent.thumbnail"
        class="w-14 h-10 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden ml-3"
      >
        <span class="text-slate-600 text-xs">{{ agent.thumbnail }}</span>
      </div>
    </div>

    <!-- Description -->
    <div class="px-4 pb-3">
      <p class="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
        {{ agent.description }}
      </p>
    </div>

    <!-- Metrics -->
    <div v-if="agent.metrics?.length" class="flex flex-wrap gap-1.5 px-4 pb-3">
      <span
        v-for="m in agent.metrics"
        :key="m.label"
        class="text-[11px] font-semibold px-2 py-0.5 rounded"
        :class="metricColorClass(m.color)"
      >
        {{ m.value }}
        <span class="font-normal text-slate-500 ml-0.5">{{ m.label }}</span>
      </span>
    </div>

    <!-- Footer tags -->
    <div v-if="agent.tags?.length" class="flex flex-wrap gap-1 px-4 pb-3 mt-auto">
      <span
        v-for="tag in agent.tags"
        :key="tag"
        class="text-[10px] text-slate-600 border border-slate-800 rounded px-1.5 py-0.5"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Right-side vertical progress bar -->
    <div
      v-if="agent.progress !== undefined"
      class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900"
    >
      <div
        class="absolute bottom-0 left-0 right-0 transition-all duration-700"
        :class="progressBarClass"
        :style="{ height: agent.progress + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Agent } from './types';

const props = defineProps<{
  agent: Agent;
  isSelected?: boolean;
}>();

defineEmits<{ select: [id: string] }>();

const statusBorderClass = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'border-slate-700';
    case 'new':    return 'border-blue-900';
    case 'idle':   return 'border-slate-800';
    case 'error':  return 'border-red-900';
    default:       return 'border-slate-800';
  }
});

const statusBarClass = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'bg-green-500';
    case 'new':    return 'bg-blue-500';
    case 'idle':   return 'bg-slate-700';
    case 'error':  return 'bg-red-500';
    default:       return 'bg-slate-700';
  }
});

const statusBadgeClass = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'bg-green-500/10 text-green-400';
    case 'new':    return 'bg-blue-500/10 text-blue-400';
    case 'error':  return 'bg-red-500/10 text-red-400';
    default:       return 'bg-slate-800 text-slate-500';
  }
});

const nameColorClass = computed(() => {
  const colors: Record<string, string> = {
    STRATEGIST:  'text-yellow-400',
    'HEY-SALES': 'text-orange-400',
    COMMUNITY:   'text-blue-400',
    YOUTUBE:     'text-red-400',
    REPURPOSE:   'text-purple-400',
    TWITTER:     'text-sky-400',
    LINKEDIN:    'text-blue-500',
    VISUALS:     'text-pink-400',
    'GRAM - BETA ADD': 'text-rose-400',
  };
  return colors[props.agent.name] ?? 'text-white';
});

const progressBarClass = computed(() => {
  switch (props.agent.status) {
    case 'active': return 'bg-green-500';
    case 'new':    return 'bg-blue-500';
    case 'error':  return 'bg-red-500';
    default:       return 'bg-slate-600';
  }
});

function metricColorClass(color?: string) {
  switch (color) {
    case 'yellow': return 'bg-yellow-500/10 text-yellow-400';
    case 'red':    return 'bg-red-500/10 text-red-400';
    case 'blue':   return 'bg-blue-500/10 text-blue-400';
    case 'green':  return 'bg-green-500/10 text-green-400';
    case 'orange': return 'bg-orange-500/10 text-orange-400';
    case 'purple': return 'bg-purple-500/10 text-purple-400';
    default:       return 'bg-slate-800 text-slate-400';
  }
}

import { computed } from 'vue';
</script>
