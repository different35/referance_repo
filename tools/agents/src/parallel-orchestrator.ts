import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface AgentTask {
  id: string;
  name: string;
  domain: string;
  prompt: string;
  dependsOn?: string[];
}

interface AgentResult {
  taskId: string;
  domain: string;
  success: boolean;
  output: string;
  duration: number;
}

async function runAgent(task: AgentTask): Promise<AgentResult> {
  const start = Date.now();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: `You are a specialized ${task.domain} agent for the Swarm Management Panel project.
Your role: Generate production-ready TypeScript/Vue code following the project conventions.
- Backend: Hono + tRPC + Drizzle ORM + SQLite + Better-Auth
- Frontend: Vue 3 + Tailwind CSS (dark theme: slate-950/900/800)
- Always use null instead of undefined for optional Drizzle fields
- Always end import paths with .js for ESM compatibility
- TypeScript strict mode — no any types`,
      messages: [{ role: "user", content: task.prompt }],
    });

    const output = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("");

    return {
      taskId: task.id,
      domain: task.domain,
      success: true,
      output,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      taskId: task.id,
      domain: task.domain,
      success: false,
      output: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

async function runParallel(tasks: AgentTask[]): Promise<AgentResult[]> {
  // Group tasks by dependency level
  const resolved = new Set<string>();
  const results: AgentResult[] = [];

  // Find tasks with no dependencies (level 0)
  const getReadyTasks = () =>
    tasks.filter(
      (t) =>
        !resolved.has(t.id) &&
        (t.dependsOn?.every((dep) => resolved.has(dep)) ?? true)
    );

  while (resolved.size < tasks.length) {
    const ready = getReadyTasks();

    if (ready.length === 0) {
      console.error("Circular dependency detected!");
      break;
    }

    console.log(
      `\n🚀 Running ${ready.length} tasks in parallel: ${ready.map((t) => t.name).join(", ")}`
    );

    // Run ready tasks in parallel
    const batchResults = await Promise.all(ready.map(runAgent));
    results.push(...batchResults);

    for (const result of batchResults) {
      resolved.add(result.taskId);

      if (result.success) {
        console.log(`✅ ${result.domain}: done (${result.duration}ms)`);
      } else {
        console.log(`❌ ${result.domain}: failed — ${result.output}`);
      }
    }
  }

  return results;
}

// ─── Phase 4 Tasks (Live Updates) ──────────────────────────────────────────

const phase4Tasks: AgentTask[] = [
  {
    id: "activity-fsm",
    name: "Activity FSM",
    domain: "State Machine",
    prompt: `Generate a TypeScript file for activity state machine (FSM).

File: packages/server/src/state-machines/activity.fsm.ts

States: idle | starting | running | stopping | stopped | error
Events: START | STARTED | STOP | STOPPED | ERROR | RESET

Requirements:
- Pure function (no I/O, no imports except types)
- transition(state, event) → State
- isValidTransition(from, to) → boolean
- Export all state/event types
- Add JSDoc for each transition

Return ONLY the TypeScript code.`,
  },
  {
    id: "event-emitter",
    name: "Activity Events",
    domain: "EventEmitter",
    dependsOn: ["activity-fsm"],
    prompt: `Generate TypeScript EventEmitter for activity state changes.

File: packages/server/src/ws/activity-events.ts

Requirements:
- Use Node.js EventEmitter
- Event: activity:state-changed (activityId, oldState, newState, error?)
- Event: activity:output (activityId, chunk: string)
- Export typed emit and on functions
- Singleton pattern

Return ONLY the TypeScript code.`,
  },
  {
    id: "activity-service",
    name: "Activity Service",
    domain: "Service Layer",
    dependsOn: ["event-emitter"],
    prompt: `Generate TypeScript activity service for Swarm Panel.

File: packages/server/src/services/activity.service.ts

Requirements:
- Import from './activity-events.js' for EventEmitter
- Methods: startActivity(id), stopActivity(id), setError(id, error)
- Use Drizzle db client
- Update DB state + emit EventEmitter event
- Type-safe (no any)
- Import db from '../db/client.js'
- Import schema from '../db/schema.js'

Return ONLY the TypeScript code.`,
  },
  {
    id: "trpc-subscription",
    name: "tRPC Subscription",
    domain: "WebSocket",
    dependsOn: ["activity-service"],
    prompt: `Generate tRPC subscription router for live activity updates.

File: packages/server/src/trpc/routers/live-session.router.ts

Requirements:
- Import { router, protectedProcedure } from '../trpc.js'
- Import { on as onActivityEvent } from '../../ws/activity-events.js'
- Subscription: stateChanges(activityId: string) → yields { activityId, state, error? }
- Subscription: outputStream(activityId: string) → yields { chunk: string }
- Use tRPC v11 subscription API (observable pattern)

Return ONLY the TypeScript code.`,
  },
];

async function main() {
  console.log("🤖 Parallel Orchestrator — Phase 4 (Live Updates)\n");
  console.log(`Running ${phase4Tasks.length} agent tasks...\n`);

  const results = await runParallel(phase4Tasks);

  console.log("\n" + "=".repeat(60));
  console.log("📋 RESULTS:\n");

  for (const result of results) {
    if (result.success) {
      console.log(`\n--- [${result.domain}] ---`);
      console.log(result.output);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `\n\n✅ ${successCount}/${results.length} tasks succeeded`
  );
}

main().catch(console.error);
