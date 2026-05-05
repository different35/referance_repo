import { createTRPCProxyClient, httpBatchLink, wsLink, splitLink } from '@trpc/client';

export const trpc = createTRPCProxyClient<any>({
  links: [
    splitLink({
      condition(op: any) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: new WebSocket('ws://localhost:3000/trpc') as any,
      }),
      false: httpBatchLink({
        url: 'http://localhost:3000/trpc',
      } as any),
    }),
  ],
});
