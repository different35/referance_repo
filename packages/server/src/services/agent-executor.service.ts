import { Anthropic } from "@anthropic-ai/sdk";
import { agentEventBus } from "../agents/event-emitter.js";

export interface AgentTask {
  activityId: string;
  agentId: string;
  missionName: string;
  objective: string;
  context: Record<string, unknown> | null;
}

export interface AgentResult {
  activityId: string;
  success: boolean;
  output: string;
  thinking: string[];
  tokenUsage: { input: number; output: number };
  duration: number;
  error?: string;
}

export class AgentExecutor {
  private client: Anthropic;
  private model = "claude-3-5-sonnet-20241022";

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async executeTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const thoughts: string[] = [];

    agentEventBus.emitAgentEvent({
      type: "task_submitted",
      agentId: task.agentId,
      taskId: task.activityId,
      timestamp: Date.now(),
      data: { missionName: task.missionName },
    });

    try {
      agentEventBus.emitAgentEvent({
        type: "thinking",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { phase: "analyzing objective" },
      });

      const systemPrompt = this.buildSystemPrompt(task);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Mission: ${task.missionName}\n\nObjective:\n${task.objective}\n\n${task.context ? `Context:\n${JSON.stringify(task.context, null, 2)}` : ""}`,
          },
        ],
        system: systemPrompt,
      });

      let outputText = "";
      for (const block of response.content) {
        if (block.type === "text") {
          outputText = block.text;
          thoughts.push(outputText);
        }
      }

      agentEventBus.emitAgentEvent({
        type: "researching",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { thoughts: thoughts.length },
      });

      agentEventBus.emitAgentEvent({
        type: "writing",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { outputLength: outputText.length },
      });

      agentEventBus.emitAgentEvent({
        type: "completed",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { success: true },
      });

      const duration = Date.now() - startTime;

      return {
        activityId: task.activityId,
        success: true,
        output: outputText,
        thinking: thoughts,
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
        duration,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;

      agentEventBus.emitAgentEvent({
        type: "error",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { error: errorMessage },
      });

      const duration = Date.now() - startTime;

      return {
        activityId: task.activityId,
        success: false,
        output: "",
        thinking: thoughts,
        tokenUsage: { input: 0, output: 0 },
        duration,
        error: errorMessage,
      };
    }
  }

  private buildSystemPrompt(task: AgentTask): string {
    return `You are an autonomous agent named "${task.agentId}".

Your mission: ${task.missionName}

Instructions:
1. Analyze the objective carefully
2. Think through your approach (you can use extended thinking)
3. Provide a detailed, structured response
4. Be specific and actionable in your recommendations
5. If there are risks or limitations, mention them clearly

Respond in JSON format with:
{
  "analysis": "Your analysis here",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "action_items": ["action 1", "action 2"],
  "risks": "Any risks or limitations",
  "estimated_impact": "Expected outcomes"
}`;
  }
}

let executorInstance: AgentExecutor | null = null;

export function getAgentExecutor(): AgentExecutor {
  if (!executorInstance) {
    executorInstance = new AgentExecutor();
  }
  return executorInstance;
}
