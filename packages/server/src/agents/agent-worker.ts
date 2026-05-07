/**
 * Agent Worker
 *
 * Processes jobs from the BullMQ queue using appropriate agent executors
 * Emits events via agentEventBus during job processing
 */

import { Queue, Worker } from "bullmq";
import { getAgentQueue } from "./queue-manager.js";
import { agentEventBus } from "./event-emitter.js";
import { getAgentExecutor } from "../services/agent-executor.service.js";
import { getLocalAgentService } from "../services/local-agent.service.js";
import { getEnv } from "../env.js";

interface JobData {
  agentId: string;
  input: string;
  taskType: "campaign" | "content" | "analysis" | "approval";
  priority?: number;
}

interface JobResult {
  taskId: string;
  agentId: string;
  output: string;
  thoughts: string[];
  research: Record<string, unknown>[];
  completedAt: number;
}

interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

const logger: Logger = getEnv().LOG_LEVEL === "info"
  ? {
      info: (...args: unknown[]) => console.log("[INFO]", ...args),
      error: (...args: unknown[]) => console.error("[ERROR]", ...args),
      warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
      debug: (...args: unknown[]) => console.log("[DEBUG]", ...args)
    }
  : {
      info: (...args: unknown[]) => console.log("[INFO]", ...args),
      error: (...args: unknown[]) => console.error("[ERROR]", ...args),
      warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
      debug: (...args: unknown[]) => console.log("[DEBUG]", ...args)
    };

export class AgentWorker {
  private worker: Worker<JobData, Partial<JobResult>, string> | null = null;
  private agentExecutor = getAgentExecutor();
  private localAgentService = getLocalAgentService();
  private useLocalAgent = false;

  constructor() {
    // Determine which agent service to use based on availability and config
    this.initializeAgentSelection();
  }

  private async initializeAgentSelection() {
    try {
      const isLocalAvailable = await this.localAgentService.isAvailable();
      this.useLocalAgent = isLocalAvailable;
      logger.info(`Agent worker will use ${this.useLocalAgent ? 'LM Studio (local)' : 'Anthropic API'} executor`);
    } catch (error) {
      logger.warn(`Failed to check LM Studio availability, defaulting to Anthropic API: ${error}`);
      this.useLocalAgent = false;
    }
  }

  public async start(): Promise<void> {
    try {
      const queue = await getAgentQueue();

      this.worker = new Worker<JobData, Partial<JobResult>, string>(
        "agent-tasks",
        async (job) => {
          logger.info(`Processing job ${job.id} of type ${job.data.taskType} for agent ${job.data.agentId}`);

          // Emit: job started
          agentEventBus.emitAgentEvent({
            type: "task_submitted",
            agentId: job.data.agentId,
            taskId: job.id,
            timestamp: Date.now(),
            data: {
              jobId: job.id,
              taskType: job.data.taskType,
              input: job.data.input.substring(0, 100) + '...' // truncate for privacy
            }
          });

          // Emit: thinking phase
          agentEventBus.emitAgentEvent({
            type: "thinking",
            agentId: job.data.agentId,
            taskId: job.id,
            timestamp: Date.now(),
            data: { phase: "Starting job processing" }
          });

          let result: Partial<JobResult>;

          try {
            // Choose executor based on availability/config
            if (this.useLocalAgent) {
              result = await this.processWithLocalAgent(job);
            } else {
              result = await this.processWithAnthropicAgent(job);
            }

            // Emit: completed
            agentEventBus.emitAgentEvent({
              type: "completed",
              agentId: job.data.agentId,
              taskId: job.id,
              timestamp: Date.now(),
              data: {
                success: true,
                outputLength: result.output?.length || 0
              }
            });

            logger.info(`Job ${job.id} completed successfully`);
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Emit: error
            agentEventBus.emitAgentEvent({
              type: "error",
              agentId: job.data.agentId,
              taskId: job.id,
              timestamp: Date.now(),
              data: { error: errorMessage }
            });

            logger.error(`Job ${job.id} failed:`, error);
            throw error; // BullMQ will handle retries based on queue config
          }
        },
        {
          connection: (await getAgentQueue()).opts.connection,
          // Concurrency: process multiple jobs simultaneously
          concurrency: 5,
          // Job settings
          settings: {
            // Remove processed jobs after 1 hour
            removeOnComplete: { age: 3600 },
            // Remove failed jobs after 1 day
            removeOnFail: { age: 86400 },
          }
        }
      );

      // Worker event listeners
      this.worker.on("completed", (job: { id: string; returnvalue: Partial<JobResult> }) => {
        logger.info(`Job ${job.id} completed`, job.returnvalue);
      });

      this.worker.on("failed", (job: { id: string | undefined; failedReason: Error }, error: Error) => {
        logger.error(`Job ${job?.id} failed:`, error.message, job?.failedReason);
      });

      this.worker.on("error", (error: Error) => {
        logger.error(`Worker error:`, error);
      });

      logger.info("✅ Agent worker started successfully");
    } catch (error) {
      logger.error("Failed to start agent worker:", error);
      throw error;
    }
  }

  private async processWithAnthropicAgent(job: { data: JobData; id: string }): Promise<Partial<JobResult>> {
    // Map job data to AgentTask format
    const task: Parameters<typeof this.agentExecutor.executeTask>[0] = {
      activityId: job.data.agentId, // Using agentId as activityId for now
      agentId: job.data.agentId,
      missionName: `${job.data.taskType} task`,
      objective: job.data.input,
      context: null
    };

    const result = await this.agentExecutor.executeTask(task);

    return {
      taskId: result.activityId,
      agentId: job.data.agentId,
      output: result.output,
      thoughts: result.thinking,
      research: [], // Anthropic executor doesn't produce research in this format yet
      completedAt: Date.now()
    };
  }

  private async processWithLocalAgent(job: { data: JobData; id: string }): Promise<Partial<JobResult>> {
    // For local agent, we need to handle streaming differently
    let fullOutput = "";
    const thoughts: string[] = [];

    // Emit: researching phase
    agentEventBus.emitAgentEvent({
      type: "researching",
      agentId: job.data.agentId,
      taskId: job.id,
      timestamp: Date.now(),
      data: { streaming: true }
    });

    // Execute with local agent (this would normally stream output)
    // For simplicity in worker context, we'll collect the full output
    // In a real implementation, you might want to emit intermediate thoughts
    const result = await new Promise<{ activityId: string; success: boolean; output: string; duration: number }>((resolve, reject) => {
      this.localAgentService.executeTask(
        {
          activityId: job.data.agentId,
          agentId: job.data.agentId,
          objective: job.data.input
        },
        (chunk: string) => {
          fullOutput += chunk;
          // Could emit thinking updates here if we parsed the stream
          thoughts.push(chunk); // Simplified - just treating chunks as thoughts
        }
      ).then(resolve).catch(reject);
    });

    return {
      taskId: result.activityId,
      agentId: job.data.agentId,
      output: result.output,
      thoughts: thoughts,
      research: [], // Local agent doesn't produce structured research yet
      completedAt: Date.now()
    };
  }

  public async stop(): Promise<void> {
    if (this.worker) {
      logger.info("Stopping agent worker...");
      await this.worker.close();
      this.worker = null;
      logger.info("✅ Agent worker stopped");
    }
  }
}

// Create and export a singleton instance
let workerInstance: AgentWorker | null = null;

export function getAgentWorker(): AgentWorker {
  if (!workerInstance) {
    workerInstance = new AgentWorker();
  }
  return workerInstance;
}

// Start the worker if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = getAgentWorker();
  worker.start().catch((error) => {
    logger.error("Failed to start worker:", error);
    process.exit(1);
  });
}