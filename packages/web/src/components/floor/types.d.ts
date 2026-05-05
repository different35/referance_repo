export type AgentStatus = 'active' | 'new' | 'idle' | 'error';
export interface AgentMetric {
    value: string;
    label: string;
    color?: 'yellow' | 'red' | 'blue' | 'green' | 'orange' | 'purple';
}
export interface Agent {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    status: AgentStatus;
    progress?: number;
    metrics?: AgentMetric[];
    tags?: string[];
    thumbnail?: string;
}
export interface DepartmentGroup {
    id: string;
    name: string;
    color: string;
    agentCount: number;
    agents: Agent[];
}
