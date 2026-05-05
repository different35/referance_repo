#!/usr/bin/env node
// Stop hook: Oturum bitince phase durumunu göster
import { execSync } from "child_process";
import process from "process";

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    // Uncommitted changes varsa uyar
    const status = execSync("git status --porcelain", {
      cwd: "/home/user/referance_repo",
    })
      .toString()
      .trim();

    if (status.length > 0) {
      process.stderr.write(
        `\n⚠️  [Session End] Uncommitted changes detected:\n${status}\n`
      );
      process.stderr.write(
        `   Run: git add -A && git commit -m "WIP: session changes"\n\n`
      );
    } else {
      process.stderr.write(`\n✅ [Session End] Working tree clean\n\n`);
    }
  } catch {
    // git hatası — sessizce geç
  }
  process.exit(0);
});
