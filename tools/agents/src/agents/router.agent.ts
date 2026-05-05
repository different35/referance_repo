import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "fs";

const client = new Anthropic();

interface RouterTask {
  name: string;
  description: string;
  procedures: Array<{
    name: string;
    type: "query" | "mutation" | "subscription";
    description: string;
    input?: string;
    output?: string;
  }>;
}

async function generateRouterCode(task: RouterTask): Promise<string> {
  const prompt = `You are a tRPC v11 API expert.

Generate a tRPC router file for: ${task.name}

Description: ${task.description}

Procedures to implement:
${task.procedures
  .map(
    (p) =>
      `- ${p.name} (${p.type}): ${p.description}${p.input ? `\n  Input: ${p.input}` : ""}${p.output ? `\n  Output: ${p.output}` : ""}`
  )
  .join("\n")}

Requirements:
1. Use export const ${task.name}Router = router({ ... })
2. Import { router, publicProcedure, protectedProcedure } from '../trpc.js'
3. Use z.object() for input validation (Zod)
4. Return proper TypeScript types
5. Add proper error handling
6. Add role-based access control where needed
7. Return ONLY the TypeScript router code (no imports needed in the output)

Follow the pattern of existing routers.`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((c) => c.type === "text")
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("");
}

async function main() {
  console.log("🛣️  Router Agent - Generating tRPC routes\n");

  const routerTasks: RouterTask[] = [
    {
      name: "activity",
      description: "Activity CRUD and control operations",
      procedures: [
        {
          name: "list",
          type: "query",
          description: "List all activities with filters",
          output: "Activity[]",
        },
        {
          name: "getById",
          type: "query",
          description: "Get single activity by ID",
          input: "{ id: string }",
          output: "Activity",
        },
        {
          name: "create",
          type: "mutation",
          description: "Create new activity",
          input: "{ name, missionId, proxyProfileId? }",
          output: "Activity",
        },
        {
          name: "start",
          type: "mutation",
          description: "Start an activity",
          input: "{ id: string }",
          output: "{ success: boolean }",
        },
        {
          name: "stop",
          type: "mutation",
          description: "Stop a running activity",
          input: "{ id: string }",
          output: "{ success: boolean }",
        },
        {
          name: "stateChanges",
          type: "subscription",
          description: "Subscribe to activity state changes",
          output: "{ activityId: string, newState: string }",
        },
      ],
    },
    {
      name: "mission",
      description: "Mission management",
      procedures: [
        {
          name: "list",
          type: "query",
          description: "List all missions",
          output: "Mission[]",
        },
        {
          name: "getById",
          type: "query",
          description: "Get mission by ID",
          input: "{ id: string }",
          output: "Mission",
        },
        {
          name: "create",
          type: "mutation",
          description: "Create new mission",
          input: "{ name, description, configSchema }",
          output: "Mission",
        },
      ],
    },
    {
      name: "proxy",
      description: "Proxy profile management",
      procedures: [
        {
          name: "list",
          type: "query",
          description: "List proxy profiles",
          output: "ProxyProfile[]",
        },
        {
          name: "create",
          type: "mutation",
          description: "Create proxy profile",
          input: "{ name, protocol, host, port, username?, password? }",
          output: "ProxyProfile",
        },
        {
          name: "toggle",
          type: "mutation",
          description: "Toggle proxy on/off for activity",
          input: "{ activityId, proxyProfileId?, enabled }",
          output: "{ success: boolean }",
        },
      ],
    },
  ];

  for (const task of routerTasks) {
    try {
      console.log(`Generating ${task.name}.router.ts...\n`);
      const code = await generateRouterCode(task);

      console.log(code);
      console.log("\n" + "=".repeat(60) + "\n");
    } catch (error) {
      console.error(`❌ Failed to generate ${task.name} router:`, error);
    }
  }

  console.log("📝 Next steps:");
  console.log("1. Create files in packages/server/src/trpc/routers/");
  console.log("2. Update packages/server/src/trpc/routers/_app.ts to import new routers");
  console.log("3. Run type check: npm run type-check");
  console.log("4. Test routers with curl or GraphQL client\n");
}

main();
