export function normalizeAdminEmail(value = '') {
  return String(value || '').trim().toLowerCase()
}

export function getAdminEmailFromSession(session) {
  return normalizeAdminEmail(session?.user?.email || '')
}

export async function signInAdmin(supabase, email, password) {
  const safeEmail = normalizeAdminEmail(email)
  const safePassword = String(password || '')

  return supabase.auth.signInWithPassword({
    email: safeEmail,
    password: safePassword,
  })
}

export async function signOutAdmin(supabase) {
  return supabase.auth.signOut()
}

export async function resolveAdminAccess(supabase, session) {
  const email = getAdminEmailFromSession(session)

  if (!session?.user || !email) {
    return { isAdmin: false, email: '' }
  }

  const { data, error } = await supabase.rpc('psr_is_admin')

  if (error) {
    return {
      isAdmin: false,
      email,
      error,
    }
  }

  return {
    isAdmin: Boolean(data),
    email,
    error: null,
  }
}

export function getAdminAuthErrorMessage(error) {
  const raw = String(
    error?.message ||
    error?.error_description ||
    error?.description ||
    ''
  ).trim()

  if (!raw) return 'No se pudo iniciar sesión. Revisa correo y contraseña.'

  const normalized = raw.toLowerCase()

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_grant') ||
    normalized.includes('email or password')
  ) {
    return 'Correo o contraseña incorrectos.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'El correo admin aún no está confirmado en Supabase Auth.'
  }

  if (normalized.includes('signup is disabled')) {
    return 'El acceso por correo está deshabilitado en Supabase Auth.'
  }

  if (normalized.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento e inténtalo otra vez.'
  }

  return raw
}
