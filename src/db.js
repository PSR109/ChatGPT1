import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
export const supabaseConfigErrorMessage = 'Faltan variables de entorno de Supabase. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel o en tu archivo .env local.'

function createEnvError() {
  return new Error(supabaseConfigErrorMessage)
}

function rejectedResult() {
  return Promise.resolve({ data: null, error: createEnvError() })
}

function queryBuilderStub() {
  const stub = {
    select: () => stub,
    insert: () => rejectedResult(),
    update: () => rejectedResult(),
    upsert: () => rejectedResult(),
    delete: () => rejectedResult(),
    eq: () => stub,
    neq: () => stub,
    gt: () => stub,
    gte: () => stub,
    lt: () => stub,
    lte: () => stub,
    like: () => stub,
    ilike: () => stub,
    in: () => stub,
    contains: () => stub,
    containedBy: () => stub,
    overlap: () => stub,
    is: () => stub,
    not: () => stub,
    filter: () => stub,
    order: () => stub,
    limit: () => stub,
    range: () => stub,
    single: () => rejectedResult(),
    maybeSingle: () => rejectedResult(),
    then: (resolve) => Promise.resolve({ data: null, error: createEnvError() }).then(resolve),
    catch: (reject) => Promise.resolve({ data: null, error: createEnvError() }).catch(reject),
    finally: (callback) => Promise.resolve({ data: null, error: createEnvError() }).finally(callback),
  }
  return stub
}

function createSupabaseStub() {
  return {
    from: () => queryBuilderStub(),
    rpc: () => rejectedResult(),
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe() {} }) }) }),
    removeChannel: () => {},
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: createEnvError() }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      }),
      signInWithPassword: () => rejectedResult(),
      signOut: () => rejectedResult(),
    },
  }
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createSupabaseStub()

if (!hasSupabaseConfig) {
  console.error(supabaseConfigErrorMessage)
}
