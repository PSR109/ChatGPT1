import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../db.js'

const shell = {
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 16,
}

const card = {
  background: 'rgba(15,23,42,0.92)',
  border: '1px solid rgba(148,163,184,0.16)',
  borderRadius: 24,
  padding: 16,
  boxShadow: '0 12px 30px rgba(2,6,23,0.24)',
  overflow: 'hidden',
  minWidth: 0,
}

const featureCard = {
  background: 'linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(2,6,23,0.92) 100%)',
  border: '1px solid rgba(96,165,250,0.14)',
  borderRadius: 22,
  padding: 16,
  boxShadow: '0 18px 40px rgba(2,6,23,0.28)',
  overflow: 'hidden',
  minWidth: 0,
}

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(148,163,184,0.22)',
  background: 'rgba(2,6,23,0.72)',
  color: '#e2e8f0',
  boxSizing: 'border-box',
  outline: 'none',
  minWidth: 0,
}

const textarea = {
  ...input,
  resize: 'vertical',
  minHeight: 96,
}

const primaryButton = {
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  fontWeight: 800,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
  color: '#fff',
}

const secondaryButton = {
  border: '1px solid rgba(148,163,184,0.22)',
  borderRadius: 14,
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
  background: 'rgba(15,23,42,0.8)',
  color: '#e2e8f0',
}

const ghostButton = {
  ...secondaryButton,
  background: 'rgba(2,6,23,0.52)',
  padding: '8px 12px',
  borderRadius: 12,
  fontSize: 13,
}

const dangerButton = {
  ...secondaryButton,
  border: '1px solid rgba(248,113,113,0.4)',
  color: '#fecaca',
}

const infoChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: 'rgba(15,23,42,0.8)',
  border: '1px solid rgba(148,163,184,0.14)',
  color: '#cbd5e1',
}

const statCard = {
  background: 'rgba(2,6,23,0.58)',
  border: '1px solid rgba(148,163,184,0.12)',
  borderRadius: 18,
  padding: 14,
  minWidth: 0,
}

const subCard = {
  background: 'rgba(2,6,23,0.42)',
  border: '1px solid rgba(148,163,184,0.12)',
  borderRadius: 18,
  padding: 14,
  minWidth: 0,
}

const topicSuggestions = [
  '¿Quién se anima a ir este fin de semana?',
  'Busco rival para bajar tiempos en F1.',
  '¿Qué juego debería entrenar primero en PSR?',
  'Propongo un mini torneo entre clientes.',
]

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function getRelativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const diff = date.getTime() - Date.now()
  if (!Number.isFinite(diff)) return ''
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const minutes = Math.round(diff / 60000)
  const hours = Math.round(diff / 3600000)
  const days = Math.round(diff / 86400000)

  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(days, 'day')
}

function getFriendlyName(user) {
  return (
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')?.[0] ||
    'Piloto PSR'
  )
}

function getCountLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`
}

function getInitials(name) {
  const clean = String(name || 'PSR').trim()
  if (!clean) return 'PSR'
  const parts = clean.split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || '').join('') || clean.slice(0, 2).toUpperCase()
}

function getTopAuthors(items) {
  const counts = {}
  items.forEach((item) => {
    const key = (item?.user_name || 'Piloto PSR').trim()
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
}

function AuthBox({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authMessage,
  authLoading,
  onMagicLink,
  onPasswordLogin,
  onRegister,
}) {
  return (
    <div style={featureCard}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', textAlign: 'center' }}>Comunidad PSR</div>
        <div style={{ color: '#94a3b8', textAlign: 'center', lineHeight: 1.55 }}>
          Lee todo libremente. Para publicar, responder o moderar, entra con tu cuenta.
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setAuthMode('magic')}
            style={authMode === 'magic' ? primaryButton : secondaryButton}
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            style={authMode === 'password' ? primaryButton : secondaryButton}
          >
            Email + contraseña
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <input
            style={input}
            placeholder="Tu nombre para el foro"
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
          />
          <input
            style={input}
            type="email"
            placeholder="Tu correo"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
          />
          {authMode === 'password' && (
            <input
              style={input}
              type="password"
              placeholder="Tu contraseña"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
          )}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {authMode === 'magic' ? (
            <button type="button" onClick={onMagicLink} style={primaryButton} disabled={authLoading}>
              {authLoading ? 'Enviando enlace...' : 'Entrar con magic link'}
            </button>
          ) : (
            <>
              <button type="button" onClick={onPasswordLogin} style={primaryButton} disabled={authLoading}>
                {authLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <button type="button" onClick={onRegister} style={secondaryButton} disabled={authLoading}>
                {authLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </>
          )}
        </div>

        {authMessage ? (
          <div style={{ color: '#fbbf24', textAlign: 'center', lineHeight: 1.5 }}>{authMessage}</div>
        ) : null}
      </div>
    </div>
  )
}

export default function ForumSection({ isAdmin = false }) {
  const [posts, setPosts] = useState([])
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [forumMessage, setForumMessage] = useState('')
  const [composer, setComposer] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [expandedPosts, setExpandedPosts] = useState({})
  const [authMode, setAuthMode] = useState('magic')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [moderator, setModerator] = useState(false)

  async function loadModerator(userId) {
    const { data, error } = await supabase
      .from('forum_moderators')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      setModerator(false)
      return
    }

    setModerator(Boolean(data?.user_id))
  }

  async function loadForum() {
    setLoading(true)
    setForumMessage('')

    const [{ data: postsData, error: postsError }, { data: repliesData, error: repliesError }] = await Promise.all([
      supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('forum_replies').select('*').order('created_at', { ascending: true }),
    ])

    if (postsError || repliesError) {
      setForumMessage('No se pudo cargar la comunidad. Revisa las tablas del foro en Supabase.')
      setPosts([])
      setReplies([])
      setLoading(false)
      return
    }

    setPosts(Array.isArray(postsData) ? postsData : [])
    setReplies(Array.isArray(repliesData) ? repliesData : [])
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true

    async function boot() {
      const [{ data: sessionData }] = await Promise.all([
        supabase.auth.getSession(),
        loadForum(),
      ])

      if (!mounted) return

      setSession(sessionData.session || null)
      setAuthEmail(sessionData.session?.user?.email || '')
      setAuthName(getFriendlyName(sessionData.session?.user))
      if (sessionData.session?.user) {
        await loadModerator(sessionData.session.user.id)
      }
    }

    boot()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession || null)
      setAuthEmail(nextSession?.user?.email || '')
      setAuthName(getFriendlyName(nextSession?.user))
      setAuthPassword('')
      if (nextSession?.user?.id) {
        await loadModerator(nextSession.user.id)
      } else {
        setModerator(false)
      }
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const repliesByPost = useMemo(() => {
    const grouped = {}
    replies.forEach((reply) => {
      if (!grouped[reply.post_id]) grouped[reply.post_id] = []
      grouped[reply.post_id].push(reply)
    })
    return grouped
  }, [replies])

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aReplies = repliesByPost[a.id] || []
      const bReplies = repliesByPost[b.id] || []
      const aLast = aReplies[aReplies.length - 1]?.created_at || a.created_at || ''
      const bLast = bReplies[bReplies.length - 1]?.created_at || b.created_at || ''
      return new Date(bLast).getTime() - new Date(aLast).getTime()
    })
  }, [posts, repliesByPost])


  const totalReplies = replies.length
  const activeTodayCount = useMemo(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const timestamps = [...posts, ...replies]
      .map((item) => new Date(item?.created_at || '').getTime())
      .filter((value) => Number.isFinite(value) && value >= start)
    return timestamps.length
  }, [posts, replies])

  const topAuthors = useMemo(() => getTopAuthors([...posts, ...replies]), [posts, replies])
  const communityMomentum = activeTodayCount >= 6 ? 'Muy activa hoy' : activeTodayCount >= 2 ? 'Moviéndose hoy' : 'Lista para activarse'

  function canManage(item) {
    const currentUserId = session?.user?.id
    return Boolean(currentUserId && (item.author_id === currentUserId || moderator))
  }

  function togglePostExpanded(postId) {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  function applyTopicSuggestion(suggestion) {
    setComposer((prev) => (prev.trim() ? `${prev.trim()}

${suggestion}` : suggestion))
  }

  async function handleMagicLink() {
    if (!authEmail.trim()) {
      setAuthMessage('Escribe tu correo primero.')
      return
    }

    setAuthLoading(true)
    setAuthMessage('')

    const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        emailRedirectTo: redirectTo,
        data: { display_name: authName.trim() || authEmail.trim().split('@')[0] },
      },
    })

    setAuthLoading(false)

    if (error) {
      setAuthMessage(error.message || 'No se pudo enviar el enlace.')
      return
    }

    setAuthMessage('Te envié el enlace a tu correo. Ábrelo y vuelve a la app.')
  }

  async function handlePasswordLogin() {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage('Falta correo o contraseña.')
      return
    }

    setAuthLoading(true)
    setAuthMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    })

    setAuthLoading(false)

    if (error) {
      setAuthMessage(error.message || 'No se pudo iniciar sesión.')
      return
    }

    setAuthMessage('')
  }

  async function handleRegister() {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage('Para crear cuenta necesitas correo y contraseña.')
      return
    }

    setAuthLoading(true)
    setAuthMessage('')

    const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined
    const { error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPassword,
      options: {
        emailRedirectTo: redirectTo,
        data: { display_name: authName.trim() || authEmail.trim().split('@')[0] },
      },
    })

    setAuthLoading(false)

    if (error) {
      setAuthMessage(error.message || 'No se pudo crear la cuenta.')
      return
    }

    setAuthMessage('Cuenta creada. Revisa tu correo si Supabase pide confirmación.')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setForumMessage('')
  }

  async function handlePublishPost() {
    const clean = composer.trim()
    if (!session?.user) {
      setForumMessage('Debes iniciar sesión para publicar.')
      return
    }
    if (!clean) return

    const payload = {
      author_id: session.user.id,
      user_name: authName.trim() || getFriendlyName(session.user),
      content: clean,
    }

    const { error } = await supabase.from('forum_posts').insert([payload])

    if (error) {
      setForumMessage(error.message || 'No se pudo publicar el tema.')
      return
    }

    setComposer('')
    setEditingPostId(null)
    await loadForum()
  }

  async function handleSavePost(postId) {
    const clean = composer.trim()
    if (!clean) return

    const { error } = await supabase
      .from('forum_posts')
      .update({
        content: clean,
        user_name: authName.trim() || getFriendlyName(session?.user),
      })
      .eq('id', postId)

    if (error) {
      setForumMessage(error.message || 'No se pudo actualizar el tema.')
      return
    }

    setComposer('')
    setEditingPostId(null)
    await loadForum()
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('¿Eliminar esta publicación con todas sus respuestas?')) return

    const { error } = await supabase.from('forum_posts').delete().eq('id', postId)

    if (error) {
      setForumMessage(error.message || 'No se pudo eliminar la publicación.')
      return
    }

    await loadForum()
  }

  async function handleReply(postId) {
    const clean = (replyDrafts[postId] || '').trim()
    if (!session?.user) {
      setForumMessage('Debes iniciar sesión para responder.')
      return
    }
    if (!clean) return

    const { error } = await supabase.from('forum_replies').insert([
      {
        post_id: postId,
        author_id: session.user.id,
        user_name: authName.trim() || getFriendlyName(session.user),
        content: clean,
      },
    ])

    if (error) {
      setForumMessage(error.message || 'No se pudo publicar la respuesta.')
      return
    }

    setReplyDrafts((prev) => ({ ...prev, [postId]: '' }))
    setEditingReplyId(null)
    setExpandedPosts((prev) => ({ ...prev, [postId]: true }))
    await loadForum()
  }

  async function handleSaveReply(reply) {
    const clean = (replyDrafts[reply.id] || '').trim()
    if (!clean) return

    const { error } = await supabase
      .from('forum_replies')
      .update({
        content: clean,
        user_name: authName.trim() || getFriendlyName(session?.user),
      })
      .eq('id', reply.id)

    if (error) {
      setForumMessage(error.message || 'No se pudo actualizar la respuesta.')
      return
    }

    setReplyDrafts((prev) => ({ ...prev, [reply.id]: '' }))
    setEditingReplyId(null)
    await loadForum()
  }

  async function handleDeleteReply(replyId) {
    if (!window.confirm('¿Eliminar esta respuesta?')) return

    const { error } = await supabase.from('forum_replies').delete().eq('id', replyId)

    if (error) {
      setForumMessage(error.message || 'No se pudo eliminar la respuesta.')
      return
    }

    await loadForum()
  }

  return (
    <div style={shell}>
      <div style={featureCard}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'inline-flex', width: 'fit-content', ...infoChip, background: 'rgba(249,115,22,0.14)', color: '#fdba74', border: '1px solid rgba(249,115,22,0.22)' }}>
              Comunidad activa PSR
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
              Organízate, compite y vuelve al local con más ganas.
            </div>
            <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
              Este espacio sirve para coordinar tandas, hablar de tiempos, proponer ideas y mantener viva la comunidad entre una visita y otra.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={infoChip}>Lectura pública</span>
            <span style={infoChip}>Escritura con login</span>
            <span style={infoChip}>Ordenado por actividad</span>
            <span style={{ ...infoChip, background: 'rgba(34,197,94,0.14)', color: '#bbf7d0' }}>{communityMomentum}</span>
            {isAdmin && moderator ? (
              <span style={{ ...infoChip, background: 'rgba(124,58,237,0.18)', color: '#ddd6fe' }}>
                Moderación activa
              </span>
            ) : null}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
            }}
          >
            <div style={statCard}>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Temas
              </div>
              <div style={{ color: '#f8fafc', fontSize: 28, fontWeight: 900 }}>{posts.length}</div>
              <div style={{ color: '#cbd5e1', fontSize: 13 }}>Conversaciones abiertas</div>
            </div>
            <div style={statCard}>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Respuestas
              </div>
              <div style={{ color: '#f8fafc', fontSize: 28, fontWeight: 900 }}>{totalReplies}</div>
              <div style={{ color: '#cbd5e1', fontSize: 13 }}>Actividad acumulada</div>
            </div>
            <div style={statCard}>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Hoy
              </div>
              <div style={{ color: '#f8fafc', fontSize: 28, fontWeight: 900 }}>{activeTodayCount}</div>
              <div style={{ color: '#cbd5e1', fontSize: 13 }}>Publicaciones y respuestas</div>
            </div>
          </div>

          {topAuthors.length > 0 ? (
            <div style={{ ...subCard, display: 'grid', gap: 10 }}>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16 }}>Pilotos que más mueven la comunidad</div>
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {topAuthors.map(([name, count], index) => (
                  <div key={name} style={{ ...statCard, padding: 12 }}>
                    <div style={{ color: '#fdba74', fontSize: 12, fontWeight: 800 }}>TOP {index + 1}</div>
                    <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>{name}</div>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{getCountLabel(count, 'aporte', 'aportes')}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {session?.user ? (
            <div style={{ ...subCard, background: 'rgba(2,6,23,0.62)' }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>Sesión iniciada</div>
                <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>{authName.trim() || getFriendlyName(session.user)}</strong> · {session.user.email}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleLogout} style={secondaryButton}>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AuthBox
              authMode={authMode}
              setAuthMode={setAuthMode}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authName={authName}
              setAuthName={setAuthName}
              authMessage={authMessage}
              authLoading={authLoading}
              onMagicLink={handleMagicLink}
              onPasswordLogin={handlePasswordLogin}
              onRegister={handleRegister}
            />
          )}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fdba74', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Participa
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#f8fafc' }}>
              {editingPostId ? 'Editar publicación' : 'Abrir nuevo tema'}
            </div>
            <div style={{ color: '#94a3b8', lineHeight: 1.55 }}>
              Haz preguntas, propón desafíos o coordina una ida al local. Mientras más claro el mensaje, mejor responde la comunidad.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topicSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => applyTopicSuggestion(suggestion)}
                style={ghostButton}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <textarea
            style={{ ...textarea, minHeight: 110 }}
            placeholder="Ejemplo: ¿Quién se anima este fin de semana a una fecha de rally en PSR?"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
          />

          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div style={subCard}>
              <div style={{ color: '#f8fafc', fontWeight: 800 }}>Qué conviene publicar</div>
              <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.55 }}>Preguntas concretas, invitaciones a competir, ideas de eventos y mejoras para PSR.</div>
            </div>
            <div style={subCard}>
              <div style={{ color: '#f8fafc', fontWeight: 800 }}>Qué ayuda a responder</div>
              <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.55 }}>Decir juego, horario, circuito o qué necesitas. Entre más claro, mejor conversación.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {editingPostId ? (
              <>
                <button type="button" onClick={() => handleSavePost(editingPostId)} style={primaryButton}>
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostId(null)
                    setComposer('')
                  }}
                  style={secondaryButton}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" onClick={handlePublishPost} style={primaryButton}>
                Publicar tema
              </button>
            )}
          </div>

          <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
            {session?.user ? 'Puedes publicar y responder de inmediato.' : 'Ahora mismo solo puedes leer. Entra para publicar.'}
          </div>

          {forumMessage ? <div style={{ color: '#fbbf24', lineHeight: 1.5 }}>{forumMessage}</div> : null}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {loading ? (
          <div style={card}>Cargando comunidad...</div>
        ) : sortedPosts.length === 0 ? (
          <div style={card}>Todavía no hay publicaciones. La primera puede ser tuya.</div>
        ) : (
          sortedPosts.map((post) => {
            const postReplies = repliesByPost[post.id] || []
            const lastActivity = postReplies[postReplies.length - 1]?.created_at || post.created_at
            const lastReply = postReplies[postReplies.length - 1]
            const isExpanded = typeof expandedPosts[post.id] === 'boolean' ? expandedPosts[post.id] : sortedPosts.findIndex((item) => item.id === post.id) < 2
            return (
              <div key={post.id} style={card}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ ...infoChip, background: 'rgba(59,130,246,0.14)', color: '#bfdbfe' }}>Tema</span>
                    <span style={infoChip}>{getCountLabel(postReplies.length, 'respuesta', 'respuestas')}</span>
                    <span style={infoChip}>Activo {getRelativeTime(lastActivity)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 16,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(59,130,246,0.18))',
                        border: '1px solid rgba(148,163,184,0.16)',
                        color: '#f8fafc',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(post.user_name || 'Piloto PSR')}
                    </div>
                    <div style={{ minWidth: 0, display: 'grid', gap: 8, flex: 1 }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0, display: 'grid', gap: 4, flex: '1 1 300px' }}>
                          <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 20, lineHeight: 1.38, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {post.content}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                            {post.user_name || 'Piloto PSR'} · {formatDate(post.created_at)}
                          </div>
                        </div>

                        {canManage(post) ? (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPostId(post.id)
                                setComposer(post.content || '')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              style={secondaryButton}
                            >
                              Editar
                            </button>
                            <button type="button" onClick={() => handleDeletePost(post.id)} style={dangerButton}>
                              Eliminar
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                        <div style={subCard}>
                          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6 }}>Última actividad</div>
                          <div style={{ color: '#f8fafc', fontWeight: 800, marginTop: 4 }}>{formatDate(lastActivity)}</div>
                        </div>
                        <div style={subCard}>
                          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6 }}>Estado</div>
                          <div style={{ color: '#f8fafc', fontWeight: 800, marginTop: 4 }}>{postReplies.length > 0 ? 'Tema con movimiento' : 'Esperando primera respuesta'}</div>
                        </div>
                      </div>

                      {lastReply ? (
                        <div style={{ ...subCard, display: 'grid', gap: 6 }}>
                          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            Última respuesta
                          </div>
                          <div style={{ color: '#e2e8f0', lineHeight: 1.55, wordBreak: 'break-word' }}>{lastReply.content}</div>
                          <div style={{ color: '#94a3b8', fontSize: 13 }}>
                            {lastReply.user_name || 'Piloto PSR'} · {formatDate(lastReply.created_at)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => togglePostExpanded(post.id)} style={secondaryButton}>
                      {isExpanded ? 'Ocultar respuestas' : `Ver respuestas (${postReplies.length})`}
                    </button>
                  </div>

                  {isExpanded ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ color: '#f8fafc', fontSize: 16, fontWeight: 800 }}>
                        Respuestas ({postReplies.length})
                      </div>

                      {postReplies.length === 0 ? (
                        <div style={subCard}>
                          <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>Todavía no responde nadie. Sé el primero en mover este tema.</div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {postReplies.map((reply) => (
                            <div key={reply.id} style={subCard}>
                              <div style={{ display: 'grid', gap: 8 }}>
                                {editingReplyId === reply.id ? (
                                  <>
                                    <textarea
                                      style={{ ...textarea, minHeight: 84 }}
                                      value={replyDrafts[reply.id] ?? reply.content ?? ''}
                                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [reply.id]: e.target.value }))}
                                    />
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      <button type="button" onClick={() => handleSaveReply(reply)} style={primaryButton}>
                                        Guardar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingReplyId(null)
                                          setReplyDrafts((prev) => ({ ...prev, [reply.id]: '' }))
                                        }}
                                        style={secondaryButton}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                      <div
                                        style={{
                                          width: 36,
                                          height: 36,
                                          borderRadius: 12,
                                          display: 'grid',
                                          placeItems: 'center',
                                          background: 'rgba(59,130,246,0.14)',
                                          border: '1px solid rgba(148,163,184,0.14)',
                                          color: '#e2e8f0',
                                          fontWeight: 900,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {getInitials(reply.user_name || 'Piloto PSR')}
                                      </div>
                                      <div style={{ minWidth: 0, display: 'grid', gap: 6, flex: 1 }}>
                                        <div style={{ color: '#e2e8f0', lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{reply.content}</div>
                                        <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.45 }}>
                                          {reply.user_name || 'Piloto PSR'} · {formatDate(reply.created_at)}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {canManage(reply) && editingReplyId !== reply.id ? (
                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingReplyId(reply.id)
                                        setReplyDrafts((prev) => ({ ...prev, [reply.id]: reply.content || '' }))
                                      }}
                                      style={secondaryButton}
                                    >
                                      Editar
                                    </button>
                                    <button type="button" onClick={() => handleDeleteReply(reply.id)} style={dangerButton}>
                                      Eliminar
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div style={{ ...subCard, display: 'grid', gap: 10 }}>
                    <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16 }}>
                      {session?.user ? 'Responder este tema' : 'Inicia sesión para responder'}
                    </div>
                    <textarea
                      style={{ ...textarea, minHeight: 88 }}
                      placeholder={session?.user ? 'Responde algo útil, corto y claro…' : 'Inicia sesión para responder'}
                      value={replyDrafts[post.id] || ''}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      disabled={!session?.user}
                    />
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleReply(post.id)}
                        style={session?.user ? primaryButton : { ...secondaryButton, cursor: 'not-allowed', opacity: 0.7 }}
                        disabled={!session?.user}
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
