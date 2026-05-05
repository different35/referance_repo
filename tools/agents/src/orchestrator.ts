import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "fs";

interface Phase {
  id: number;
  name: string;
  description: string;
  expectedOutcome: string;
  estimatedDays: number;
}

const PHASES: Phase[] = [
  {
    id: 0,
    name: "Monorepo Skeleton",
    description: "Setup monorepo with Docker Compose and Caddy",
    expectedOutcome: "docker compose up works with empty app",
    estimatedDays: 1,
  },
  {
    id: 1,
    name: "Authentication",
    description: "Implement Better-Auth with login UI and route guards",
    expectedOutcome: "Users can login and access protected routes",
    estimatedDays: 2,
  },
  {
    id: 2,
    name: "Database Schema",
    description: "Setup Drizzle ORM with SQLite and core tables",
    expectedOutcome: "Activity CRUD works, FSM transitions track state",
    estimatedDays: 3,
  },
  {
    id: 3,
    name: "Live State Updates",
    description: "Implement tRPC subscriptions with EventEmitter",
    expectedOutcome: "Activity state changes push to clients in real-time",
    estimatedDays: 2,
  },
  {
    id: 4,
    name: "Process Management",
    description: "Spawn workers with execa and stream terminal output",
    expectedOutcome: "LiveTerminal renders real command output",
    estimatedDays: 2,
  },
];

async function verifyPhase(
  client: Anthropic,
  phase: Phase
): Promise<boolean> {
  const prompt = `
Verify if Phase ${phase.id} "${phase.name}" is complete.

Expected outcome: ${phase.expectedOutcome}

Check these indicators:
1. Required files exist with correct structure
2. No obvious TypeScript errors
3. Expected functionality is implemented (not just stubs)
4. No broken imports or missing dependencies

Examine:
- /home/user/referance_repo/packages/server/src
- /home/user/referance_repo/packages/web/src
- /home/user/referance_repo/docker-compose.yml

Return ONLY a JSON object:
{
  "complete": boolean,
  "confidence": 0-100,
  "evidence": ["specific file paths or code that proves completion"],
  "blockers": ["list any missing pieces"]
}
`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("");

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return result.complete && result.confidence > 60;
    }
  } catch (e) {
    console.log("Parse error:", e);
  }

  return false;
}

async function main() {
  const client = new Anthropic();

  console.log("🚀 Swarm Panel - Phase Verification\n");
  console.log("Checking project completion status...\n");

  let completedPhases = 0;
  let totalProgress = 0;

  for (const phase of PHASES) {
    process.stdout.write(`Phase ${phase.id} (${phase.name})... `);

    const isComplete = await verifyPhase(client, phase);

    if (isComplete) {
      console.log("✅ COMPLETE");
      completedPhases++;
    } else {
      console.log("⏸️  INCOMPLETE");
    }

    totalProgress += phase.estimatedDays;
  }

  const estimatedComplete = PHASES.slice(completedPhases).reduce(
    (sum, p) => sum + p.estimatedDays,
    0
  );

  console.log(`\n📊 Progress: ${completedPhases}/${PHASES.length} phases`);
  console.log(
    `⏱️  Estimated ${estimatedComplete} more business days to MVP\n`
  );

  if (completedPhases < PHASES.length) {
    const nextPhase = PHASES[completedPhases];
    console.log(`🎯 Next Phase: ${nextPhase.name}`);
    console.log(`   Description: ${nextPhase.description}`);
    console.log(`   Expected outcome: ${nextPhase.expectedOutcome}\n`);

    console.log("Recommendations:");
    console.log("1. Use dedicated agents for each domain (Schema, Router, Component)");
    console.log("2. Run verification after each phase");
    console.log("3. Commit working code, even if incomplete\n");
  }
}

main().catch(console.error);
