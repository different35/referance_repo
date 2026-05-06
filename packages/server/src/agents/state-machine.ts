import { createMachine, assign } from "xstate";

export interface CLICommand {
  command: string;
  args?: string[];
  timeout?: number;
}

export interface ResearchSummary {
  notebookSourceId?: string;
  summary: string;
  cliCommandsExecuted: CLICommand[];
  timestamp: number;
}

export interface AgentContext {
  agentId: string;
  taskId: string;
  input: string;
  thoughts: string[];
  researchSummary: ResearchSummary | null;
  output: string;
  approvalStatus: "pending" | "approved" | "rejected";
  error: string | null;
  startedAt: number;
  completedAt: number | null;
}

export type AgentEvent =
  | { type: "START"; input: string; agentId: string }
  | { type: "THINKING_COMPLETE"; thoughts: string[] }
  | {
      type: "RESEARCH_COMPLETE";
      summary: string;
      notebookSourceId?: string;
      cliCommands?: CLICommand[];
    }
  | { type: "OUTPUT_READY"; output: string }
  | { type: "APPROVAL_REQUEST" }
  | { type: "APPROVE" }
  | { type: "REJECT"; reason: string }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

export const agentMachine = createMachine({
    id: "agent",
    initial: "idle" as const,
    context: {
    agentId: "",
    taskId: "",
    input: "",
    thoughts: [],
    researchSummary: null,
    output: "",
    approvalStatus: "pending",
    error: null,
    startedAt: 0,
    completedAt: null,
  },
  states: {
    idle: {
      on: {
        START: {
          target: "thinking",
          actions: assign(
            (_ctx, event: any) => {
              return {
                taskId: `task-${Date.now()}`,
                input: event.input || "",
                agentId: event.agentId || "",
                startedAt: Date.now(),
              };
            }
          ),
        },
      },
    },
    thinking: {
      on: {
        THINKING_COMPLETE: {
          target: "researching",
          actions: assign((_ctx, event: any) => {
            return {
              thoughts: event.thoughts || [],
            };
          }),
        },
        ERROR: {
          target: "error",
          actions: assign((_ctx, event: any) => {
            return {
              error: event.error || "Unknown error",
            };
          }),
        },
      },
    },
    researching: {
      on: {
        RESEARCH_COMPLETE: {
          target: "writing",
          actions: assign((_ctx, event: any) => {
            return {
              researchSummary: {
                notebookSourceId: event.notebookSourceId,
                summary: event.summary,
                cliCommandsExecuted: event.cliCommands || [],
                timestamp: Date.now(),
              },
            };
          }),
        },
        ERROR: {
          target: "error",
          actions: assign((ctx, event) => {
            const errEvent = event as any;
            return {
              error: errEvent.error || "Research error",
            };
          }),
        },
      },
    },
    writing: {
      on: {
        OUTPUT_READY: {
          target: "awaitingApproval",
          actions: assign((_ctx, event: any) => {
            return {
              output: event.output || "",
            };
          }),
        },
        ERROR: {
          target: "error",
          actions: assign((ctx, event) => {
            const errEvent = event as any;
            return {
              error: errEvent.error || "Writing error",
            };
          }),
        },
      },
    },
    awaitingApproval: {
      on: {
        APPROVE: {
          target: "completed",
          actions: [
            assign({
              approvalStatus: "approved" as const,
            }),
            assign({
              completedAt: Date.now(),
            }),
          ],
        },
        REJECT: {
          target: "rejected",
          actions: [
            assign({
              approvalStatus: "rejected" as const,
            }),
            assign({
              completedAt: Date.now(),
            }),
          ],
        },
      },
    },
    completed: {
      type: "final",
    },
    rejected: {
      type: "final",
    },
    error: {
      type: "final",
    },
  },
} as any);
