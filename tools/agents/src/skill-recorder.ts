import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const client = new Anthropic();

interface LearnedSkill {
  name: string;
  trigger: string;
  solution: string;
  domain: string;
  timestamp: string;
}

const SKILLS_DB_PATH = "/home/user/referance_repo/.claude/learned-skills.json";
const SKILLS_DIR = "/home/user/referance_repo/.claude/skills";

function loadSkills(): LearnedSkill[] {
  if (!existsSync(SKILLS_DB_PATH)) return [];
  return JSON.parse(readFileSync(SKILLS_DB_PATH, "utf-8"));
}

function saveSkill(skill: LearnedSkill): void {
  const skills = loadSkills();
  skills.push(skill);
  writeFileSync(SKILLS_DB_PATH, JSON.stringify(skills, null, 2));

  // Also generate SKILL.md
  const skillDir = join(SKILLS_DIR, skill.name);
  mkdirSync(skillDir, { recursive: true });

  const skillMd = `---
name: ${skill.name}
description: ${skill.trigger}
context: fork
---

# ${skill.name} Skill

## Problem
${skill.trigger}

## Solution
${skill.solution}

## Domain
${skill.domain}

## Learned At
${skill.timestamp}
`;

  writeFileSync(join(skillDir, "SKILL.md"), skillMd);
  console.log(`✅ Skill saved: ${skill.name} → .claude/skills/${skill.name}/`);
}

async function learnFromError(
  errorMessage: string,
  fixedCode: string
): Promise<void> {
  console.log("🧠 Learning from error pattern...\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `An error was encountered and fixed in the Swarm Panel project.

Error: ${errorMessage}

Fix applied: ${fixedCode}

Generate a skill definition:
1. A short skill name (kebab-case, e.g. "fix-drizzle-optional")
2. A trigger description (when should this skill be used, 1 sentence)
3. The solution pattern (2-3 sentences)
4. Domain (e.g. "Drizzle ORM", "TypeScript", "tRPC", "Vue 3")

Respond in JSON:
{
  "name": "...",
  "trigger": "...",
  "solution": "...",
  "domain": "..."
}`,
      },
    ],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("");

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const skill = JSON.parse(match[0]);
      saveSkill({
        ...skill,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error("Could not parse skill JSON:", e);
  }
}

async function showLearnedSkills(): Promise<void> {
  const skills = loadSkills();

  if (skills.length === 0) {
    console.log("📚 No learned skills yet. Skills are saved as errors are fixed.");
    return;
  }

  console.log(`\n📚 Learned Skills (${skills.length} total):\n`);

  for (const skill of skills) {
    console.log(`  🔹 /${skill.name}`);
    console.log(`     When: ${skill.trigger}`);
    console.log(`     Domain: ${skill.domain}`);
    console.log(`     Learned: ${skill.timestamp.split("T")[0]}\n`);
  }
}

// ─── Example usage ───────────────────────────────────────────────────────────

const [, , command, ...args] = process.argv;

if (command === "learn") {
  // Usage: node skill-recorder.js learn "error message" "fix applied"
  const [error, fix] = args;
  if (!error || !fix) {
    console.log('Usage: node skill-recorder.js learn "error" "fix"');
    process.exit(1);
  }
  learnFromError(error, fix).catch(console.error);
} else if (command === "list") {
  showLearnedSkills().catch(console.error);
} else {
  console.log("Swarm Panel Skill Recorder\n");
  console.log("Commands:");
  console.log('  learn "error" "fix"  — Learn from an error pattern');
  console.log("  list                 — List all learned skills");
  console.log("\nLearned skills are saved to:");
  console.log("  .claude/learned-skills.json  (database)");
  console.log("  .claude/skills/<name>/SKILL.md (Claude Code skill)");
}
