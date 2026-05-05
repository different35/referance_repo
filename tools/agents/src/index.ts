#!/usr/bin/env node

import { readFileSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function runPhaseVerification() {
  console.log("🚀 Swarm Panel - Automated Development System\n");
  console.log("Available agents:");
  console.log("  npm run run:orchestrator  - Verify phase completion & progress");
  console.log("  npm run run:schema        - Generate DB schema tables");
  console.log("  npm run run:router        - Generate tRPC routes");
  console.log("  npm run run:component     - Generate Vue components\n");

  console.log("Quick start:");
  console.log("1. npm run run:orchestrator     (check current status)");
  console.log("2. npm run run:schema           (generate tables)");
  console.log("3. npm run run:router           (generate API routes)");
  console.log("4. npm run run:component        (generate UI components)\n");

  console.log("System status check...");

  const currentPhase = 0;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `The Swarm Management Panel project is at Phase ${currentPhase} (Monorepo Skeleton).

        This is a multi-agent development system using Anthropic's models to automate:
        - Database schema generation (Drizzle ORM)
        - tRPC API routes
        - Vue 3 components
        - Phase verification and progress tracking

        What's the next immediate action to progress beyond Phase 0?`,
      },
    ],
  });

  console.log(
    "\n📝 Recommendation:\n",
    response.content
      .filter((c) => c.type === "text")
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
  );
}

runPhaseVerification().catch(console.error);
