<template>
  <div class="min-h-screen bg-slate-950 text-white p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Swarm Panel</h1>
      <p class="text-slate-400">Real-time Activity Management</p>
    </div>

    <!-- Top 3 Cards: Strategist, Key-Sales, Community -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <!-- Strategist Card -->
      <div class="bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-slate-700 transition">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-yellow-400 text-sm font-semibold mb-1">STRATEGIST</h3>
            <p class="text-slate-400 text-xs">A strategic path first principles analysis on growth levers, tech infrastructure, and revenue extension.</p>
          </div>
          <div class="w-16 h-16 bg-blue-500 rounded opacity-20"></div>
        </div>
        <div class="flex gap-3 text-xs">
          <span class="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded">$1.8M</span>
          <span class="px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 rounded">TBD</span>
          <span class="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded">100K</span>
        </div>
      </div>

      <!-- Key-Sales Card -->
      <div class="bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-slate-700 transition">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-orange-400 text-sm font-semibold mb-1">KEY-SALES</h3>
            <p class="text-slate-400 text-xs">Just deployed. Awaiting first inbound leads. SAAS qualification pipeline ready, high-touch to cold 20-50...</p>
          </div>
          <div class="w-16 h-16 bg-orange-500 rounded opacity-20"></div>
        </div>
        <div class="text-xs text-orange-400">+98% <span class="text-slate-400">sales velocity</span></div>
      </div>

      <!-- Community Card -->
      <div class="bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-slate-700 transition">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-blue-400 text-sm font-semibold mb-1">COMMUNITY</h3>
            <p class="text-slate-400 text-xs">First cycle completed. Launch: blood member tracking — only to 50 hubside.</p>
          </div>
          <div class="w-16 h-16 bg-blue-600 rounded opacity-20"></div>
        </div>
        <div class="flex gap-3 text-xs">
          <span class="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded">+88%</span>
          <span class="px-2 py-1 bg-slate-700 bg-opacity-40 text-slate-300 rounded">+1.2k</span>
        </div>
      </div>
    </div>

    <!-- Marketing Section -->
    <div class="mb-12">
      <h2 class="text-yellow-400 text-lg font-bold mb-6 flex items-center gap-2">
        <span class="w-2 h-2 bg-yellow-400 rounded-full"></span>
        MARKETING
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Active Campaign 1 -->
        <div class="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-xs text-slate-400">ACTIVE</span>
          </div>
          <h4 class="text-sm font-semibold mb-3">Campaign A</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span>Progress</span>
              <span class="text-slate-400">65%</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-1.5">
              <div class="bg-green-500 h-1.5 rounded-full" style="width: 65%"></div>
            </div>
          </div>
        </div>

        <!-- Active Campaign 2 -->
        <div class="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-xs text-slate-400">ACTIVE</span>
          </div>
          <h4 class="text-sm font-semibold mb-3">Campaign B</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span>Progress</span>
              <span class="text-slate-400">42%</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-1.5">
              <div class="bg-blue-500 h-1.5 rounded-full" style="width: 42%"></div>
            </div>
          </div>
        </div>

        <!-- Inactive Campaign -->
        <div class="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="w-3 h-3 bg-slate-600 rounded-full"></span>
            <span class="text-xs text-slate-400">IDLE</span>
          </div>
          <h4 class="text-sm font-semibold mb-3">Campaign C</h4>
          <p class="text-xs text-slate-500">Ready to deploy</p>
        </div>

        <!-- Add Campaign Button -->
        <div class="bg-slate-900 rounded-lg border border-slate-700 border-dashed p-4 flex items-center justify-center hover:border-slate-600 cursor-pointer transition">
          <div class="text-center">
            <span class="text-2xl text-slate-600 mb-2">+</span>
            <p class="text-xs text-slate-500">Add Campaign</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activities Section -->
    <div>
      <h2 class="text-blue-400 text-lg font-bold mb-6 flex items-center gap-2">
        <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
        ACTIVITIES
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div class="flex justify-between items-start mb-3">
            <h4 class="font-semibold">Web Scraper #1</h4>
            <span class="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded">RUNNING</span>
          </div>
          <div class="text-sm text-slate-400 mb-3">Mission: DataCollection</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded transition">Pause</button>
            <button class="px-3 py-1 text-xs bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 rounded transition">Stop</button>
          </div>
        </div>

        <div class="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div class="flex justify-between items-start mb-3">
            <h4 class="font-semibold">Ad Publisher #2</h4>
            <span class="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 text-xs rounded">IDLE</span>
          </div>
          <div class="text-sm text-slate-400 mb-3">Mission: AdManagement</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-xs bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30 rounded transition">Start</button>
            <button class="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded transition">Config</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Check auth and redirect to login if needed
  const isAuth = localStorage.getItem('auth_token');
  if (!isAuth) {
    router.push('/login');
  }
});
</script>

<style scoped>
/* Dark theme optimizations */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}
::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}
</style>
