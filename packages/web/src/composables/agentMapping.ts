import type { Agent } from '../components/floor/types';

/**
 * Simple mapping from activity data to Agent interface
 * This bridges the "broken chain" between raw activity data and presentational component needs
 */
export function mapActivityToAgent(activity: any): Agent {
  // Map activity state to AgentCard status
  const statusMap: Record<string, 'active' | 'new' | 'idle' | 'error'> = {
    running: 'active',
    starting: 'new',
    stopping: 'idle',
    stopped: 'idle',
    error: 'error',
    idle: 'idle'
  };

  // Simple fixed progress based on state
  let progress: number = 0;
  if (activity.state === 'running') {
    progress = 50; // Fixed value for running
  } else if (activity.state === 'starting') {
    progress = 25; // Fixed value for starting
  } else if (activity.state === 'stopping') {
    progress = 75; // Fixed value for stopping
  }

  // Basic agent data - using placeholder values that match AgentCard expectations
  return {
    id: activity.id,
    name: activity.name || 'Unknown Agent',
    subtitle: 'AI Agent', // Fixed subtitle
    description: `Agent is currently ${activity.state}`, // Simple description
    status: statusMap[activity.state] || 'idle',
    progress,
    metrics: [], // Empty metrics for now
    tags: [], // Empty tags for now
    thumbnail: '🤖' // Default robot emoji
  };
}