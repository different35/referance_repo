---
name: router-gen
description: tRPC router ve procedure oluştur. Yeni API endpoint, mutation veya subscription eklemek istediğinde kullan.
context: fork
allowed-tools: Read, Write, Edit, Bash(npm run typecheck)
---

# Router Generator Skill

`packages/server/src/trpc/routers/` altında yeni router dosyaları oluştur.

## Kullanım

```
/router-gen <domain> query:<isim> mutation:<isim> subscription:<isim>
```

## Adımlar

1. `packages/server/src/trpc/trpc.ts` oku (mevcut procedure'lar)
2. `packages/server/src/db/schema.ts` oku (tablo tipler)
3. Router dosyasını yaz `<domain>.router.ts` olarak
4. `_app.ts`'ye import ekle
5. TypeScript kontrolü: `npm run typecheck`

## Router Şablonu

```typescript
import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const xyzRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { ... }),
  create: protectedProcedure.input(z.object({ ... })).mutation(async ({ ctx, input }) => { ... }),
});
```

## Kurallar

- `undefined` → `null` dönüştür (`?? null`) Drizzle insert'te
- `crypto.randomUUID()` kullan ID için
- Her public endpoint `publicProcedure`, auth gereken `protectedProcedure`
- Role kontrolü: `requireRole('admin')`
