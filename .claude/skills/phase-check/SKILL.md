---
name: phase-check
description: Proje phase'lerinin tamamlanıp tamamlanmadığını kontrol et. İlerleme raporu al, sonraki adımları öğren.
context: fork
allowed-tools: Bash(node tools/agents/check-status.js), Bash(npm run typecheck), Bash(git status), Read
---

# Phase Check Skill

Projenin hangi aşamada olduğunu ve ne yapılması gerektiğini kontrol et.

## Kullanım

```
/phase-check
```

## Adımlar

1. `node tools/agents/check-status.js` çalıştır
2. TypeScript durumunu kontrol et: `npm run typecheck`
3. Git durumunu kontrol et: `git status`
4. Phase raporunu üret:
   - Tamamlanan phase'ler (kanıt ile)
   - Eksik parçalar
   - Sonraki adım

## Phase Listesi

| Phase | İçerik | Beklenen Sonuç |
|-------|---------|----------------|
| 0 | Monorepo iskelet | `docker compose up` çalışır |
| 1 | Better-Auth + Login | Kullanıcı giriş yapabilir |
| 2 | DB Schema | Tüm tablolar Drizzle'da tanımlı |
| 3 | tRPC Routers | Activity/Mission/Proxy API'ları çalışır |
| 4 | Live Updates | WebSocket subscriptions aktif |
| 5 | Process Spawn | Terminal output gerçek zamanlı |
| 6 | Proxy Control | Aktivite başına proxy |
| 7 | Ads Module | Claude SDK ile içerik üretimi |
| 8 | PWA | Telefona kurulabilir |
| 9 | Customer Visits | Saha ziyaret kaydı |
| 10 | Reports | Dashboard widgets, grafikler |
| 11 | Settings | API key, audit log UI |
| 12 | Deploy | Docker + CI/CD |

## Çıktı Formatı

```
📊 Phase Durumu: 4/12 tamamlandı
✅ Phase 0-3 complete
⏳ Phase 4 (Live Updates) — SONRAKI
❌ Phase 5-12 — BEKLEMEDE

TypeScript: ✅ GEÇTI (0 hata)
Git: ✅ Clean (uncommitted yok)
```
