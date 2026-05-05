import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";

const client = new Anthropic();

interface SchemaTask {
  table: string;
  description: string;
  relationships?: string[];
}

async function generateSchemaCode(tasks: SchemaTask[]): Promise<string> {
  const currentSchema = existsSync(
    "/home/user/referance_repo/packages/server/src/db/schema.ts"
  )
    ? readFileSync(
        "/home/user/referance_repo/packages/server/src/db/schema.ts",
        "utf-8"
      ).slice(0, 2000)
    : "No existing schema";

  const prompt = `You are a Drizzle ORM schema expert.

Current schema (first 2000 chars):
\`\`\`typescript
${currentSchema}
\`\`\`

Add/update these tables to the schema:
${tasks.map((t) => `- ${t.table}: ${t.description}`).join("\n")}

Requirements:
1. Use Drizzle ORM with SQLite
2. Keep the "now" helper for timestamps
3. Maintain Better-Auth compatibility
4. Add relationships (onDelete: 'cascade')
5. Use proper Zod compatible types
6. Return ONLY the TypeScript code for these tables

Add these at the end of the existing schema, before "// Sonraki phase'lerde..." comment.`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((c) => c.type === "text")
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("");
}

async function main() {
  console.log("🗄️  Schema Agent - Generating database tables\n");

  const schemaTasks: SchemaTask[] = [
    {
      table: "missions",
      description:
        "Mission definitions - name, description, config schema, default config",
      relationships: ["activities"],
    },
    {
      table: "activities",
      description: "Work activities - state (idle|starting|running|stopping), mission_id, proxy_profile_id, error, timestamps",
      relationships: ["users", "missions", "proxy_profiles"],
    },
    {
      table: "proxy_profiles",
      description:
        "Proxy configurations - protocol, host, port, credentials (encrypted), activity_id",
      relationships: ["activities"],
    },
    {
      table: "ads",
      description:
        "Advertisement campaigns - state (draft|generating|review|policy-checking|approved|published), platform, format, content, preview_html, policy_score, policy_issues json",
      relationships: ["users"],
    },
    {
      table: "customer_visits",
      description:
        "Customer visit records - customer_name, location_lat, location_lng, started_at, ended_at, notes, photo_paths json, recorded_by_user_id",
      relationships: ["users"],
    },
  ];

  try {
    console.log("Generating schema code...");
    const generatedCode = await generateSchemaCode(schemaTasks);

    console.log("\n✅ Generated schema:\n");
    console.log(generatedCode);

    console.log("\n📝 Next steps:");
    console.log("1. Review the generated tables");
    console.log("2. Add to packages/server/src/db/schema.ts");
    console.log("3. Run: cd packages/server && npm run db:push");
    console.log("4. Verify no TypeScript errors\n");
  } catch (error) {
    console.error("❌ Schema generation failed:", error);
  }
}

main();
