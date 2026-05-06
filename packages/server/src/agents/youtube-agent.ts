/**
 * YouTube Trend Analysis Agent
 *
 * Tasks:
 * - Find viral video concepts using YouTube Data API
 * - Analyze trending topics by search volume
 * - Research audience demand from comments/engagement
 * - Save findings to files for collaboration
 */

import { youtube_v3, google } from "googleapis";
import { getLocalAgentService } from "../services/local-agent.service.js";
import { getAgentFileSystem } from "./file-system.js";

export interface YouTubeTrendTask {
  activityId: string;
  niche: string; // "tech", "gaming", "education", etc.
  timeframe: string; // "week", "month"
  searchTerms: string[];
}

export interface YouTubeVideoAnalysis {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  publishedAt: string;
  description: string;
  thumbnailUrl: string;
}

export class YouTubeAgent {
  private youtubeApi: youtube_v3.Youtube;
  private localService = getLocalAgentService();
  private fs = getAgentFileSystem();
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || "";

    if (!this.apiKey) {
      throw new Error(
        "YOUTUBE_API_KEY not set in environment variables"
      );
    }

    this.youtubeApi = google.youtube({
      version: "v3",
      auth: this.apiKey,
    });
  }

  /**
   * Search for trending videos in a niche
   */
  async searchTrendingVideos(
    searchTerm: string,
    maxResults: number = 10
  ): Promise<YouTubeVideoAnalysis[]> {
    try {
      const response = await this.youtubeApi.search.list({
        part: ["snippet"],
        q: searchTerm,
        type: ["video"],
        order: "viewCount",
        maxResults,
        regionCode: "US",
        relevanceLanguage: "en",
      });

      if (!response.data.items) {
        return [];
      }

      const videoIds = response.data.items
        .map((item) => item.id?.videoId)
        .filter(Boolean) as string[];

      // Get detailed statistics
      const statsResponse = await this.youtubeApi.videos.list({
        part: ["statistics", "snippet", "contentDetails"],
        id: videoIds,
      });

      const videos: YouTubeVideoAnalysis[] = [];

      if (statsResponse.data.items) {
        for (const video of statsResponse.data.items) {
          if (!video.id || !video.statistics) continue;

          videos.push({
            videoId: video.id,
            title: video.snippet?.title || "Unknown",
            channelTitle: video.snippet?.channelTitle || "Unknown",
            viewCount: parseInt(video.statistics.viewCount || "0"),
            likeCount: video.statistics.likeCount
              ? parseInt(video.statistics.likeCount)
              : null,
            commentCount: video.statistics.commentCount
              ? parseInt(video.statistics.commentCount)
              : null,
            publishedAt: video.snippet?.publishedAt || "",
            description: video.snippet?.description || "",
            thumbnailUrl: video.snippet?.thumbnails?.default?.url || "",
          });
        }
      }

      return videos.sort((a, b) => b.viewCount - a.viewCount);
    } catch (error) {
      console.error("YouTube API Error:", error);
      return [];
    }
  }

  /**
   * Analyze trends and generate insights
   */
  async analyzeTrends(task: YouTubeTrendTask): Promise<{
    success: boolean;
    findings: string;
    filePath: string;
    rawData?: YouTubeVideoAnalysis[];
  }> {
    try {
      console.log(
        `🔍 Searching YouTube for trends: ${task.searchTerms.join(", ")}`
      );

      // Fetch real data from YouTube
      let allVideos: YouTubeVideoAnalysis[] = [];

      for (const term of task.searchTerms) {
        const videos = await this.searchTrendingVideos(
          `${task.niche} ${term}`,
          5
        );
        allVideos = allVideos.concat(videos);
      }

      if (allVideos.length === 0) {
        return {
          success: false,
          findings: "No videos found",
          filePath: "",
        };
      }

      // Prepare data for analysis
      const analysisPrompt = `Analyze these REAL YouTube trending videos and extract insights:

${allVideos
  .slice(0, 10)
  .map(
    (v) => `
Title: ${v.title}
Channel: ${v.channelTitle}
Views: ${v.viewCount.toLocaleString()}
Likes: ${v.likeCount?.toLocaleString() || "N/A"}
Comments: ${v.commentCount?.toLocaleString() || "N/A"}
Published: ${new Date(v.publishedAt).toLocaleDateString()}
Description: ${v.description.substring(0, 200)}...
`
  )
  .join("\n---\n")}

Based on these REAL trending videos:
1. What are the common CONCEPTS/FORMATS?
2. What TITLES work best?
3. What AUDIENCE DEMAND patterns exist?
4. What GAP opportunity is there?
5. What VIDEO IDEA would you recommend?

Return JSON:
{
  "trending_concepts": ["concept1", "concept2"],
  "title_patterns": ["pattern1", "pattern2"],
  "audience_demand": ["want1", "want2"],
  "gap_opportunity": "What's missing...",
  "recommended_video_idea": {
    "title": "...",
    "hook": "First 10 seconds...",
    "format": "shorts/long-form/series",
    "target_audience": "..."
  },
  "estimated_reach": "potential views based on data"
}`;

      let output = "";

      const result = await this.localService.executeTask(
        {
          activityId: task.activityId,
          agentId: "youtube-trend-agent",
          objective: analysisPrompt,
        },
        (chunk: string) => {
          output += chunk;
        }
      );

      if (!result.success) {
        return {
          success: false,
          findings: result.error || "Analysis failed",
          filePath: "",
          rawData: allVideos,
        };
      }

      // Save findings with raw data
      const timestamp = new Date().toISOString().split("T")[0];
      const filePath = `youtube/trends/${task.niche}/${timestamp}-trends.json`;

      try {
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        const findings = jsonMatch ? jsonMatch[0] : output;

        // Combine analysis with raw data
        const combined = {
          analysis: JSON.parse(findings),
          raw_data: allVideos.slice(0, 10),
          metadata: {
            niche: task.niche,
            search_terms: task.searchTerms,
            total_videos_analyzed: allVideos.length,
            timestamp: new Date().toISOString(),
          },
        };

        await this.fs.writeFile(filePath, JSON.stringify(combined, null, 2));

        return {
          success: true,
          findings: JSON.stringify(combined.analysis, null, 2),
          filePath,
          rawData: allVideos,
        };
      } catch (error) {
        return {
          success: false,
          findings: output,
          filePath: "",
          rawData: allVideos,
        };
      }
    } catch (error) {
      return {
        success: false,
        findings: (error as Error).message,
        filePath: "",
      };
    }
  }

  /**
   * Get videos by keyword
   */
  async getVideosByKeyword(keyword: string, maxResults: number = 10) {
    return this.searchTrendingVideos(keyword, maxResults);
  }

  /**
   * Analyze engagement rate
   */
  static calculateEngagementRate(video: YouTubeVideoAnalysis): number {
    const engagementCount =
      (video.likeCount || 0) + (video.commentCount || 0);
    if (video.viewCount === 0) return 0;
    return (engagementCount / video.viewCount) * 100;
  }
}

export function getYouTubeAgent(): YouTubeAgent {
  return new YouTubeAgent();
}
