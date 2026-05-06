/**
 * Agent Orchestrator
 *
 * I (Claude Code) manage all agents
 * - Execute tasks
 * - Monitor progress
 * - Collect results
 * - Make decisions based on outputs
 * - Iterate and improve
 */

import { getYouTubeAgent } from "./youtube-agent.js";
import { getInstagramAgent } from "./instagram-agent.js";
import { getAgentFileSystem } from "./file-system.js";

export interface OrchestrationTask {
  id: string;
  type: "youtube-trends" | "instagram-creative" | "instagram-calendar" | "instagram-insights";
  config: Record<string, unknown>;
}

export interface OrchestrationResult {
  taskId: string;
  status: "success" | "failed";
  result: unknown;
  filePath: string | null;
  timestamp: string;
}

export class AgentOrchestrator {
  private youtube = getYouTubeAgent();
  private instagram = getInstagramAgent();
  private fs = getAgentFileSystem();
  private results: Map<string, OrchestrationResult> = new Map();

  /**
   * Execute a task and get results
   */
  async executeTask(task: OrchestrationTask): Promise<OrchestrationResult> {
    const startTime = new Date().toISOString();

    try {
      let result: unknown;
      let filePath: string | undefined;

      switch (task.type) {
        case "youtube-trends":
          const youtubeResult = await this.youtube.analyzeTrends({
            activityId: task.id,
            niche: (task.config.niche as string) || "tech",
            timeframe: (task.config.timeframe as string) || "week",
            searchTerms: (task.config.searchTerms as string[]) || [],
          });
          result = youtubeResult;
          filePath = youtubeResult.filePath;
          break;

        case "instagram-creative":
          const igResult = await this.instagram.generateCreative({
            activityId: task.id,
            account: (task.config.account as string) || "default",
            contentType: (task.config.contentType as any) || "static_post",
            topic: (task.config.topic as string) || "general",
            targetAudience: (task.config.targetAudience as string) || "general",
            style: (task.config.style as string) || "professional",
          });
          result = igResult;
          filePath = igResult.filePath;
          break;

        case "instagram-calendar":
          const calendarResult = await this.instagram.generateContentCalendar(
            (task.config.account as string) || "default",
            (task.config.topics as string[]) || [],
            (task.config.audience as string) || "general"
          );
          result = calendarResult;
          filePath = calendarResult.filePath;
          break;

        case "instagram-insights":
          const insightsResult = await this.instagram.analyzeAudienceInsights(
            (task.config.account as string) || "default"
          );
          result = insightsResult;
          filePath = insightsResult.filePath;
          break;

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const orchestrationResult: OrchestrationResult = {
        taskId: task.id,
        status: "success",
        result,
        filePath: filePath || null,
        timestamp: startTime,
      };

      this.results.set(task.id, orchestrationResult);
      return orchestrationResult;
    } catch (error) {
      const orchestrationResult: OrchestrationResult = {
        taskId: task.id,
        status: "failed",
        result: (error as Error).message,
        filePath: null,
        timestamp: startTime,
      };

      this.results.set(task.id, orchestrationResult);
      return orchestrationResult;
    }
  }

  /**
   * Get task result
   */
  getResult(taskId: string): OrchestrationResult | undefined {
    return this.results.get(taskId);
  }

  /**
   * List all results
   */
  getAllResults(): OrchestrationResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Read agent output file
   */
  async readOutput(filePath: string) {
    return this.fs.readFile(filePath);
  }

  /**
   * List agent work directory
   */
  async listWork(dir: string = ".") {
    return this.fs.listDir(dir);
  }

  /**
   * Analyze and iterate on results
   */
  async analyzeAndIterate(
    previousTaskId: string,
    refinement: string
  ): Promise<OrchestrationResult> {
    const previousResult = this.results.get(previousTaskId);

    if (!previousResult) {
      throw new Error(`Task ${previousTaskId} not found`);
    }

    // Create follow-up task based on previous result
    const followUpTask: OrchestrationTask = {
      id: `refined-${Date.now()}`,
      type: "youtube-trends", // Default, should be determined from context
      config: {
        refinement,
        basedOn: previousTaskId,
        previousResult,
      },
    };

    return this.executeTask(followUpTask);
  }

  /**
   * Generate summary report
   */
  async generateReport(): Promise<string> {
    const results = this.getAllResults();
    const summary = results
      .map(
        (r) =>
          `## Task ${r.taskId}
Status: ${r.status}
Timestamp: ${r.timestamp}
${r.filePath ? `File: ${r.filePath}` : ""}
${typeof r.result === "object" ? JSON.stringify(r.result, null, 2) : r.result}
`
      )
      .join("\n---\n");

    const reportPath = `reports/orchestration-${new Date().toISOString().split("T")[0]}.md`;
    await this.fs.writeFile(
      reportPath,
      `# Agent Orchestration Report\n\nGenerated: ${new Date().toISOString()}\n\n${summary}`
    );

    return reportPath;
  }
}

let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}
