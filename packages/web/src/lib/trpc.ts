import { createTRPCProxyClient, httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import type { AppRouter } from '@swarm/server';

const TRPC_URL = '/trpc';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({ url: TRPC_URL }),
      false: httpBatchLink({
        url: TRPC_URL,
        // Cast to any to avoid exactOptionalPropertyTypes issues with fetch init
        fetch: (url, opts) => fetch(url, { ...(opts as any), credentials: 'include' }) as Promise<Response>,
      }),
    }),
  ],
});
