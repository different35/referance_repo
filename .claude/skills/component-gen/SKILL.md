---
name: component-gen
description: Vue 3 SFC bileşen oluştur. Dark theme, Tailwind CSS, PrimeVue kullanarak yeni sayfa veya bileşen ekle.
context: fork
allowed-tools: Read, Write, Bash(npm run typecheck)
---

# Component Generator Skill

`packages/web/src/` altında Vue 3 bileşenleri oluştur.

## Kullanım

```
/component-gen <ComponentName> <açıklama>
```

## Adımlar

1. `packages/web/src/pages/Dashboard.vue` oku (stil referans)
2. Component dosyasını yaz
3. Dark theme tasarımı uygula
4. Props ve emits tanımla
5. Vue 3 `<script setup lang="ts">` kullan

## Tasarım Sistemi

```
bg-slate-950  → Sayfa arkaplanı
bg-slate-900  → Kart arkaplanı
bg-slate-800  → Input, hover
border-slate-800 → Kart kenarlık

yellow-400    → Aktif, vurgu
blue-400      → Info, linkler
green-400     → Running, success (animate-pulse ile)
red-400       → Error, stop
orange-400    → Warning, key-sales
```

## Bileşen Şablonu

```vue
<template>
  <div class="bg-slate-900 rounded-lg border border-slate-800 p-6">
    <!-- İçerik -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  action: [value: string];
}>();
</script>
```

## Sayfa Yapısı

- `pages/` → Tam sayfa bileşenler (route'a bağlı)
- `components/activity/` → Aktivite bileşenleri
- `components/ads/` → Reklam bileşenleri
- `components/customer/` → Müşteri ziyaret bileşenleri
- `components/shared/` → Genel paylaşılan bileşenler

## Bileşen Listesi (oluşturulacaklar)

- [ ] ActivityCard.vue — durum badge, start/stop butonları
- [ ] ActivityStateChip.vue — renk-kodlu durum göstergesi
- [ ] LiveTerminal.vue — xterm.js terminal
- [ ] ProxyToggle.vue — proxy on/off switch
- [ ] AdWorkflowStepper.vue — reklam üretim adımları
- [ ] VisitCheckIn.vue — müşteri ziyaret giriş formu
