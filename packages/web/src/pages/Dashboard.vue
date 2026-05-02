<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold">Swarm Panel</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">
          Faaliyet, reklam ve müşteri ziyareti yönetimi
        </p>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <template #title>Faaliyetler</template>
          <template #content>
            <p class="text-slate-600 dark:text-slate-400">
              Phase 2'de eklenecek
            </p>
          </template>
        </Card>

        <Card>
          <template #title>Reklam Yönetimi</template>
          <template #content>
            <p class="text-slate-600 dark:text-slate-400">
              Phase 7'de eklenecek
            </p>
          </template>
        </Card>

        <Card>
          <template #title>Müşteri Ziyaretleri</template>
          <template #content>
            <p class="text-slate-600 dark:text-slate-400">
              Phase 9'da eklenecek
            </p>
          </template>
        </Card>
      </div>

      <div class="mt-8">
        <Card>
          <template #title>Sistem Durumu</template>
          <template #content>
            <div class="flex items-center gap-2">
              <i class="pi pi-circle-fill text-green-500" />
              <span>Phase 0 — İskelet hazır</span>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
