/**
 * Instagram Creative Agent
 *
 * Tasks:
 * - Generate creative ideas
 * - Design post concepts
 * - Write engaging captions
 * - Analyze audience insights
 * - Manage posting schedule
 */

import { getLocalAgentService } from "../services/local-agent.service.js";
import { getAgentFileSystem } from "./file-system.js";

export interface InstagramCreativeTask {
  activityId: string;
  account: string;
  contentType: "carousel" | "reel" | "story" | "static_post";
  topic: string;
  targetAudience: string;
  style?: string;
}

export class InstagramAgent {
  private localService = getLocalAgentService();
  private fs = getAgentFileSystem();

  async generateCreative(task: InstagramCreativeTask): Promise<{
    success: boolean;
    creative: string;
    filePath: string;
  }> {
    const prompt = `You are an Instagram creative director.

Generate a ${task.contentType} post for the "${task.account}" account.

Requirements:
- Content type: ${task.contentType}
- Topic: ${task.topic}
- Target audience: ${task.targetAudience}
- Style: ${task.style || "professional, engaging"}

Return JSON:
{
  "creative_concept": "Your detailed creative idea",
  "caption": "Instagram caption (max 2200 chars)",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "call_to_action": "What should followers do?",
  "best_posting_time": "HH:MM (24h format)",
  "design_notes": "If this were a design, what would it look like?",
  "engagement_prediction": "Expected engagement rate",
  "variations": [
    { "variant": "Alternate version 1" },
    { "variant": "Alternate version 2" }
  ]
}`;

    let output = "";

    const result = await this.localService.executeTask(
      {
        activityId: task.activityId,
        agentId: "instagram-creative-agent",
        objective: prompt,
      },
      (chunk: string) => {
        output += chunk;
      }
    );

    if (!result.success) {
      return {
        success: false,
        creative: result.error || "Generation failed",
        filePath: "",
      };
    }

    // Save creative to file
    const timestamp = new Date().toISOString().split("T")[0];
    const filePath = `instagram/creatives/${task.account}/${timestamp}-${task.contentType}.json`;

    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      const creative = jsonMatch ? jsonMatch[0] : output;

      await this.fs.writeFile(filePath, creative);

      // Also save as markdown for easy review
      const mdPath = filePath.replace(".json", ".md");
      const markdown = `# Instagram Creative: ${task.contentType}

**Topic:** ${task.topic}
**Audience:** ${task.targetAudience}

## Creative
\`\`\`json
${creative}
\`\`\`

Generated: ${new Date().toISOString()}
`;

      await this.fs.writeFile(mdPath, markdown);

      return {
        success: true,
        creative,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        creative: output,
        filePath: "",
      };
    }
  }

  /**
   * Generate weekly content calendar
   */
  async generateContentCalendar(
    account: string,
    topics: string[],
    audience: string
  ) {
    const prompt = `Create a weekly Instagram content calendar.

Account: ${account}
Topics to cover: ${topics.join(", ")}
Target audience: ${audience}

Return JSON calendar:
{
  "week": "YYYY-WW",
  "schedule": [
    {
      "day": "Monday",
      "time": "09:00",
      "content_type": "carousel|reel|story|static",
      "topic": "...",
      "caption_preview": "...",
      "hashtags": ["#tag1", "#tag2"]
    }
  ],
  "posting_strategy": "Your strategy notes",
  "cross_promotion": "How to link content across platforms"
}`;

    let output = "";

    const result = await this.localService.executeTask(
      {
        activityId: `calendar-${Date.now()}`,
        agentId: "instagram-calendar-agent",
        objective: prompt,
      },
      (chunk: string) => {
        output += chunk;
      }
    );

    const filePath = `instagram/calendars/${account}/${new Date().toISOString().split("T")[0]}-calendar.json`;

    if (result.success) {
      await this.fs.writeFile(filePath, output);
    }

    return {
      success: result.success,
      calendar: output,
      filePath,
    };
  }

  /**
   * Analyze audience insights from saved data
   */
  async analyzeAudienceInsights(account: string) {
    // Read previous creatives and engagement data
    const result = await this.fs.listDir(`instagram/creatives/${account}`);

    if (!result.success || !result.data) {
      return { success: false, message: "No creative history found" };
    }

    const prompt = `Analyze these Instagram creative posts and identify patterns:

Files analyzed: ${JSON.stringify(result.data)}

Return insights:
{
  "best_performing_content_type": "carousel|reel|story|static",
  "audience_preferences": ["preference1", "preference2"],
  "optimal_posting_times": ["HH:MM"],
  "caption_patterns_that_work": ["pattern1", "pattern2"],
  "engagement_drivers": ["driver1", "driver2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    let output = "";

    const analysisResult = await this.localService.executeTask(
      {
        activityId: `insights-${Date.now()}`,
        agentId: "instagram-insights-agent",
        objective: prompt,
      },
      (chunk: string) => {
        output += chunk;
      }
    );

    const filePath = `instagram/insights/${account}/${new Date().toISOString().split("T")[0]}-insights.json`;

    if (analysisResult.success) {
      await this.fs.writeFile(filePath, output);
    }

    return {
      success: analysisResult.success,
      insights: output,
      filePath,
    };
  }
}

export function getInstagramAgent(): InstagramAgent {
  return new InstagramAgent();
}
