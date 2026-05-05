#!/usr/bin/env node
// PostToolUse hook: .ts dosyası yazılınca typecheck çalıştır
import { execSync } from "child_process";
import process from "process";

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);
    const path = event?.tool_input?.file_path || "";

    // Sadece .ts ve .vue dosyaları için
    if (!path.endsWith(".ts") && !path.endsWith(".vue")) {
      process.exit(0);
    }

    // packages/ altındaki dosyalar için typecheck
    if (!path.includes("/packages/")) {
      process.exit(0);
    }

    // Sadece output ver, bloklama
    process.stderr.write(`[Hook] TypeScript dosyası yazıldı: ${path}\n`);
  } catch {
    // JSON parse hatası — devam et
  }
  process.exit(0);
});
