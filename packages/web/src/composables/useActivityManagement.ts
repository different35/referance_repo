import { ref, computed, onMounted } from 'vue';
import { trpc } from '../lib/trpc.js';

export function useActivityManagement() {
  const activities = ref<any[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchActivities() {
    loading.value = true;
    error.value = '';
    try {
      activities.value = await trpc.activity.list.query();
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to load activities';
      console.error('Error fetching activities:', err);
    } finally {
      loading.value = false;
    }
  }

  async function startActivity(activityId: string) {
    try {
      const result = await trpc.activity.start.mutate({ id: activityId });
      const activity = activities.value.find((a) => a.id === activityId);
      if (activity) {
        activity.state = 'starting';
        activity.startedAt = new Date();
      }
      return result;
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to start activity';
      throw err;
    }
  }

  async function stopActivity(activityId: string) {
    try {
      const result = await trpc.activity.stop.mutate({ id: activityId });
      const activity = activities.value.find((a) => a.id === activityId);
      if (activity) {
        activity.state = 'stopped';
        activity.stoppedAt = new Date();
      }
      return result;
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to stop activity';
      throw err;
    }
  }

  function subscribeToStateChanges(activityId: string) {
    return trpc.liveSession.stateChanges.subscribe(
      { activityId },
      {
        onData: (event: any) => {
          const activity = activities.value.find((a) => a.id === activityId);
          if (activity) {
            activity.state = event.newState;
            if (event.error) {
              activity.error = event.error;
            }
          }
        },
        onError: (err: any) => {
          console.error('Subscription error:', err);
        },
      }
    );
  }

  onMounted(() => {
    fetchActivities();
  });

  return {
    activities: computed(() => activities.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchActivities,
    startActivity,
    stopActivity,
    subscribeToStateChanges,
  };
}
