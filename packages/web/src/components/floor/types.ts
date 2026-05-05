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
  progress?: number;       // 0-100, dikey progress bar
  metrics?: AgentMetric[];
  tags?: string[];
  thumbnail?: string;      // emoji veya kısa etiket
}

export interface DepartmentGroup {
  id: string;
  name: string;
  color: string;           // Tailwind text color class
  agentCount: number;
  agents: Agent[];
}
