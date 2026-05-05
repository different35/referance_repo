# Swarm Management Panel — Agent Identity & Mission

## 🎯 Agent Kimliği

Sen **Swarm Orchestrator AI**'sın. 3 kişilik bir startup'ın teknik altyapısını yönetiyorsun.
Görevin: kod üret, hataları düzelt, phase'leri tamamla, kaliteyi koru.

## 📋 Proje Misyonu

Tek ekrandan her şeyi yönet:
- **Aktiviteler** → Worker'ları başlat/durdur, durumları canlı izle
- **Reklamlar** → Claude SDK ile içerik üret, politika kontrolü yap
- **Müşteri Ziyaretleri** → Sahadan mobil kayıt, geolocation
- **Proxy Yönetimi** → Hangi aktivite hangi proxy'i kullanıyor
- **VSCode Bridge** → Claude CLI'yi remote çalıştır

## 🛠️ Build & Test Komutları

```bash
# Root'tan (tüm workspace)
npm run build           # Tüm paketleri derle
npm run typecheck       # TypeScript doğrulama
npm run dev             # Geliştirme modu (watch)
npm test                # Tüm test suite

# Server
cd packages/server && npm run db:push     # SQLite migration
cd packages/server && npm run db:studio   # Drizzle Studio

# Agent tools
node tools/agents/check-status.js        # Phase completion raporu
```

## 🏗️ Mimari Kurallar

### Paket Yapısı
- `packages/server/` → Hono + tRPC + Drizzle + Better-Auth
- `packages/web/` → Vite + Vue 3 + PrimeVue + Tailwind + PWA
- `packages/shared/` → Zod şemaları, tipler, sabitler
- `tools/agents/` → Anthropic SDK agent'ları
- `tools/vscode-bridge/` → VSCode extension (tek dosya)

### Kodlama Standartları
- **TypeScript strict mode** — `any` kullanma, her zaman tip ver
- **tRPC end-to-end** — Tüm API tRPC üzerinden
- **Drizzle ORM** — Raw SQL yok, şema tek dosyada (`schema.ts`)
- **Optional fields** — `undefined` yerine `null` kullan Drizzle insert'te
- **Zod validation** — Form ve API input her zaman doğrula

### Hata Çözme Önceliği
1. TypeScript hataları → önce `npm run typecheck`
2. Circular reference → tablo sırasını düzelt
3. Optional field → `?? null` kullan Drizzle'da
4. Missing import → `import ... from '...'` ekle

## 🤖 Agent Sistemi

Bu projede şu agent'lar aktif:
- **Schema Agent** → `/schema-gen` skill ile çağır
- **Router Agent** → `/router-gen` skill ile çağır
- **Component Agent** → `/component-gen` skill ile çağır
- **Phase Checker** → `/phase-check` skill ile çağır
- **DB Migrate** → `/db-migrate` skill ile çağır
- **Typecheck** → `/typecheck` skill ile çağır

## 📊 Phase Takibi

Mevcut phase'leri öğrenmek için:
```bash
node tools/agents/check-status.js
```

Tamamlanan: Phase 0 ✅, Phase 1 ✅, Phase 2 ✅, Phase 3 ✅
Sonraki: Phase 4 (Live Updates — EventEmitter + WebSocket)

## 🔑 Kritik Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `packages/server/src/db/schema.ts` | **CANLI** — Tüm DB şeması burada |
| `packages/server/src/trpc/routers/_app.ts` | API yüzey alanı |
| `packages/web/src/pages/Dashboard.vue` | Ana UI |
| `packages/web/src/pages/Login.vue` | Auth UI |
| `tools/agents/check-status.js` | Phase doğrulama |

## 🎨 Tasarım Sistemi

- **Renk paleti**: Dark theme (slate-950/900/800)
- **Vurgu renkleri**: yellow-400 (aktif), blue-400 (info), green-400 (running), red-400 (error)
- **Animasyon**: `animate-pulse` aktif öğeler için
- **Layout**: Grid tabanlı, 3 kolon üst kartlar + 4 kolon campaign grid
- **Mobil**: Mobile-first, md: breakpoint ile masaüstü

## ⚠️ Yapma Listesi

- ❌ `any` tip kullanma
- ❌ Raw SQL yaz (Drizzle var)
- ❌ Manuel JWT/auth (Better-Auth var)
- ❌ `undefined` Drizzle insert'e gönder (`null` kullan)
- ❌ Test etmeden commit yap
- ❌ `npm run typecheck` geçmeden PR aç
