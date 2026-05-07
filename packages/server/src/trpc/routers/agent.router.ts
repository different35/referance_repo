import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { eq } from "drizzle-orm";
import * as schema from "../../db/schema.js";
import {
  enqueueAgentTask,
  getJobStatus,
  initializeQueue,
} from "../../agents/queue-manager.js";
import { getSwarmAgent } from "../../agents/llm-agent.js";
import { getLocalAgentService } from "../../services/local-agent.service.js";
import {
  storeCampaignMemory,
  searchSimilarCampaigns,
  getAllCampaignMemories,
} from "../../agents/vector-store.js";
import { approvalManager } from "../../agents/approval-manager.js";
import { multiChannelToolkit } from "../../agents/multi-channel-tools.js";

export const agentRouter = router({
  initialize: publicProcedure.mutation(async () => {
    try {
      await initializeQueue();
      return { success: true, message: "Agent infrastructure initialized" };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }),

  submitTask: publicProcedure
    .input(z.object({
      agentId: z.string(),
      taskType: z.enum(["campaign", "content", "analysis", "approval"]),
      input: z.string(),
      priority: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const job = await enqueueAgentTask(
          input.taskType,
          input.agentId,
          input.input,
          input.priority
        );
        return {
          jobId: job.id,
          status: "queued",
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          jobId: null,
          status: "error",
          error: (error as Error).message,
        };
      }
    }),

  getJobStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const status = await getJobStatus(input.jobId);
      return status || { error: "Job not found" };
    }),

  executeAgent: publicProcedure
    .input(z.object({
      agentId: z.string(),
      input: z.string().optional(),
      config: z.record(z.unknown()).optional(),
      useLocal: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        let objective = input.input;
        let config = input.config;

        if (!objective && !config) {
          const [activity] = await ctx.db
            .select()
            .from(schema.activities)
            .where(eq(schema.activities.id, input.agentId))
            .limit(1);

          if (activity?.missionId) {
            const [mission] = await ctx.db
              .select()
              .from(schema.missions)
              .where(eq(schema.missions.id, activity.missionId))
              .limit(1);

            if (mission?.description) {
              objective = mission.description;
            }
            if (mission?.defaultConfig) {
              config = mission.defaultConfig as Record<string, unknown>;
            }
          }
        }

        if (!objective) {
          return { success: false, error: `Agent ${input.agentId} icin mission tanimi bulunamadi.` };
        }

        const fullTask = config 
          ? `${objective}\n\nKonfigurasyon: ${JSON.stringify(config, null, 2)}`
          : objective;

        if (input.useLocal) {
          const localService = getLocalAgentService();
          const task = {
            activityId: `agent-${Date.now()}`,
            agentId: input.agentId,
            objective: fullTask,
          };
          const result = await localService.executeTask(task, () => {});
          return {
            success: result.success,
            agentId: input.agentId,
            taskId: task.activityId,
            output: result.output,
            duration: result.duration,
            error: result.error,
            timestamp: Date.now(),
          };
        }

        const agent = getSwarmAgent();
        const taskId = `task-${Date.now()}`;
        const result = await agent.executeTask(objective, input.agentId, taskId);
        return {
          success: true,
          agentId: input.agentId,
          taskId,
          thoughts: result.thoughts,
          researchSummary: result.researchSummary,
          notebookSourceId: result.notebookSourceId,
          output: result.output,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  storeCampaign: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      ctr: z.number(),
      conversionRate: z.number(),
      roi: z.number(),
      keywords: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      try {
        await storeCampaignMemory({
          id: input.id,
          name: input.name,
          description: input.description,
          performance: {
            ctr: input.ctr,
            conversion_rate: input.conversionRate,
            roi: input.roi,
          },
          keywords: input.keywords,
          metadata: {},
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  searchCampaigns: publicProcedure
    .input(z.object({
      query: z.string(),
      topK: z.number().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const campaigns = await searchSimilarCampaigns(input.query, input.topK);
        return {
          success: true,
          campaigns,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          campaigns: [],
        };
      }
    }),

  getCampaigns: publicProcedure.query(async () => {
    try {
      const campaigns = await getAllCampaignMemories();
      return {
        success: true,
        campaigns,
        count: campaigns.length,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        campaigns: [],
        count: 0,
      };
    }
  }),

  requestApproval: publicProcedure
    .input(z.object({
      taskId: z.string(),
      agentId: z.string(),
      action: z.enum([
        "publish_campaign",
        "increase_budget",
        "change_targeting",
        "deploy",
      ]),
      description: z.string(),
      proposedChanges: z.record(z.unknown()),
      riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const request = approvalManager.createApprovalRequest(
        input.taskId,
        input.agentId,
        input.action,
        input.description,
        input.proposedChanges,
        input.riskLevel
      );
      return {
        success: true,
        approvalId: request.id,
        expiresAt: request.expiresAt,
      };
    }),

  getPendingApprovals: publicProcedure.query(async () => {
    const requests = approvalManager.getPendingRequests();
    return {
      pending: requests,
      count: requests.length,
    };
  }),

  approveRequest: publicProcedure
    .input(z.object({
      requestId: z.string(),
      approverNote: z.string(),
      approver: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = approvalManager.approveRequest(
        input.requestId,
        input.approverNote,
        input.approver
      );
      return {
        success,
        message: success ? "Approval granted" : "Approval failed",
      };
    }),

  rejectRequest: publicProcedure
    .input(z.object({
      requestId: z.string(),
      reason: z.string(),
      approver: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = approvalManager.rejectRequest(
        input.requestId,
        input.reason,
        input.approver
      );
      return {
        success,
        message: success ? "Request rejected" : "Rejection failed",
      };
    }),

  getChannels: publicProcedure.query(async () => {
    const channels = multiChannelToolkit.getConfiguredChannels();
    return {
      configured: channels,
      count: channels.length,
    };
  }),

  executeChannelAction: publicProcedure
    .input(z.object({
      platform: z.enum([
        "google_ads",
        "facebook",
        "linkedin",
        "twitter",
        "tiktok",
      ]),
      action: z.enum([
        "create_campaign",
        "update_budget",
        "pause_campaign",
        "enable_campaign",
        "adjust_targeting",
      ]),
      campaignId: z.string().nullable(),
      parameters: z.record(z.unknown()),
      approvalId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (input.approvalId && !approvalManager.canExecute(input.approvalId)) {
        return {
          success: false,
          error: "Action not approved",
        };
      }

      const result = await multiChannelToolkit.executeAction({
        platform: input.platform,
        action: input.action,
        campaignId: input.campaignId,
        parameters: input.parameters,
        estimatedCost: null,
        requiresApproval: !!input.approvalId,
      });
      return result;
    }),
});
