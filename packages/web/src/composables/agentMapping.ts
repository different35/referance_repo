import type { Agent } from '../components/floor/types';

/**
 * Maps activity data from trpc to Agent interface for AgentCard component
 * This bridges the "broken chain" between raw activity data and presentational component needs
 */
export function mapActivityToAgent(activity: any): Agent {
  // Map activity state to AgentCard status
  const statusMap: Record<string, 'active' | 'new' | 'idle' | 'error'> = {
    running: 'active',
    starting: 'new',
    stopping: 'idle', // Treat stopping as idle for UI purposes
    stopped: 'idle',
    error: 'error',
    idle: 'idle'
  };

  // Determine progress based on state (simplified - could be enhanced with actual progress data)
  let progress: number = 0;
  if (activity.state === 'running') {
    // For running agents, show some progress indication
    progress = Math.min(95, Math.max(10, Date.now() % 100)); // Placeholder
  } else if (activity.state === 'starting') {
    progress = 5; // Just started
  } else if (activity.state === 'stopping') {
    progress = 90; // Almost done stopping
  } else if (activity.state === 'stopped' || activity.state === 'idle') {
    progress = 0; // Not running
  } else if (activity.state === 'error') {
    progress = 0; // Error state
  }

  // Generate meaningful subtitle and description based on agent name/mission
  const name = activity.name || 'Unknown Agent';
  const subtitle = generateSubtitle(name);
  const description = generateDescription(name, activity.state);

  // Determine thumbnail (emoji) based on agent name
  const thumbnail = getAgentThumbnail(name);

  // Generate metrics based on agent type and state
  const metrics = generateAgentMetrics(name, activity.state);

  // Generate tags based on agent characteristics
  const tags = generateAgentTags(name, activity.state);

  return {
    id: activity.id,
    name,
    subtitle,
    description,
    status: statusMap[activity.state] || 'idle',
    progress,
    metrics,
    tags,
    thumbnail
  };
}

/**
 * Generate subtitle based on agent name
 */
function generateSubtitle(name: string): string {
  const subtitleMap: Record<string, string> = {
    'agent-strategist': 'Co-CEO, First Principles',
    'agent-hey-sales': 'AI Voice Qualification & CRM',
    'agent-community': 'Skool Engagement & Retention',
    'agent-youtube': 'Video Performance & Retention',
    'agent-repurpose': 'Multi-Format Distribution',
    'agent-twitter': 'Outlier Growth & Engagement',
    'agent-linkedin': 'Network & Content Growth',
    'agent-visuals': 'SaaS Demo Animations & Metrics',
    'agent-gram': 'Instagram Beta Growth',
    'claude-data-analysis': 'Load, explore, visualize datasets',
    'claude-deep-researcher': 'Multi-step web research & citations',
    'claude-field-agent': 'Field operations & data collection',
    'claude-support-agent': 'Customer support & troubleshooting',
    'claude-structer-extractor': 'Unstructured → Typed JSON'
  };

  return subtitleMap[name] || 'Specialized AI Agent';
}

/**
 * Generate description based on agent name and state
 */
function generateDescription(name: string, state: string): string {
  const baseDescriptions: Record<string, string> = {
    'agent-strategist': 'Evaluated 4 strategic paths. First principles analysis on growth levers; burn optimization, and runway extension.',
    'agent-hey-sales': 'Just deployed. Awaiting first inbound leads. BANT qualification pipeline ready. Night guard: no calls 20:00–08:00.',
    'agent-community': 'First live cycle completed. Learning Skool member tracking — only top 30 visible; yearly subscribers need different churn signals.',
    'agent-youtube': 'TR content +32% CTR. Testing thumbnail variants. Retention drop at 4:20 mark identified.',
    'agent-repurpose': 'Converting videos → Twitter threads. 3 pending approval, 2 scheduled for publish.',
    'agent-twitter': '2 outlier posts identified this week. Engagement rate 4.2%, impressions up 18%.',
    'agent-linkedin': '+120 followers this month. Avg. 28 comments/post. Long-form outperforming short.',
    'agent-visuals': '4 animations in pipeline. Approval rate 75%. Dashboard graphs delivered.',
    'agent-gram': 'Audience research phase. Testing reels-first strategy. ICP mapping in progress.',
    'claude-data-analysis': 'Amplitude MCP bağlı. Veri setlerini analiz eder, grafik çizer, rapor üretir.',
    'claude-deep-researcher': 'Web araştırması, kaynak sentezi,atıflı rapor üretir.',
    'claude-field-agent': 'Saha operasyonları ve veri toplama görevlerini yürütür.',
    'claude-support-agent': 'Müşteri destek ve sorun giderme operations.',
    'claude-structer-extractor': 'E-posta, PDF, log → JSON schema dönüşümü.'
  };

  const baseDesc = baseDescriptions[name] || 'Performing specialized AI tasks';
  
  // Add state-specific context
  const stateContext: Record<string, string> = {
    running: 'Currently active and processing tasks.',
    starting: 'Initializing and preparing to start work.',
    stopping: 'Finishing current operations and shutting down.',
    stopped: 'Completed current task cycle and awaiting next mission.',
    error: 'Encountered an error requiring attention.',
    idle: 'Waiting for activation or next task assignment.'
  };

  const context = stateContext[state] || '';
  return context ? `${baseDesc} ${context}` : baseDesc;
}

/**
 * Get appropriate thumbnail/emoji for agent
 */
function getAgentThumbnail(name: string): string {
  const thumbnailMap: Record<string, string> = {
    'agent-strategist': '📊',
    'agent-hey-sales': '📞',
    'agent-community': '👥',
    'agent-youtube': '▶️',
    'agent-repurpose': '🔄',
    'agent-twitter': '🐦',
    'agent-linkedin': '💼',
    'agent-visuals': '🎨',
    'agent-gram': '📸',
    'claude-data-analysis': '📈',
    'claude-deep-researcher': '🔍',
    'claude-field-agent': '🏃‍♂️',
    'claude-support-agent': '🎧',
    'claude-structer-extractor': '📋'
  };

  return thumbnailMap[name] || '🤖';
}

/**
 * Generate metrics for agent card
 */
function generateAgentMetrics(name: string, state: string): Array<{ value: string; label: string; color?: 'yellow' | 'red' | 'blue' | 'green' | 'orange' | 'purple' }> {
  const metricsMap: Record<string, Array<{ value: string; label: string; color?: 'yellow' | 'red' | 'blue' | 'green' | 'orange' | 'purple' }>> = {
    'agent-strategist': [
      { value: '$1.8K', label: 'burn', color: 'yellow' },
      { value: 'TBD', label: 'revenue', color: 'red' },
      { value: '340K', label: 'runway', color: 'blue' }
    ],
    'agent-hey-sales': [
      { value: '+5m', label: 'speed to lead', color: 'green' },
      { value: '+68%', label: 'qualify', color: 'orange' },
      { value: '+95%', label: 'reach', color: 'blue' }
    ],
    'agent-community': [
      { value: '&gt;90%', label: 'retention', color: 'green' },
      { value: '+40%', label: 'weekly active', color: 'blue' },
      { value: '+12h', label: 'avg session', color: 'blue' } 
    ],
    'agent-youtube': [
      { value: 'CTR 6.2%', label: '', color: 'red' },
      { value: 'AVD 8:40', label: '', color: 'yellow' },
      { value: '52% ret.', label: '', color: 'blue' }
    ],
    'agent-repurpose': [
      { value: '3 pending', label: '', color: 'purple' },
      { value: '2 live', label: '', color: 'green' }
    ],
    'agent-twitter': [
      { value: '4.2% eng.', label: '', color: 'blue' },
      { value: '+18% imp.', label: '', color: 'green' }
    ],
    'agent-linkedin': [
      { value: '+120 follow', label: '', color: 'blue' },
      { value: '28 cmnt/post', label: '', color: 'blue' }
    ],
    'agent-visuals': [
      { value: '4 in pipe', label: '', color: 'purple' }, 
      { value: '75% appr.', label: '', color: 'green' }
    ],
    'agent-gram': [
      { value: 'BETA', label: '', color: 'purple' },
      { value: 'ICP research', label: '', color: 'blue' }
    ],
    'claude-data-analysis': [
      { value: 'Datasets', label: 'processed', color: 'purple' },
      { value: 'Charts', label: 'generated', color: 'blue' },
      { value: 'Reports', label: 'created', color: 'green' }
    ],
    'claude-deep-researcher': [
      { value: 'Sources', label: 'analyzed', color: 'blue' },
      { value: 'Citations', label: 'formatted', color: 'green' },
      { value: 'Pages', label: 'written', color: 'yellow' }
    ],
    'claude-field-agent': [
      { value: 'Tasks', label: 'completed', color: 'green' },
      { value: 'Data', label: 'points collected', color: 'blue' },
      { value: 'Accuracy', label: 'validation %', color: 'yellow' }
    ],
    'claude-support-agent': [
      { value: 'Tickets', label: 'resolved', color: 'green' },
      { value: 'Satisfaction', label: 'score', color: 'blue' },
      { value: 'Response', label: 'time avg', color: 'yellow' }
    ],
    'claude-structer-extractor': [
      { value: 'Documents', label: 'processed', color: 'green' },
      { value: 'Fields', label: 'extracted', color: 'blue' },
      { value: 'Schema', label: 'validations', color: 'purple' }
    ]
  };

    const baseMetrics = metricsMap[name] || [
      { value: 'Active', label: 'tasks', color: state === 'running' ? 'green' : 'blue' }
    ];

  // Adjust metrics based on state
  return baseMetrics.map(metric => {
    if (state === 'error') {
      return { ...metric, value: '0', label: metric.label };
    }
    if (state === 'idle' || state === 'stopped') {
      return { ...metric, value: '0', label: metric.label };
    }
    if (state === 'starting') {
      return { ...metric, value: '1', label: metric.label };
    }
    return metric;
  });
}

/**
 * Generate tags for agent card
 */
function generateAgentTags(name: string, state: string): string[] {
  const baseTags: Record<string, string[]> = {
    'agent-strategist': ['strategy', 'analysis', 'executive'],
    'agent-hey-sales': ['sales', 'crm', 'voice'],
    'agent-community': ['community', 'engagement', 'retention'],
    'agent-youtube': ['youtube', 'video', 'analytics'],
    'agent-repurpose': ['content', 'repurposing', 'distribution'],
    'agent-twitter': ['twitter', 'social', 'growth'],
    'agent-linkedin': ['linkedin', 'networking', 'professional'],
    'agent-visuals': ['design', 'visuals', 'animations'],
    'agent-gram': ['instagram', 'social', 'beta'],
    'claude-data-analysis': ['data', 'analysis', 'visualization'],
    'claude-deep-researcher': ['research', 'deep', 'analysis'],
    'claude-field-agent': ['field', 'operations', 'data'],
    'claude-support-agent': ['support', 'help', 'customer'],
    'claude-structer-extractor': ['extract', 'transform', 'json']
  };

  let tags = [...(baseTags[name] || ['ai-agent'])];
  
  // Add state tag
  if (state === 'running') tags.push('active');
  else if (state === 'error') tags.push('needs-attention');
  else if (state === 'idle') tags.push('available');
  
  return tags;
}