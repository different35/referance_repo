#!/usr/bin/env node

import fs from "fs";
import path from "path";

// Phase completion checklist
const phases = [
  {
    id: 0,
    name: "Monorepo Skeleton",
    files: [
      "package.json",
      "pnpm-workspace.yaml",
      "tsconfig.base.json",
      "docker-compose.yml",
      "Caddyfile",
      ".env.example",
    ],
    dirs: [
      "packages/server",
      "packages/web",
      "packages/shared",
      "tools/vscode-bridge",
    ],
  },
  {
    id: 1,
    name: "Authentication",
    files: [
      "packages/server/src/auth/auth.ts",
      "packages/web/src/pages/Login.vue",
    ],
    patterns: ["Better-Auth", "session", "JWT"],
  },
  {
    id: 2,
    name: "Database Schema",
    files: [
      "packages/server/src/db/schema.ts",
      "packages/server/src/db/client.ts",
    ],
    patterns: ["sqliteTable", "Drizzle", "users", "activities"],
  },
  {
    id: 3,
    name: "tRPC API",
    files: [
      "packages/server/src/trpc/routers/_app.ts",
      "packages/server/src/trpc/context.ts",
    ],
    patterns: ["router", "procedure", "protectedProcedure"],
  },
  {
    id: 4,
    name: "Live Updates",
    files: ["packages/server/src/services/activity.service.ts"],
    patterns: ["subscription", "EventEmitter", "tRPC"],
  },
];

function checkFileExists(filePath) {
  return fs.existsSync(path.join("/home/user/referance_repo", filePath));
}

function checkDirExists(dirPath) {
  try {
    const stats = fs.statSync(path.join("/home/user/referance_repo", dirPath));
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function checkPatternInFile(filePath, patterns) {
  try {
    const fullPath = path.join("/home/user/referance_repo", filePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return patterns.filter((p) => content.includes(p));
  } catch {
    return [];
  }
}

console.log("📊 Swarm Panel - Project Status Report\n");
console.log("=".repeat(60));

let completedPhases = 0;
let allIssues = [];

phases.forEach((phase) => {
  let phaseComplete = true;
  let phaseIssues = [];

  // Check files
  if (phase.files) {
    phase.files.forEach((file) => {
      if (!checkFileExists(file)) {
        phaseComplete = false;
        phaseIssues.push(`❌ Missing: ${file}`);
      }
    });
  }

  // Check directories
  if (phase.dirs) {
    phase.dirs.forEach((dir) => {
      if (!checkDirExists(dir)) {
        phaseComplete = false;
        phaseIssues.push(`❌ Missing directory: ${dir}`);
      }
    });
  }

  // Check patterns in files
  if (phase.patterns && phase.files) {
    phase.files.forEach((file) => {
      const foundPatterns = checkPatternInFile(file, phase.patterns);
      const missingPatterns = phase.patterns.filter(
        (p) => !foundPatterns.includes(p)
      );

      if (missingPatterns.length > 0 && checkFileExists(file)) {
        phaseIssues.push(
          `⚠️  Missing patterns in ${file}: ${missingPatterns.join(", ")}`
        );
      }
    });
  }

  const status = phaseComplete && phaseIssues.length === 0 ? "✅" : "⏸️ ";
  console.log(`\n${status} Phase ${phase.id}: ${phase.name}`);

  if (phaseIssues.length > 0) {
    phaseIssues.forEach((issue) => console.log(`   ${issue}`));
    allIssues.push(...phaseIssues);
  } else {
    console.log("   All checks passed!");
    completedPhases++;
  }
});

console.log("\n" + "=".repeat(60));
console.log(
  `\n📈 Progress: ${completedPhases}/${phases.length} phases complete\n`
);

if (allIssues.length > 0) {
  console.log("🔧 Issues to fix:\n");
  allIssues.forEach((issue) => console.log(`   ${issue}`));
} else {
  console.log("✅ All phases complete!");
}

// Recommendations
console.log(
  "\n💡 Next step based on agent system:\n   npm run --prefix tools/agents run:orchestrator\n"
);

process.exit(completedPhases === phases.length ? 0 : 1);
