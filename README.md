# Swarm Panel

3 kişilik ekibin müşteri ziyareti yönetimi, reklam üretimi, faaliyet (swarm) orkestrasyonu ve Claude Code (VSCode) entegrasyonunu tek noktada toplayan **mobile-first PWA** yönetim paneli.

## Özellikler

- **Mobile-first PWA** — Telefondan da masaüstünden de aynı uygulama
- **End-to-end tip güvenliği** — tRPC v11 ile API uyumsuzluk hataları imkânsız
- **Faaliyet (Swarm) Orkestrasyonu** — start/stop/select-mission/report/proxy on-off/live-session
- **Reklam Yönetimi** — Claude API ile içerik üretimi, politika kontrolü, ROI tahmini, yayın
- **Müşteri Ziyareti** — Geolocation, foto ve sesli not desteği
- **VSCode Köprüsü** — Claude Code CLI ve MCP araçlarına erişim
- **Self-hostable** — Docker Compose + Caddy ile tek komutla deploy

## Tech Stack

| Katman | Seçim |
|---|---|
| Frontend | Vite + Vue 3 + TypeScript + PrimeVue + Tailwind |
| PWA | vite-plugin-pwa + Workbox |
| API | tRPC v11 |
| Backend | Node.js + Hono |
| ORM | Drizzle ORM |
| DB | SQLite (better-sqlite3) |
| Auth | Better-Auth |
| Real-time | tRPC subscriptions (WebSocket) |
| Deployment | Docker Compose + Caddy |

## Repo Yapısı

```
swarm-panel/
├── packages/
│   ├── server/          # Hono + tRPC + Drizzle backend
│   ├── web/             # Vite + Vue 3 + PrimeVue PWA frontend
│   └── shared/          # Zod şemaları, ortak tipler
├── tools/
│   └── vscode-bridge/   # Lokal VSCode extension (workspace)
├── docker-compose.yml
├── Caddyfile
└── .env.example
```

## Geliştirme

### Önkoşullar

- Node.js >= 20.10.0
- pnpm >= 9.0.0
- Docker + Docker Compose (deploy için)

### Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# .env dosyasını oluştur
cp .env.example .env
# .env içindeki değerleri doldur (özellikle BETTER_AUTH_SECRET ve ANTHROPIC_API_KEY)

# Veritabanı şemasını oluştur
pnpm db:push

# Geliştirme sunucularını başlat (server + web paralel)
pnpm dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### Komutlar

```bash
pnpm dev              # Tüm paketleri parallel dev modunda çalıştır
pnpm dev:server       # Sadece backend
pnpm dev:web          # Sadece frontend
pnpm build            # Üretim build'i
pnpm typecheck        # TypeScript kontrolü
pnpm lint             # ESLint
pnpm test             # Unit testler (Vitest)
pnpm test:e2e         # E2E testler (Playwright)
pnpm db:push          # Drizzle şemayı DB'ye uygula
pnpm db:studio        # Drizzle Studio (DB GUI)
pnpm docker:up        # Docker Compose ile prod-benzeri başlat
```

## Deployment

### Docker Compose (Self-hosted)

```bash
# .env dosyasını üretim değerleriyle doldur (PUBLIC_DOMAIN, BETTER_AUTH_SECRET, vb.)
cp .env.example .env
nano .env

# Build ve başlat
docker compose up -d
```

Caddy otomatik HTTPS sertifikası alır (Let's Encrypt). DNS A kaydı `PUBLIC_DOMAIN` değerini sunucu IP'sine yönlendirmelidir.

## Mimari

Detaylı plan: bkz. `/root/.claude/plans/ben-yle-bir-ey-istiyorum-refactored-quasar.md`

## Lisans

Özel — şirket içi kullanım.
