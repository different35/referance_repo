<template>
  <div class="min-h-screen bg-[#080c10] text-white flex flex-col select-none">

    <!-- ── Top Bar ─────────────────────────────────────────── -->
    <header class="flex items-center justify-between px-6 py-2 border-b border-slate-900 bg-[#0a0e14]">
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-bold tracking-widest text-slate-500">● AGENT HQ</span>
        <span class="text-slate-800">—</span>
        <span class="text-[10px] font-semibold tracking-widest text-slate-400">FLOOR VIEW</span>
      </div>
      <div class="flex items-center gap-6 text-[11px]">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Agents:</span>
          <span class="font-bold text-white transition-all duration-300">{{ totalAgents }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Advisors:</span>
          <span class="font-bold text-white">4</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Active:</span>
          <span class="font-bold text-green-400 transition-all duration-300">{{ activeAgents }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3 text-[11px]">
        <span class="text-slate-500">Thomas</span>
        <span class="text-slate-700">|</span>
        <span class="text-slate-400 font-mono tabular-nums">{{ currentTime }}</span>
      </div>
    </header>

    <!-- ── Nav Tabs ────────────────────────────────────────── -->
    <nav class="flex items-center gap-1 px-6 py-2 border-b border-slate-900">
      <button
        v-for="tab in navTabs" :key="tab.id"
        class="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider transition-all duration-200"
        :class="activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'"
        @click="activeTab = tab.id"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="tab.color" />
        {{ tab.label }}
        <span v-if="getGroupActiveCount(tab.id) > 0"
          class="ml-1 px-1 py-0.5 rounded text-[8px] bg-green-500/20 text-green-400 font-bold">
          {{ getGroupActiveCount(tab.id) }}
        </span>
      </button>
      <div class="ml-auto flex items-center gap-3 text-[10px] text-slate-600">
        <button class="hover:text-slate-400 transition-colors" @click="refreshActivities">↻ REFRESH</button>
        <span class="text-slate-800">|</span>
        <span :class="wsConnected ? 'text-green-500' : 'text-red-500'" class="font-bold">
          {{ wsConnected ? '● LIVE' : '○ OFFLINE' }}
        </span>
      </div>
    </nav>

    <!-- ── Loading ─────────────────────────────────────────── -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <span class="text-slate-600 text-[11px] tracking-widest animate-pulse">LOADING AGENTS...</span>
    </div>

    <!-- ── Main Floor ──────────────────────────────────────── -->
    <main v-else class="flex-1 overflow-y-auto px-6 pt-6">

      <!-- HEYCALLI -->
      <section v-show="activeTab === 'heycalli'" class="mb-10 section-enter">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold tracking-widest text-yellow-500">⬡ HEYCALLI</span>
            <span class="text-[10px] text-slate-600">Strateji ve Satış Grubu</span>
          </div>
          <span class="text-[10px] text-slate-700">{{ agents.heycalli.length }} agents</span>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2">

          <!-- STRATEGIST -->
          <div
            class="agent-card relative flex-shrink-0 w-80 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-strategist'), 'yellow')"
            @click="openDetail('agent-strategist')"
          >
            <div class="h-0.5 w-full" :class="agentState('agent-strategist') === 'running' ? 'bg-green-500' : 'bg-slate-700'" />
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[11px] font-bold tracking-widest text-yellow-400">STRATEGIST</span>
                    <StateBadge :state="agentState('agent-strategist')" />
                  </div>
                  <p class="text-[10px] text-slate-500">Co-CEO, First Principles</p>
                </div>
                <div class="w-14 h-10 rounded bg-slate-800/60 flex items-center justify-center text-lg">📊</div>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Evaluated <span class="text-white font-semibold">4 strategic paths</span>. First principles analysis on growth levers; burn optimization, and runway extension.
              </p>
              <div class="flex gap-2 flex-wrap">
                <span class="metric yellow">$1.8K <em>burn</em></span>
                <span class="metric red">TBD <em>revenue</em></span>
                <span class="metric blue">340K <em>runway</em></span>
              </div>
            </div>
            <ActionBar :id="'agent-strategist'" :state="agentState('agent-strategist')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-strategist')" color="bg-yellow-500" :pct="48" />
          </div>

          <!-- HEY-SALES -->
          <div
            class="agent-card relative flex-shrink-0 w-80 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-hey-sales'), 'orange')"
            @click="openDetail('agent-hey-sales')"
          >
            <div class="h-0.5 w-full" :class="agentState('agent-hey-sales') === 'running' ? 'bg-green-500' : 'bg-blue-500'" />
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[11px] font-bold tracking-widest text-orange-400">HEY-SALES</span>
                    <StateBadge :state="agentState('agent-hey-sales')" />
                  </div>
                  <p class="text-[10px] text-slate-500">AI Voice Qualification & CRM</p>
                </div>
                <div class="w-14 h-10 rounded bg-slate-800/60 flex items-center justify-center text-lg">📞</div>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Just deployed. Awaiting <span class="text-white font-semibold">first inbound leads</span>. BANT qualification pipeline ready. Night guard: no calls 20:00–08:00.
              </p>
              <div class="flex gap-2 flex-wrap">
                <span class="metric green">+5m <em>speed to lead</em></span>
                <span class="metric orange">+68% <em>qualify</em></span>
                <span class="metric blue">+95% <em>reach</em></span>
              </div>
            </div>
            <ActionBar :id="'agent-hey-sales'" :state="agentState('agent-hey-sales')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-hey-sales')" color="bg-blue-500" :pct="80" />
          </div>

        </div>
        <div class="mt-6 h-px bg-slate-900" />
      </section>

      <!-- COMMUNITY -->
      <section v-show="activeTab === 'community'" class="mb-10 section-enter">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold tracking-widest text-blue-400">⬡ COMMUNITY</span>
            <span class="text-[10px] text-slate-600">Skool Engagement & Retention</span>
          </div>
          <span class="text-[10px] text-slate-700">{{ agents.community.length }} agent</span>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2">

          <!-- COMMUNITY card -->
          <div
            class="agent-card relative flex-shrink-0 w-80 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-community'), 'blue')"
            @click="openDetail('agent-community')"
          >
            <div class="h-0.5 w-full bg-blue-500" />
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[11px] font-bold tracking-widest text-blue-400">COMMUNITY</span>
                    <StateBadge :state="agentState('agent-community')" />
                  </div>
                  <p class="text-[10px] text-slate-500">Skool Engagement & Retention</p>
                </div>
                <div class="w-14 h-10 rounded bg-slate-800/60 flex items-center justify-center text-lg">👥</div>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                First live cycle completed. Learning <span class="text-white font-semibold">Skool member tracking</span> — only top 30 visible; yearly subscribers need different churn signals.
              </p>
              <div class="flex gap-2 flex-wrap">
                <span class="metric green">&gt;90% <em>retention</em></span>
                <span class="metric blue">+40% <em>weekly active</em></span>
                <span class="metric slate">+12h <em>avg session</em></span>
              </div>
            </div>
            <ActionBar :id="'agent-community'" :state="agentState('agent-community')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-community')" color="bg-blue-500" :pct="90" />
          </div>

        </div>
        <div class="mt-6 h-px bg-slate-900" />
      </section>

      <!-- MARKETING -->
      <section v-show="activeTab === 'marketing'" class="mb-10 section-enter">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold tracking-widest text-yellow-500">⬡ MARKETING</span>
            <span class="text-[10px] text-slate-600">Content & Growth · Serves Both Teams</span>
          </div>
          <span class="text-[10px] text-slate-700">{{ agents.marketing.length }} agents</span>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2">

          <!-- YOUTUBE -->
          <div class="agent-card relative flex-shrink-0 w-72 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-youtube'), 'red')" @click="openDetail('agent-youtube')">
            <div class="h-0.5 w-full bg-red-500" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-red-400">YOUTUBE</span>
                <StateBadge :state="agentState('agent-youtube')" />
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Video Performance & Retention</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                TR content <span class="text-white font-semibold">+32% CTR</span>. Testing thumbnail variants. Retention drop at 4:20 mark identified.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="metric red">CTR 6.2%</span>
                <span class="metric yellow">AVD 8:40</span>
                <span class="metric blue">52% ret.</span>
              </div>
            </div>
            <ActionBar :id="'agent-youtube'" :state="agentState('agent-youtube')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-youtube')" color="bg-red-500" :pct="62" />
          </div>

          <!-- REPURPOSE -->
          <div class="agent-card relative flex-shrink-0 w-72 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-repurpose'), 'purple')" @click="openDetail('agent-repurpose')">
            <div class="h-0.5 w-full bg-purple-500" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-purple-400">REPURPOSE</span>
                <StateBadge :state="agentState('agent-repurpose')" />
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Multi-Format Distribution</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Converting videos → Twitter threads. <span class="text-white font-semibold">3 pending approval</span>, 2 scheduled for publish.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="metric purple">3 pending</span>
                <span class="metric green">2 live</span>
              </div>
            </div>
            <ActionBar :id="'agent-repurpose'" :state="agentState('agent-repurpose')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-repurpose')" color="bg-purple-500" :pct="40" />
          </div>

          <!-- TWITTER -->
          <div class="agent-card relative flex-shrink-0 w-72 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-twitter'), 'sky')" @click="openDetail('agent-twitter')">
            <div class="h-0.5 w-full bg-sky-500" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-sky-400">TWITTER</span>
                <StateBadge :state="agentState('agent-twitter')" />
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Outlier Growth & Engagement</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span class="text-white font-semibold">2 outlier posts</span> identified this week. Engagement rate 4.2%, impressions up 18%.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="metric sky">4.2% eng.</span>
                <span class="metric green">+18% imp.</span>
              </div>
            </div>
            <ActionBar :id="'agent-twitter'" :state="agentState('agent-twitter')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-twitter')" color="bg-sky-500" :pct="55" />
          </div>

          <!-- LINKEDIN -->
          <div class="agent-card relative flex-shrink-0 w-72 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-linkedin'), 'blue')" @click="openDetail('agent-linkedin')">
            <div class="h-0.5 w-full bg-blue-600" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-blue-500">LINKEDIN</span>
                <StateBadge :state="agentState('agent-linkedin')" />
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Network & Content Growth</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span class="text-white font-semibold">+120 followers</span> this month. Avg. 28 comments/post. Long-form outperforming short.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="metric blue">+120 follow</span>
                <span class="metric slate">28 cmnt/post</span>
              </div>
            </div>
            <ActionBar :id="'agent-linkedin'" :state="agentState('agent-linkedin')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-linkedin')" color="bg-blue-600" :pct="35" />
          </div>

          <!-- VISUALS -->
          <div class="agent-card relative flex-shrink-0 w-72 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-visuals'), 'pink')" @click="openDetail('agent-visuals')">
            <div class="h-0.5 w-full bg-pink-500" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-pink-400">VISUALS</span>
                <StateBadge :state="agentState('agent-visuals')" />
              </div>
              <p class="text-[10px] text-slate-500 mb-2">SaaS Demo Animations & Metrics</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span class="text-white font-semibold">4 animations</span> in pipeline. Approval rate 75%. Dashboard graphs delivered.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="metric pink">4 in pipe</span>
                <span class="metric green">75% appr.</span>
              </div>
            </div>
            <ActionBar :id="'agent-visuals'" :state="agentState('agent-visuals')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-visuals')" color="bg-pink-500" :pct="75" />
          </div>

          <!-- GRAM BETA -->
          <div class="agent-card relative flex-shrink-0 w-72 bg-[#0d1117] border rounded-lg overflow-hidden"
            :class="stateClass(agentState('agent-gram'), 'rose')" @click="openDetail('agent-gram')">
            <div class="h-0.5 w-full bg-rose-500" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-rose-400">GRAM — BETA</span>
                <StateBadge :state="agentState('agent-gram')" />
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Instagram Beta Growth</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Audience research phase. Testing <span class="text-white font-semibold">reels-first</span> strategy. ICP mapping in progress.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="metric rose">BETA</span>
                <span class="metric slate">ICP research</span>
              </div>
            </div>
            <ActionBar :id="'agent-gram'" :state="agentState('agent-gram')" @start="doStart" @stop="doStop" />
            <ProgressBar :state="agentState('agent-gram')" color="bg-rose-500" :pct="15" />
          </div>

        </div>
      </section>

    </main>

    <!-- ── Detail Drawer ───────────────────────────────────── -->
    <Transition name="drawer">
      <div v-if="detailId" class="fixed inset-0 z-50 flex justify-end" @click.self="detailId = null">
        <div class="w-96 bg-[#0a0e14] border-l border-slate-800 flex flex-col p-6 overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <span class="text-[11px] font-bold tracking-widest text-slate-400">AGENT DETAIL</span>
            <button class="text-slate-600 hover:text-white text-lg" @click="detailId = null">✕</button>
          </div>
          <template v-if="detailActivity">
            <div class="mb-4">
              <p class="text-lg font-bold text-white mb-0.5">{{ detailActivity.name }}</p>
              <StateBadge :state="detailActivity.state" />
            </div>
            <div class="space-y-3 text-[11px]">
              <div class="flex justify-between border-b border-slate-900 pb-2">
                <span class="text-slate-500">ID</span>
                <span class="text-slate-300 font-mono">{{ detailActivity.id }}</span>
              </div>
              <div class="flex justify-between border-b border-slate-900 pb-2">
                <span class="text-slate-500">Mission</span>
                <span class="text-slate-300">{{ detailActivity.missionId }}</span>
              </div>
              <div class="flex justify-between border-b border-slate-900 pb-2">
                <span class="text-slate-500">Started</span>
                <span class="text-slate-300">{{ detailActivity.startedAt ? new Date(detailActivity.startedAt).toLocaleString('tr-TR') : '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-slate-900 pb-2">
                <span class="text-slate-500">Stopped</span>
                <span class="text-slate-300">{{ detailActivity.stoppedAt ? new Date(detailActivity.stoppedAt).toLocaleString('tr-TR') : '—' }}</span>
              </div>
              <div v-if="detailActivity.error" class="p-3 bg-red-500/10 rounded border border-red-500/20 text-red-400">
                {{ detailActivity.error }}
              </div>
            </div>
            <div class="mt-6 flex gap-2">
              <button v-if="detailActivity.state !== 'running'"
                class="flex-1 py-2 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 text-[11px] font-bold transition-colors"
                @click="doStart(detailActivity.id)">▶ START</button>
              <button v-if="detailActivity.state === 'running'"
                class="flex-1 py-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-bold transition-colors"
                @click="doStop(detailActivity.id)">⏹ STOP</button>
              <button v-if="detailActivity.state === 'error'"
                class="flex-1 py-2 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 text-[11px] font-bold transition-colors"
                @click="doReset(detailActivity.id)">↺ RESET</button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue';
import { trpc } from '../lib/trpc.js';

// ─── Inline micro-components ─────────────────────────────
const StateBadge = defineComponent({
  props: { state: String },
  setup(p) {
    const map: Record<string, { text: string; cls: string }> = {
      running:  { text: 'ACTIVE',    cls: 'bg-green-500/10 text-green-400' },
      starting: { text: 'STARTING',  cls: 'bg-blue-500/10 text-blue-400 animate-pulse' },
      stopping: { text: 'STOPPING',  cls: 'bg-orange-500/10 text-orange-400 animate-pulse' },
      idle:     { text: 'IDLE',      cls: 'bg-slate-800 text-slate-500' },
      stopped:  { text: 'STOPPED',   cls: 'bg-slate-800 text-slate-500' },
      error:    { text: 'ERROR',     cls: 'bg-red-500/10 text-red-400' },
    };
    return () => {
      const s = p.state ?? 'idle';
      const b = map[s as keyof typeof map] ?? map.idle;
      return h('span', { class: `flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${(b ?? map.idle).cls}` }, [
        s === 'running' ? h('span', { class: 'w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block' }) : null,
        (b ?? map.idle).text,
      ]);
    };
  },
});

const ActionBar = defineComponent({
  props: { id: String, state: String },
  emits: ['start', 'stop'],
  setup(p, { emit }) {
    return () => h('div', {
      class: 'px-4 pb-3 flex gap-2',
      onClick: (e: Event) => e.stopPropagation(),
    }, [
      p.state !== 'running' && p.state !== 'starting' && p.state !== 'stopping'
        ? h('button', {
            class: 'text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors',
            onClick: () => emit('start', p.id),
          }, '▶ START')
        : null,
      p.state === 'running'
        ? h('button', {
            class: 'text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors',
            onClick: () => emit('stop', p.id),
          }, '⏹ STOP')
        : null,
    ]);
  },
});

const ProgressBar = defineComponent({
  props: { state: String, color: String, pct: Number },
  setup(p) {
    return () => h('div', { class: 'absolute right-0 top-0 bottom-0 w-1 bg-slate-900' }, [
      h('div', {
        class: `absolute bottom-0 left-0 right-0 transition-all duration-700 ${p.color}`,
        style: { height: `${p.state === 'running' ? p.pct : Math.round((p.pct ?? 0) * 0.4)}%` },
      }),
    ]);
  },
});

// ─── State ───────────────────────────────────────────────
const activeTab   = ref('heycalli');
const currentTime = ref('');
const loading     = ref(true);
const wsConnected = ref(false);
const detailId    = ref<string | null>(null);

const activityMap = ref<Record<string, any>>({});

let clockTimer: ReturnType<typeof setInterval>;
const unsubscribers: (() => void)[] = [];

// ─── Agent roster (matches seed IDs) ─────────────────────
const agents = {
  heycalli:  ['agent-strategist', 'agent-hey-sales'],
  community: ['agent-community'],
  marketing: ['agent-youtube', 'agent-repurpose', 'agent-twitter', 'agent-linkedin', 'agent-visuals', 'agent-gram'],
};

const navTabs = [
  { id: 'heycalli',   label: 'HEYCALLI',   color: 'bg-yellow-400' },
  { id: 'community',  label: 'COMMUNITY',  color: 'bg-blue-400' },
  { id: 'marketing',  label: 'MARKETING',  color: 'bg-orange-400' },
  { id: 'operations', label: 'OPERATIONS', color: 'bg-slate-600' },
];

// ─── Derived ─────────────────────────────────────────────
const allIds = [...agents.heycalli, ...agents.community, ...agents.marketing];

const totalAgents  = computed(() => allIds.length);
const activeAgents = computed(() => allIds.filter(id => activityMap.value[id]?.state === 'running').length);

const detailActivity = computed(() => detailId.value ? activityMap.value[detailId.value] : null);

function agentState(id: string): string {
  return activityMap.value[id]?.state ?? 'idle';
}

function getGroupActiveCount(tab: string): number {
  const ids = (agents as any)[tab] ?? [];
  return ids.filter((id: string) => agentState(id) === 'running').length;
}

function stateClass(state: string, accent: string): string {
  if (state === 'running')
    return `border-${accent}-500/50 shadow-lg shadow-${accent}-500/10 cursor-pointer hover:border-${accent}-500`;
  if (state === 'error')
    return 'border-red-500/50 cursor-pointer hover:border-red-400';
  return 'border-slate-800 hover:border-slate-700 cursor-pointer';
}

// ─── Clock ───────────────────────────────────────────────
function tick() {
  currentTime.value = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

// ─── Data ────────────────────────────────────────────────
async function refreshActivities() {
  try {
    const list: any[] = await (trpc as any).activity.list.query();
    list.forEach(a => { activityMap.value[a.id] = a; });
    wsConnected.value = true;
  } catch (e) {
    console.error(e);
    wsConnected.value = false;
  }
}

function subscribeAll() {
  allIds.forEach(id => {
    try {
      const sub = (trpc as any).liveSession.stateChanges.subscribe(
        { activityId: id },
        {
          onData(event: any) {
            if (activityMap.value[id]) {
              activityMap.value[id] = { ...activityMap.value[id], state: event.newState, error: event.error ?? null };
            }
            wsConnected.value = true;
          },
          onError() { wsConnected.value = false; },
        }
      );
      if (typeof sub === 'function') unsubscribers.push(sub);
      else if (sub?.unsubscribe) unsubscribers.push(() => sub.unsubscribe());
    } catch (_) {}
  });
}

// ─── Actions ─────────────────────────────────────────────
async function doStart(id: string) {
  activityMap.value[id] = { ...activityMap.value[id], state: 'starting' };
  try {
    const r = await (trpc as any).activity.start.mutate({ id });
    activityMap.value[id] = r.activity ?? activityMap.value[id];
  } catch (e: any) {
    activityMap.value[id] = { ...activityMap.value[id], state: 'error', error: e.message };
  }
}

async function doStop(id: string) {
  activityMap.value[id] = { ...activityMap.value[id], state: 'stopping' };
  try {
    const r = await (trpc as any).activity.stop.mutate({ id });
    activityMap.value[id] = r.activity ?? activityMap.value[id];
  } catch (e: any) {
    activityMap.value[id] = { ...activityMap.value[id], state: 'error', error: e.message };
  }
}

async function doReset(id: string) {
  try {
    const r = await (trpc as any).activity.resetError.mutate({ id });
    activityMap.value[id] = r.activity ?? activityMap.value[id];
  } catch (_) {}
}

function openDetail(id: string) { detailId.value = id; }

// ─── Lifecycle ───────────────────────────────────────────
onMounted(async () => {
  tick();
  clockTimer = setInterval(tick, 1000);
  await refreshActivities();
  loading.value = false;
  subscribeAll();
});

onUnmounted(() => {
  clearInterval(clockTimer);
  unsubscribers.forEach(fn => fn());
});
</script>

<style scoped>
::-webkit-scrollbar { height: 4px; width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }

.agent-card { transition: border-color .2s, box-shadow .2s; }

.section-enter { animation: fadeUp .25s ease-out; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.drawer-enter-active, .drawer-leave-active { transition: opacity .2s; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active > div, .drawer-leave-active > div { transition: transform .2s ease; }
.drawer-enter-from > div, .drawer-leave-to > div { transform: translateX(100%); }

/* metric pill helper */
.metric { @apply text-[10px] font-bold px-1.5 py-0.5 rounded; }
.metric em { @apply font-normal text-slate-500 not-italic; }
.metric.yellow { @apply bg-yellow-500/10 text-yellow-400; }
.metric.orange { @apply bg-orange-500/10 text-orange-400; }
.metric.green  { @apply bg-green-500/10 text-green-400; }
.metric.blue   { @apply bg-blue-500/10 text-blue-400; }
.metric.red    { @apply bg-red-500/10 text-red-400; }
.metric.purple { @apply bg-purple-500/10 text-purple-400; }
.metric.sky    { @apply bg-sky-500/10 text-sky-400; }
.metric.pink   { @apply bg-pink-500/10 text-pink-400; }
.metric.rose   { @apply bg-rose-500/10 text-rose-400; }
.metric.slate  { @apply bg-slate-800 text-slate-400; }
</style>
