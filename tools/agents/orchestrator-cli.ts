#!/usr/bin/env node

/**
 * Agent Orchestrator CLI
 *
 * Control agents from command line
 * Example:
 *   node orchestrator-cli.ts youtube-trends --niche tech --timeframe week
 *   node orchestrator-cli.ts instagram-creative --account myaccount --topic "summer vibes"
 */

import { getOrchestrator } from "../../packages/server/src/agents/orchestrator.js";
import { getAgentFileSystem } from "../../packages/server/src/agents/file-system.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  const fs = getAgentFileSystem();
  const orchestrator = getOrchestrator();

  try {
    switch (command) {
      case "youtube-trends": {
        console.log("🎬 YouTube Trend Analysis Started...\n");

        const niche = getArg(args, "--niche") || "tech";
        const timeframe = getArg(args, "--timeframe") || "week";
        const searchTerms = (getArg(args, "--terms") || "").split(",").filter(Boolean);

        const result = await orchestrator.executeTask({
          id: `yt-${Date.now()}`,
          type: "youtube-trends",
          config: { niche, timeframe, searchTerms },
        });

        console.log(`\n✅ Status: ${result.status}`);
        if (result.filePath) {
          console.log(`📁 Saved to: ${result.filePath}`);
          const content = await fs.readFile(result.filePath);
          console.log("\n📊 Results:\n", content.data);
        }
        break;
      }

      case "instagram-creative": {
        console.log("📸 Instagram Creative Generation Started...\n");

        const account = getArg(args, "--account") || "default";
        const contentType = (getArg(args, "--type") || "static_post") as any;
        const topic = getArg(args, "--topic") || "general";
        const audience = getArg(args, "--audience") || "general";

        const result = await orchestrator.executeTask({
          id: `ig-${Date.now()}`,
          type: "instagram-creative",
          config: { account, contentType, topic, targetAudience: audience },
        });

        console.log(`\n✅ Status: ${result.status}`);
        if (result.filePath) {
          console.log(`📁 Saved to: ${result.filePath}`);
          const content = await fs.readFile(result.filePath);
          console.log("\n🎨 Creative:\n", content.data);
        }
        break;
      }

      case "instagram-calendar": {
        console.log("📅 Instagram Content Calendar Generation Started...\n");

        const account = getArg(args, "--account") || "default";
        const topics = (getArg(args, "--topics") || "").split(",").filter(Boolean);
        const audience = getArg(args, "--audience") || "general";

        const result = await orchestrator.executeTask({
          id: `calendar-${Date.now()}`,
          type: "instagram-calendar",
          config: { account, topics, audience },
        });

        console.log(`\n✅ Status: ${result.status}`);
        if (result.filePath) {
          console.log(`📁 Saved to: ${result.filePath}`);
          const content = await fs.readFile(result.filePath);
          console.log("\n📆 Calendar:\n", content.data);
        }
        break;
      }

      case "instagram-insights": {
        console.log("📊 Instagram Insights Analysis Started...\n");

        const account = getArg(args, "--account") || "default";

        const result = await orchestrator.executeTask({
          id: `insights-${Date.now()}`,
          type: "instagram-insights",
          config: { account },
        });

        console.log(`\n✅ Status: ${result.status}`);
        if (result.filePath) {
          console.log(`📁 Saved to: ${result.filePath}`);
          const content = await fs.readFile(result.filePath);
          console.log("\n💡 Insights:\n", content.data);
        }
        break;
      }

      case "list": {
        const dir = getArg(args, "--dir") || ".";
        console.log(`📂 Listing: ${dir}\n`);

        const result = await fs.listDir(dir);
        if (result.success && Array.isArray(result.data)) {
          result.data.forEach((item: any) => {
            const icon = item.type === "dir" ? "📁" : "📄";
            console.log(`  ${icon} ${item.name}`);
          });
        } else {
          console.log("No files found.");
        }
        break;
      }

      case "read": {
        const filePath = getArg(args, "--file");
        if (!filePath) {
          console.error("❌ Please specify --file");
          process.exit(1);
        }

        console.log(`📖 Reading: ${filePath}\n`);
        const result = await fs.readFile(filePath);

        if (result.success) {
          console.log(result.data);
        } else {
          console.error("❌ Error:", result.error);
        }
        break;
      }

      case "report": {
        console.log("📋 Generating Orchestration Report...\n");
        const reportPath = await orchestrator.generateReport();
        console.log(`✅ Report saved to: ${reportPath}`);
        break;
      }

      case "help":
        printHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error:", (error as Error).message);
    process.exit(1);
  }
}

function getArg(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return null;
}

function printHelp() {
  console.log(`
🤖 Agent Orchestrator CLI
========================

Usage: node orchestrator-cli.ts <command> [options]

Commands:

  📺 YouTube Trends
    youtube-trends --niche tech --timeframe week --terms "AI,automation,claude"

  📸 Instagram Creative
    instagram-creative --account myaccount --type carousel --topic "summer collection" --audience "millennials"

  📅 Instagram Calendar
    instagram-calendar --account myaccount --topics "tips,behind-the-scenes,products" --audience "engaged-followers"

  💡 Instagram Insights
    instagram-insights --account myaccount

  📂 File Operations
    list --dir youtube/trends/tech
    read --file youtube/trends/tech/2026-05-06-trends.json

  📋 Reports
    report

Options:
  --niche NICHE           Content niche (tech, gaming, education, etc)
  --timeframe TIMEFRAME   Week, month, quarter
  --terms TERMS           Comma-separated search terms
  --account ACCOUNT       Instagram account name
  --type TYPE             carousel, reel, story, static_post
  --topic TOPIC           Content topic
  --audience AUDIENCE     Target audience
  --topics TOPICS         Comma-separated topics
  --dir DIR              Directory path
  --file FILE            File path

Examples:
  node orchestrator-cli.ts youtube-trends --niche tech --timeframe month
  node orchestrator-cli.ts instagram-creative --account myaccount --type reel --topic "productivity tips"
  node orchestrator-cli.ts list --dir instagram/creatives
  node orchestrator-cli.ts read --file instagram/creatives/myaccount/2026-05-06-carousel.json
`);
}

main().catch(console.error);
