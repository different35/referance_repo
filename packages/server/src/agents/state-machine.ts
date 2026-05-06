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

export const agentMachine = createMachine<AgentContext, AgentEvent, any>({
  id: "agent",
  initial: "idle",
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
            (ctx, event) => {
              const startEvent = event as any;
              return {
                taskId: `task-${Date.now()}`,
                input: startEvent.input || "",
                agentId: startEvent.agentId || "",
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
          actions: assign((ctx, event) => {
            const thinkEvent = event as any;
            return {
              thoughts: thinkEvent.thoughts || [],
            };
          }),
        },
        ERROR: {
          target: "error",
          actions: assign((ctx, event) => {
            const errEvent = event as any;
            return {
              error: errEvent.error || "Unknown error",
            };
          }),
        },
      },
    },
    researching: {
      on: {
        RESEARCH_COMPLETE: {
          target: "writing",
          actions: assign((ctx, event) => {
            const resEvent = event as any;
            return {
              researchSummary: {
                notebookSourceId: resEvent.notebookSourceId,
                summary: resEvent.summary,
                cliCommandsExecuted: resEvent.cliCommands || [],
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
          actions: assign((ctx, event) => {
            const outEvent = event as any;
            return {
              output: outEvent.output || "",
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
          actions: assign({
            approvalStatus: "approved",
            completedAt: () => Date.now(),
          }),
        },
        REJECT: {
          target: "rejected",
          actions: assign({
            approvalStatus: "rejected",
            completedAt: () => Date.now(),
          }),
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
});
