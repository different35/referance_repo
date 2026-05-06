import { Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";
import type { AgentContext } from "./state-machine.js";

export interface JobData {
  agentId: string;
  input: string;
  taskType: "campaign" | "content" | "analysis" | "approval";
  priority?: number;
}

export interface JobResult {
  taskId: string;
  agentId: string;
  output: string;
  thoughts: string[];
  research: Record<string, unknown>[];
  completedAt: number;
}

let agentQueue: Queue<JobData> | null = null;
let queueEvents: QueueEvents | null = null;
let redisClient: Redis | null = null;

export async function initializeQueue() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  redisClient = new Redis(redisUrl);

  agentQueue = new Queue<JobData>("agent-tasks", {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  queueEvents = new QueueEvents("agent-tasks", {
    connection: redisClient,
  });

  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`✅ Job ${jobId} completed`, returnvalue);
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`❌ Job ${jobId} failed:`, failedReason);
  });

  console.log("✅ Agent task queue initialized");
  return agentQueue;
}

export async function getAgentQueue() {
  if (!agentQueue) {
    await initializeQueue();
  }
  return agentQueue!;
}

export async function enqueueAgentTask(
  taskType: JobData["taskType"],
  agentId: string,
  input: string,
  priority?: number
) {
  const queue = await getAgentQueue();
  const job = await queue.add(
    `${taskType}-${agentId}`,
    {
      agentId,
      input,
      taskType,
    },
    {
      priority: priority || 5,
      jobId: `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }
  );

  return job;
}

export async function getJobStatus(jobId: string) {
  const queue = await getAgentQueue();
  const job = await queue.getJob(jobId);

  if (!job) return null;

  return {
    id: job.id,
    state: await job.getState(),
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
  };
}

export async function closeQueue() {
  if (queueEvents) {
    await queueEvents.close();
  }
  if (agentQueue) {
    await agentQueue.close();
  }
  if (redisClient) {
    await redisClient.quit();
  }
}
