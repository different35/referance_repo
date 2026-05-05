<template>
  <section class="mb-10">
    <!-- Group Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-bold tracking-widest" :class="group.color">
          {{ group.name }}
        </span>
        <span class="text-[10px] text-slate-600">{{ group.agents[0]?.subtitle }}</span>
      </div>
      <span class="text-[10px] text-slate-600">{{ group.agents.length }} agent{{ group.agents.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Horizontal scroll of cards -->
    <div class="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style="scrollbar-width: thin; scrollbar-color: #1e293b transparent;">
      <AgentCard
        v-for="agent in group.agents"
        :key="agent.id"
        :agent="agent"
        :isSelected="selectedId === agent.id"
        @select="$emit('select', $event)"
        class="flex-shrink-0"
      />
    </div>

    <!-- Separator -->
    <div class="mt-6 h-px bg-slate-900" />
  </section>
</template>

<script setup lang="ts">
import AgentCard from './AgentCard.vue';
import type { DepartmentGroup } from './types';

defineProps<{
  group: DepartmentGroup;
  selectedId?: string;
}>();

defineEmits<{ select: [id: string] }>();
</script>
