import { router } from '../trpc.js';
import { authRouter } from './auth.router.js';
import { activityRouter } from './activity.router.js';
import { missionRouter } from './mission.router.js';
import { proxyRouter } from './proxy.router.js';

export const appRouter = router({
  auth: authRouter,
  activity: activityRouter,
  mission: missionRouter,
  proxy: proxyRouter,
});

export type AppRouter = typeof appRouter;
