# Swarm VSCode Bridge

Lokal workspace VSCode extension'ı. Swarm Panel'in bridge server'ı bu extension'a `ws://127.0.0.1:3001` üzerinden bağlanır; bu sayede panel:

- VSCode'da terminal açıp Claude Code CLI çalıştırabilir
- MCP araçlarını çağırabilir (Phase 6)
- Workspace dosyalarına okuma/yazma yapabilir

## Kurulum (Geliştirme)

```bash
# Bağımlılıkları yükle
pnpm install

# TypeScript build
pnpm --filter swarm-vscode-bridge build

# VSCode'u açıp F5 ile "Run Extension" debug
```

## Üretim Kurulumu (Şirket Içi)

```bash
# Extension'ı paketle
npx @vscode/vsce package

# Oluşan .vsix dosyasını VSCode'da:
# Extensions > "..." > Install from VSIX
```

## API Key Yapılandırması

İlk kurulumdan sonra Command Palette'ten:

- `Swarm: Köprüyü Bağla` — WS sunucusunu başlatır
- `Swarm: Köprüyü Kapat` — WS sunucusunu durdurur
- `Swarm: Paneli Tarayıcıda Aç` — Panel URL'sini açar

API key VSCode `SecretStorage`'da saklanır. Bridge server bu key ile handshake yapar.

## Güvenlik

- WS sunucusu **sadece** `127.0.0.1`'de dinler — harici IP'lerden bağlantı kabul edilmez
- API key `SecretStorage`'da, settings.json'a yazılmaz
- Tüm mesajlar yapılandırılmış JSON; bilinmeyen `type` reddedilir

## Phase Durumu

- **Phase 0**: ✅ İskelet ve handshake (`ping`)
- **Phase 6**: Terminal, Claude CLI, MCP handler'ları
