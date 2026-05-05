---
name: schema-gen
description: Drizzle ORM şema tabloları oluştur. Yeni tablo, alan veya ilişki eklemek istediğinde kullan.
context: fork
allowed-tools: Read, Edit, Write, Bash(npm run typecheck)
---

# Schema Generator Skill

Mevcut şema dosyasını oku ve yeni Drizzle tabloları ekle.

## Kullanım

```
/schema-gen <tablo_adı> <alan1:tip> <alan2:tip> ...
```

## Adımlar

1. `packages/server/src/db/schema.ts` oku
2. Mevcut tablo yapısını analiz et
3. Yeni tablo için Drizzle SQLite kodu yaz
4. Foreign key'leri doğrula (circular reference yok)
5. `null` kullan `undefined` yerine optional alanlar için
6. `npm run typecheck` çalıştır
7. Hata varsa düzelt

## Kurallar

- ID: `text('id').primaryKey()`
- Timestamps: `integer('...', { mode: 'timestamp_ms' }).notNull().default(now)`
- Boolean: `integer('...', { mode: 'boolean' })`
- JSON: `text('...', { mode: 'json' }).$type<T>()`
- Enum: `text('...', { enum: ['a', 'b'] })`
- FK: `.references(() => table.id, { onDelete: 'cascade' })`

## Mevcut Tablolar (referans)

- users, sessions, accounts, verifications, apiKeys, auditLogs
- missions, activities, proxyProfiles, ads, customerVisits
