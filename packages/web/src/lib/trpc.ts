import { createTRPCProxyClient, httpBatchLink, wsLink, splitLink } from '@trpc/client';
import type { AppRouter } from '@swarm/server';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: new WebSocket('ws://localhost:3000/trpc') as any,
      }),
      false: httpBatchLink({
        url: 'http://localhost:3000/trpc',
      }),
    }),
  ],
});
