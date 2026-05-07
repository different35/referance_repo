import { router } from '../trpc.js';
import { authRouter } from './auth.router.js';
import { activityRouter } from './activity.router.js';
import { missionRouter } from './mission.router.js';
import { proxyRouter } from './proxy.router.js';
import { liveSessionRouter } from './live-session.router.js';
import { agentRouter } from './agent.router.js';
import { localModelRouter } from './local-model.router.js';
import { skillsRouter } from './skills.router.js';

export const appRouter = router({
  auth: authRouter,
  activity: activityRouter,
  mission: missionRouter,
  proxy: proxyRouter,
  liveSession: liveSessionRouter,
  agent: agentRouter,
  localModel: localModelRouter,
  skills: skillsRouter,
});

export type AppRouter = typeof appRouter;
