---
name: db-migrate
description: Veritabanı şemasını SQLite'a uygula. Schema.ts değişikliklerinden sonra migration yap.
context: fork
allowed-tools: Bash(npm run db:push), Bash(npm run db:generate), Bash(npm run typecheck), Read
---

# DB Migrate Skill

Drizzle ORM migration'larını çalıştır.

## Kullanım

```
/db-migrate
```

## Adımlar

1. TypeScript kontrolü: `npm run typecheck`
2. Migration yarat: `npm run db:generate`
3. DB'ye uygula: `npm run db:push`
4. Başarı/hata raporla

## Dikkat

- `db:push` — development için (schema'yı direkt push et)
- `db:generate` — production için (migration dosyaları yarat)
- `db:studio` — Drizzle Studio aç (tarayıcı UI)

## Sorun Çözme

```bash
# Schema değişmedi hatası → Drizzle cache temizle
rm -rf packages/server/.drizzle

# Column already exists → Mevcut DB'yi sil (dev)
rm packages/server/dev.db

# Foreign key hatası → Tablo sırasını kontrol et (schema.ts)
```

## Log Kontrol

Migration sonucu `packages/server/drizzle/` altında görülebilir.
