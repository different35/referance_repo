#!/usr/bin/env node

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SCHEMA_PROMPT = `You are a Drizzle ORM expert. Generate Drizzle table definitions for SQLite.

Current schema context:
- We have 'users' table with id, email, role, createdAt, updatedAt
- We use sqliteTable from 'drizzle-orm/sqlite-core'
- We use 'const now = sql\`(unixepoch() * 1000)\`' for timestamps
- All timestamps use { mode: 'timestamp_ms' }
- All IDs are text() with primaryKey()
- Foreign keys use references(() => table.id, { onDelete: 'cascade' })

Generate ONLY the table definitions for these 5 tables (NO imports, NO exports, just table declarations):

1. **missions**: id, name, description, configSchema (json), defaultConfig (json), createdAt, updatedAt
2. **activities**: id, name, state (text enum: idle|starting|running|stopping|stopped|error), missionId (fk), proxyProfileId (fk), error (nullable), startedAt (nullable), stoppedAt (nullable), createdAt, updatedAt
3. **proxy_profiles**: id, name, protocol, host, port, username (nullable), passwordEnc (nullable), activityId (fk, nullable), isActive (boolean), createdAt, updatedAt
4. **ads**: id, state (text enum), platform, format, headline, body, cta, previewHtml, policyScore (integer, nullable), policyIssues (json), roiEstimate (json), publishedUrl (nullable), createdAt, updatedAt
5. **customer_visits**: id, customerName, locationLat (nullable), locationLng (nullable), startedAt, endedAt (nullable), notes, photoPaths (json), recordedByUserId (fk), createdAt, updatedAt

Use field naming like 'missionId' (camelCase), column names like 'mission_id' (snake_case).
Return ONLY the 5 table definitions, properly formatted.`;

async function generateSchema() {
  console.log("🗄️  Phase 2 Schema Generator - Using Anthropic Claude\n");

  try {
    console.log("Generating schema tables...\n");

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4000,
      messages: [{ role: "user", content: SCHEMA_PROMPT }],
    });

    const generatedCode = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("");

    console.log("✅ Generated Schema:\n");
    console.log(generatedCode);

    // Try to append to schema.ts
    const schemaPath =
      "/home/user/referance_repo/packages/server/src/db/schema.ts";
    const currentSchema = fs.readFileSync(schemaPath, "utf-8");

    // Find insertion point (before the final comment)
    const insertionPoint = currentSchema.indexOf("// Sonraki phase'lerde");

    if (insertionPoint !== -1) {
      const newSchema =
        currentSchema.substring(0, insertionPoint) +
        "\n// ─────────────────────────────────────────────────────────\n" +
        "// Domain tabloları (Phase 2)\n" +
        "// ─────────────────────────────────────────────────────────\n" +
        generatedCode +
        "\n\n" +
        currentSchema.substring(insertionPoint);

      fs.writeFileSync(schemaPath, newSchema);
      console.log("\n✅ Schema appended to packages/server/src/db/schema.ts");
      console.log("📝 Next: Run 'npm run type-check' to verify syntax");
    } else {
      console.log("\n⚠️  Could not find insertion point in schema.ts");
      console.log("📋 Copy the generated schema manually to schema.ts");
    }
  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generateSchema();
