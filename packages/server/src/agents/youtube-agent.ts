/**
 * YouTube Trend Analysis Agent
 *
 * Tasks:
 * - Find viral video concepts
 * - Analyze trending topics
 * - Research audience demand
 * - Save findings to files for collaboration
 */

import { getLocalAgentService } from "../services/local-agent.service.js";
import { getAgentFileSystem } from "./file-system.js";

export interface YouTubeTrendTask {
  activityId: string;
  niche: string; // "tech", "gaming", "education", etc.
  timeframe: string; // "week", "month"
  searchTerms: string[];
}

export class YouTubeAgent {
  private localService = getLocalAgentService();
  private fs = getAgentFileSystem();

  async analyzeTrends(task: YouTubeTrendTask): Promise<{
    success: boolean;
    findings: string;
    filePath: string;
  }> {
    const prompt = `You are a YouTube trend analysis expert.

Analyze these terms and find:
1. What videos are TRENDING in "${task.niche}" niche
2. What CONCEPTS are getting views (title patterns, thumbnails)
3. What AUDIENCE DEMAND exists (comments, engagement)
4. What GAP exists (what's NOT being done well)

Niche: ${task.niche}
Timeframe: Last ${task.timeframe}
Search Terms: ${task.searchTerms.join(", ")}

Return JSON:
{
  "trending_concepts": ["concept1", "concept2"],
  "viral_patterns": { "title": "...", "thumbnail": "..." },
  "audience_demand": ["want1", "want2"],
  "gap_opportunity": "What's missing...",
  "recommended_video_idea": {
    "title": "...",
    "hook": "...",
    "duration": "...",
    "target_audience": "..."
  }
}`;

    let output = "";

    // Execute agent locally
    const result = await this.localService.executeTask(
      {
        activityId: task.activityId,
        agentId: "youtube-trend-agent",
        objective: prompt,
      },
      (chunk: string) => {
        output += chunk;
      }
    );

    if (!result.success) {
      return {
        success: false,
        findings: result.error || "Unknown error",
        filePath: "",
      };
    }

    // Save findings to file
    const timestamp = new Date().toISOString().split("T")[0];
    const filePath = `youtube/trends/${task.niche}/${timestamp}-trends.json`;

    try {
      // Parse output as JSON
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      const findings = jsonMatch ? jsonMatch[0] : output;

      await this.fs.writeFile(filePath, findings);

      return {
        success: true,
        findings,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        findings: output,
        filePath: "",
      };
    }
  }

  /**
   * Get previous trend research
   */
  async getPreviousFindings(niche: string) {
    const result = await this.fs.listDir(`youtube/trends/${niche}`);

    if (!result.success) {
      return null;
    }

    return result.data;
  }

  /**
   * Compare trends over time
   */
  async compareTrends(niche: string) {
    const findings = await this.getPreviousFindings(niche);

    if (!findings) {
      return { success: false, message: "No previous findings" };
    }

    const prompt = `Compare these trend analyses and identify:
1. What concepts are CONSISTENTLY trending
2. What NEW trends emerged
3. What DISAPPEARED from trend
4. Pattern evolution

Files: ${JSON.stringify(findings)}

Return evolution analysis as JSON.`;

    let output = "";

    const result = await this.localService.executeTask(
      {
        activityId: `comparison-${Date.now()}`,
        agentId: "youtube-trend-analyzer",
        objective: prompt,
      },
      (chunk: string) => {
        output += chunk;
      }
    );

    const filePath = `youtube/trends/${niche}/comparison-${new Date().toISOString().split("T")[0]}.json`;

    if (result.success) {
      await this.fs.writeFile(filePath, output);
    }

    return {
      success: result.success,
      analysis: output,
      filePath,
    };
  }
}

export function getYouTubeAgent(): YouTubeAgent {
  return new YouTubeAgent();
}
