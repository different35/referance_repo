---
name: typecheck
description: TypeScript derleme hatalarını kontrol et ve düzelt. Commit öncesi zorunlu çalıştır.
context: fork
allowed-tools: Bash(npm run typecheck), Read, Edit
---

# TypeScript Check Skill

Tüm workspace'te TypeScript hatalarını kontrol et ve düzelt.

## Kullanım

```
/typecheck
```

## Adımlar

1. `npm run typecheck` çalıştır (root seviyesinde)
2. Hataları kategorize et:
   - **Type errors** → tip tanımları eksik/yanlış
   - **Optional field** → `undefined` yerine `null` kullan
   - **Import errors** → dosya yolu veya export sorunu
   - **Circular ref** → tablo sırası sorunu
3. Her hatayı düzelt
4. Tekrar kontrol et

## Yaygın Hatalar & Çözümleri

```
Error: undefined is not assignable to null
Fix: input.field ?? null

Error: implicitly has type 'any'
Fix: Define explicit type

Error: Circular reference
Fix: Reorder table declarations (dependency first)

Error: Cannot find module
Fix: Check import path ends with .js for ESM
```

## Başarı Kriteri

```bash
$ npm run typecheck
# Çıktı yok = 0 hata = ✅ Geçti
```
