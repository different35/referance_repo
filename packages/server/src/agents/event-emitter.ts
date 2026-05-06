import { EventEmitter } from "events";

export interface AgentEvent {
  type:
    | "task_submitted"
    | "thinking"
    | "researching"
    | "writing"
    | "approval_needed"
    | "completed"
    | "error";
  agentId: string;
  taskId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

class AgentEventBus extends EventEmitter {
  private eventHistory: AgentEvent[] = [];
  private maxHistory = 1000;

  emitAgentEvent(event: AgentEvent) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    this.emit("agent-event", event);
    this.emit(`agent-${event.agentId}`, event);
    this.emit(`task-${event.taskId}`, event);
  }

  getHistory(filter?: { agentId?: string; taskId?: string }): AgentEvent[] {
    if (!filter) return this.eventHistory;

    return this.eventHistory.filter((event) => {
      if (filter.agentId && event.agentId !== filter.agentId) return false;
      if (filter.taskId && event.taskId !== filter.taskId) return false;
      return true;
    });
  }

  clearHistory() {
    this.eventHistory = [];
  }

  subscribeToAgent(agentId: string, callback: (event: AgentEvent) => void) {
    this.on(`agent-${agentId}`, callback);
    return () => this.removeListener(`agent-${agentId}`, callback);
  }

  subscribeToTask(taskId: string, callback: (event: AgentEvent) => void) {
    this.on(`task-${taskId}`, callback);
    return () => this.removeListener(`task-${taskId}`, callback);
  }

  subscribeToAll(callback: (event: AgentEvent) => void) {
    this.on("agent-event", callback);
    return () => this.removeListener("agent-event", callback);
  }
}

export const agentEventBus = new AgentEventBus();
