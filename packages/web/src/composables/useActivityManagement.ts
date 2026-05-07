import { ref, computed, onMounted } from 'vue';
import { trpc } from '../lib/trpc.js';

export function useActivityManagement() {
  const activities = ref<any[]>([]);
  const loading = ref(false);
  const error = ref('');
  const activityMap = ref<Record<string, any>>({});
  const agentOutputs = ref<Record<string, { output: string; duration: number; error?: string }>>({});

  async function fetchActivities() {
    loading.value = true;
    error.value = '';
    try {
      const list: any[] = await trpc.activity.list.query();
      activities.value = list;
      list.forEach(a => { activityMap.value[a.id] = a; });
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to load activities';
      console.error('Error fetching activities:', err);
    } finally {
      loading.value = false;
    }
  }

  async function startActivity(activityId: string) {
    try {
      await trpc.activity.start.mutate({ id: activityId });
      if (activityMap.value[activityId]) {
        activityMap.value[activityId].state = 'starting';
      }
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to start activity';
      throw err;
    }
  }

  async function stopActivity(activityId: string) {
    try {
      await trpc.activity.stop.mutate({ id: activityId });
      if (activityMap.value[activityId]) {
        activityMap.value[activityId].state = 'stopped';
      }
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to stop activity';
      throw err;
    }
  }

  async function executeAgent(agentId: string, useLocal: boolean = false) {
    try {
      const result: any = await trpc.agent.executeAgent.mutate({ agentId, useLocal });
      if (result) {
        agentOutputs.value[agentId] = {
          output: result.output || '',
          duration: result.duration || 0,
          error: result.error,
        };
        if (activityMap.value[agentId]) {
          activityMap.value[agentId].state = result.success ? 'running' : 'error';
          activityMap.value[agentId].error = result.error || null;
        }
      }
      return result;
    } catch (err: any) {
      agentOutputs.value[agentId] = { output: '', duration: 0, error: err.message };
      if (activityMap.value[agentId]) {
        activityMap.value[agentId].state = 'error';
        activityMap.value[agentId].error = err.message;
      }
      throw err;
    }
  }

  async function resetError(activityId: string) {
    try {
      await trpc.activity.resetError.mutate({ id: activityId });
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to reset error';
      throw err;
    }
  }

  function subscribeToStateChanges(activityId: string) {
    return trpc.liveSession.stateChanges.subscribe(
      { activityId },
      {
        onData: (event: any) => {
          if (activityMap.value[activityId]) {
            activityMap.value[activityId].state = event.newState;
            if (event.error) {
              activityMap.value[activityId].error = event.error;
            }
          }
        },
        onError: () => {},
      }
    );
  }

  onMounted(() => {
    fetchActivities();
  });

  return {
    activities: computed(() => activities.value),
    activityMap: computed(() => activityMap.value),
    agentOutputs: computed(() => agentOutputs.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchActivities,
    startActivity,
    stopActivity,
    executeAgent,
    resetError,
    subscribeToStateChanges,
  };
}
