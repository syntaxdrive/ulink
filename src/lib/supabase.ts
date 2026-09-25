/**
 * Supabase stub — replaces the real Supabase client.
 *
 * Supabase subscription has ended. This stub ensures the app loads
 * instantly without hanging on dead network calls. All auth and data
 * now goes through the NestJS backend via src/lib/api.ts.
 */

const makeQueryBuilder = (): any => {
  const q: any = {
    select: () => q,
    insert: () => q,
    update: () => q,
    delete: () => q,
    upsert: () => q,
    eq: () => q,
    neq: () => q,
    gt: () => q,
    gte: () => q,
    lt: () => q,
    lte: () => q,
    in: () => q,
    contains: () => q,
    is: () => q,
    not: () => q,
    or: () => q,
    filter: () => q,
    order: () => q,
    limit: () => q,
    range: () => q,
    match: () => q,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) =>
      Promise.resolve({ data: null, error: null, count: null }).then(resolve),
  };
  return q;
};

export const supabase: any = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: (_event: any, _callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithOAuth: () =>
      Promise.resolve({ data: null, error: { message: 'Google auth not configured' } }),
    signInWithPassword: () =>
      Promise.resolve({ data: null, error: { message: 'Use NestJS auth instead' } }),
    exchangeCodeForSession: () => Promise.resolve({ data: null, error: null }),
  },
  from: (_table: string) => makeQueryBuilder(),
  rpc: (_fn: string, _args?: any) => makeQueryBuilder(),
  storage: {
    from: (_bucket: string) => ({
      upload: () =>
        Promise.resolve({ data: null, error: { message: 'Storage not available' } }),
      remove: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      createSignedUrl: () =>
        Promise.resolve({ data: null, error: { message: 'Storage not available' } }),
    }),
  },
  channel: (_name: string) => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    subscribe: () => ({ unsubscribe: () => {} }),
    unsubscribe: () => {},
  }),
  removeChannel: (_channel: any) => {},
  removeAllChannels: () => {},
};
