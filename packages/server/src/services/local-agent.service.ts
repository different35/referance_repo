/**
 * Local Agent Service - LM Studio Integration
 *
 * Connects to LM Studio running locally (OpenAI compatible)
 * For offline/local model execution without API costs
 */

import { OpenAI } from "openai";
import { agentEventBus } from "../agents/event-emitter.js";
import { getEnv } from "../env.js";

export interface LocalAgentTask {
  activityId: string;
  agentId: string;
  objective: string;
}

export interface LocalAgentResult {
  activityId: string;
  success: boolean;
  output: string;
  duration: number;
  error?: string;
}

export class LocalAgentService {
  private client: OpenAI;
  private baseUrl: string;
  private model: string;

  constructor(
    baseUrl?: string,
    model?: string
  ) {
    const env = getEnv();
    this.baseUrl = baseUrl ?? env.LM_STUDIO_URL;
    this.model = model ?? env.LM_STUDIO_MODEL;

    this.client = new OpenAI({
      baseURL: this.baseUrl,
      apiKey: "lm-studio",
    });
  }

  /**
   * Execute task using LM Studio local model
   * Streams output in real-time
   */
  async executeTask(
    task: LocalAgentTask,
    onOutput: (chunk: string) => void
  ): Promise<LocalAgentResult> {
    const startTime = Date.now();

    // Emit: task submitted
    agentEventBus.emitAgentEvent({
      type: "task_submitted",
      agentId: task.agentId,
      taskId: task.activityId,
      timestamp: Date.now(),
      data: { source: "lm-studio", model: this.model },
    });

    try {
      // Emit: thinking phase
      agentEventBus.emitAgentEvent({
        type: "thinking",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { phase: "local model processing" },
      });

      const systemPrompt = `You are an autonomous agent named "${task.agentId}".

Your objective: ${task.objective}

Provide a structured, detailed response in JSON format:
{
  "analysis": "Your analysis",
  "recommendations": ["rec1", "rec2"],
  "action_items": ["action1", "action2"],
  "risks": "Any risks or limitations"
}`;

      // Stream from LM Studio
      let fullOutput = "";

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: task.objective,
          },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Emit: researching phase
      agentEventBus.emitAgentEvent({
        type: "researching",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { streaming: true },
      });

      // Process stream chunks
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullOutput += content;
          onOutput(content); // Stream to client in real-time
        }
      }

      // Emit: writing phase complete
      agentEventBus.emitAgentEvent({
        type: "writing",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { outputLength: fullOutput.length },
      });

      // Emit: completed
      agentEventBus.emitAgentEvent({
        type: "completed",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { source: "lm-studio", success: true },
      });

      const duration = Date.now() - startTime;

      return {
        activityId: task.activityId,
        success: true,
        output: fullOutput,
        duration,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Emit: error
      agentEventBus.emitAgentEvent({
        type: "error",
        agentId: task.agentId,
        taskId: task.activityId,
        timestamp: Date.now(),
        data: { error: errorMessage, source: "lm-studio" },
      });

      const duration = Date.now() - startTime;

      return {
        activityId: task.activityId,
        success: false,
        output: "",
        duration,
        error: errorMessage,
      };
    }
  }

  /**
   * Direct chat completion (non-streaming)
   */
  async chat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<{ content: string; model: string; duration: number }> {
    const startTime = Date.now();
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });
    const duration = Date.now() - startTime;
    return {
      content: completion.choices[0]?.message?.content || '',
      model: completion.model || this.model,
      duration,
    };
  }

  /**
   * Check if LM Studio is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try to list models from LM Studio
      const models = await this.client.models.list();
      return models.data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available models from LM Studio
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.client.models.list();
      return models.data.map((m) => m.id);
    } catch (error) {
      console.error("Failed to fetch LM Studio models:", error);
      return [];
    }
  }
}

let localAgentInstance: LocalAgentService | null = null;

export function getLocalAgentService(): LocalAgentService {
  if (!localAgentInstance) {
    localAgentInstance = new LocalAgentService();
  }
  return localAgentInstance;
}
