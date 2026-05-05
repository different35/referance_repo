<template>
  <div class="min-h-screen bg-[#080c10] text-white flex flex-col">

    <!-- ── Top Bar ──────────────────────────────────────────── -->
    <header class="flex items-center justify-between px-6 py-2 border-b border-slate-900 bg-[#0a0e14]">
      <!-- Left: Brand + View -->
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-bold tracking-widest text-slate-500">● AGENT HQ</span>
        <span class="text-slate-800">—</span>
        <span class="text-[10px] font-semibold tracking-widest text-slate-400">FLOOR VIEW</span>
      </div>

      <!-- Center: Live counters -->
      <div class="flex items-center gap-6 text-[11px]">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Agents:</span>
          <span class="font-bold text-white">{{ totalAgents }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Advisors:</span>
          <span class="font-bold text-white">4</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Active:</span>
          <span class="font-bold text-green-400">{{ activeAgents }}</span>
        </div>
      </div>

      <!-- Right: User + Time -->
      <div class="flex items-center gap-3 text-[11px]">
        <span class="text-slate-500">Thomas</span>
        <span class="text-slate-700">|</span>
        <span class="text-slate-400 font-mono">{{ currentTime }}</span>
      </div>
    </header>

    <!-- ── Nav Tabs ──────────────────────────────────────────── -->
    <nav class="flex items-center gap-1 px-6 py-2 border-b border-slate-900">
      <button
        v-for="tab in navTabs"
        :key="tab.id"
        class="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider transition-colors"
        :class="activeTab === tab.id
          ? 'bg-slate-800 text-white'
          : 'text-slate-600 hover:text-slate-400'"
        @click="activeTab = tab.id"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="tab.color" />
        {{ tab.label }}
      </button>

      <div class="ml-auto flex items-center gap-3 text-[10px] text-slate-600">
        <button class="hover:text-slate-400 transition-colors">+ NAVA BUYLERI</button>
        <span class="text-slate-800">|</span>
        <button class="hover:text-slate-400 transition-colors">MISSIONS</button>
      </div>
    </nav>

    <!-- ── Main Floor ────────────────────────────────────────── -->
    <main class="flex-1 overflow-y-auto px-6 pt-6">

      <!-- HEYCALLI Group -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold tracking-widest text-yellow-500">⬡ HEYCALLI</span>
            <span class="text-[10px] text-slate-600">Strateji ve Satış Grubu</span>
          </div>
          <span class="text-[10px] text-slate-700">2 agents</span>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-2">

          <!-- STRATEGIST Card -->
          <div class="relative flex-shrink-0 w-80 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-green-500 w-full" />
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[11px] font-bold tracking-widest text-yellow-400">STRATEGIST</span>
                    <span class="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                      ACTIVE
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500">Co-CEO, First Principles</p>
                </div>
                <div class="w-14 h-10 rounded bg-slate-800/60 flex items-center justify-center text-slate-600 text-xs">📊</div>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Evaluated <span class="text-white font-semibold">4 strategic paths</span>. First principles analysis on growth levers; burn optimization, and runway extension.
              </p>
              <div class="flex gap-2">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">$1.8K <span class="font-normal text-slate-500 text-[10px]">burn</span></span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400">TBD <span class="font-normal text-slate-500 text-[10px]">revenue</span></span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">340K <span class="font-normal text-slate-500 text-[10px]">runway</span></span>
              </div>
            </div>
            <!-- Vertical progress bar -->
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-yellow-500" style="height: 48%" />
            </div>
          </div>

          <!-- HEY-SALES Card -->
          <div class="relative flex-shrink-0 w-80 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-blue-500 w-full" />
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[11px] font-bold tracking-widest text-orange-400">HEY-SALES</span>
                    <span class="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                      ● NEW
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500">AI Voice Qualification & CRM</p>
                </div>
                <div class="w-14 h-10 rounded bg-slate-800/60 flex items-center justify-center text-slate-600 text-xs">📞</div>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Just deployed. Awaiting <span class="text-white font-semibold">first inbound leads</span>. BANT qualification pipeline ready. Night guarız: no calls 20:00–...
              </p>
              <div class="flex gap-2">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400">+5m <span class="font-normal text-slate-500 text-[10px]">speed to lead</span></span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">+68% <span class="font-normal text-slate-500 text-[10px]">qualify</span></span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">+95% <span class="font-normal text-slate-500 text-[10px]">reach</span></span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-blue-500" style="height: 80%" />
            </div>
          </div>

        </div>
        <div class="mt-6 h-px bg-slate-900" />
      </section>

      <!-- COMMUNITY Group -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold tracking-widest text-blue-400">⬡ COMMUNITY</span>
            <span class="text-[10px] text-slate-600">Skool Engagement & Retention</span>
          </div>
          <span class="text-[10px] text-slate-700">1 agent</span>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-2">
          <div class="relative flex-shrink-0 w-80 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-blue-500 w-full" />
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[11px] font-bold tracking-widest text-blue-400">COMMUNITY</span>
                    <span class="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                      ● NEW
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500">Skool Engagement & Retention</p>
                </div>
                <div class="w-14 h-10 rounded bg-slate-800/60 flex items-center justify-center text-slate-600 text-xs">👥</div>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                First live cycle completed. Learning <span class="text-white font-semibold">Skool member tracking</span> — only top 30 visible; yearly subscribers need different churn signals.
              </p>
              <div class="flex gap-2">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400">&gt;90% <span class="font-normal text-slate-500 text-[10px]">retention</span></span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">+40% <span class="font-normal text-slate-500 text-[10px]">weekly active</span></span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">+12h <span class="font-normal text-slate-500 text-[10px]">avg session</span></span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-blue-500" style="height: 90%" />
            </div>
          </div>
        </div>
        <div class="mt-6 h-px bg-slate-900" />
      </section>

      <!-- MARKETING Group -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold tracking-widest text-yellow-500">⬡ MARKETING</span>
            <span class="text-[10px] text-slate-600">Content & Growth · Serves Both Teams</span>
          </div>
          <span class="text-[10px] text-slate-700">7 agents</span>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-2">

          <!-- YOUTUBE Card -->
          <div class="relative flex-shrink-0 w-72 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-red-500 w-full" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-red-400">YOUTUBE</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />ACTIVE
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Video Performance & Retention</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                TR content <span class="text-white font-semibold">+32% CTR</span>. Testing thumbnail variants. Retention drop at 4:20 mark identified.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">CTR 6.2%</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">AVD 8:40</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">52% ret.</span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-red-500" style="height: 62%" />
            </div>
          </div>

          <!-- REPURPOSE Card -->
          <div class="relative flex-shrink-0 w-72 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-purple-500 w-full" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-purple-400">REPURPOSE</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />ACTIVE
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Multi-Format Distribution</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Converting videos → Twitter threads. <span class="text-white font-semibold">3 pending approval</span>, 2 scheduled for publish.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">3 pending</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">2 live</span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-purple-500" style="height: 40%" />
            </div>
          </div>

          <!-- TWITTER Card -->
          <div class="relative flex-shrink-0 w-72 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-sky-500 w-full" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-sky-400">TWITTER</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />ACTIVE
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Outlier Growth & Engagement</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span class="text-white font-semibold">2 outlier posts</span> identified this week. Engagement rate 4.2%, impressions up 18%.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">4.2% eng.</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">+18% imp.</span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-sky-500" style="height: 55%" />
            </div>
          </div>

          <!-- LINKEDIN Card -->
          <div class="relative flex-shrink-0 w-72 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-blue-600 w-full" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-blue-500">LINKEDIN</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500">IDLE</span>
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Network & Content Growth</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span class="text-white font-semibold">+120 followers</span> this month. Avg. 28 comments/post. Long-form outperforming short.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">+120 follow</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">28 cmnt/post</span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-blue-600" style="height: 35%" />
            </div>
          </div>

          <!-- VISUALS Card -->
          <div class="relative flex-shrink-0 w-72 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-pink-500 w-full" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-pink-400">VISUALS</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />ACTIVE
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mb-2">SaaS Demo Animations & Metrics</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span class="text-white font-semibold">4 animations</span> in pipeline. Approval rate 75%. Dashboard graphs delivered.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400">4 in pipe</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">75% appr.</span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-pink-500" style="height: 75%" />
            </div>
          </div>

          <!-- GRAM BETA Card -->
          <div class="relative flex-shrink-0 w-72 bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer">
            <div class="h-0.5 bg-rose-500 w-full" />
            <div class="p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold tracking-widest text-rose-400">GRAM - BETA ADD</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">● NEW</span>
              </div>
              <p class="text-[10px] text-slate-500 mb-2">Instagram Beta Growth</p>
              <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                Audience research phase. Testing <span class="text-white font-semibold">reels-first</span> strategy. ICP mapping in progress.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">BETA</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">ICP research</span>
              </div>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1 bg-slate-900">
              <div class="absolute bottom-0 left-0 right-0 bg-rose-500" style="height: 15%" />
            </div>
          </div>

        </div>
      </section>

    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const activeTab = ref('heycalli');
const currentTime = ref('');
let clockInterval: ReturnType<typeof setInterval>;

const navTabs = [
  { id: 'heycalli',  label: 'HEYCALLI',  color: 'bg-yellow-400' },
  { id: 'community', label: 'COMMUNITY', color: 'bg-blue-400' },
  { id: 'marketing', label: 'MARKETING', color: 'bg-orange-400' },
  { id: 'operations',label: 'OPERATIONS',color: 'bg-slate-600' },
];

const totalAgents = computed(() => 11);
const activeAgents = computed(() => 8);

function updateClock() {
  currentTime.value = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  clearInterval(clockInterval);
});
</script>

<style scoped>
::-webkit-scrollbar { height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
</style>