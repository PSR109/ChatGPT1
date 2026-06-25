import { useEffect, useState } from 'react'
import Icon from './Icon'

const primaryTabs = [
  { key: 'COMMERCIAL', label: 'Inicio', icon: 'home' },
  { key: 'BOOKINGS', label: 'Reservas', icon: 'calendar' },
  { key: 'GENERAL', label: 'Ranking', icon: 'trophy' },
]

const communityTabs = [
  { key: 'PROFILE', label: 'Perfil piloto', icon: 'users', desc: 'Tus tiempos y progreso' },
  { key: 'FORUM', label: 'Foro', icon: 'chat', desc: 'Conversa con la comunidad' },
  { key: 'POINTS', label: 'Puntos', icon: 'star', desc: 'Tabla de puntos' },
  { key: 'WEEKLY', label: 'Desafío semanal', icon: 'flag', desc: 'Reto de la semana' },
  { key: 'MONTHLY', label: 'Desafío mensual', icon: 'trophy', desc: 'Reto del mes' },
]

const adminTab = { key: 'ADMIN', label: 'Admin', icon: 'shield' }

function getTabButtonStyle(active) {
  return {
    flex: 1,
    minWidth: 0,
    border: '1px solid transparent',
    background: active ? 'linear-gradient(180deg, #2981F3 0%, #1E5FB7 100%)' : 'rgba(255,255,255,0.04)',
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.78)',
    borderColor: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)',
    borderRadius: 'var(--r-md)',
    padding: '10px 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontWeight: 700,
    fontSize: 12,
    boxShadow: active ? 'var(--sh-blue)' : 'none',
    transition: 'color .15s ease, background .15s ease',
  }
}

export default function MainTabsNav({
  viewMode,
  onNavigate,
  isMoreOpen,
  setIsMoreOpen,
  isAdmin,
  onOpenAdmin,
  onExitAdmin,
}) {
  const [isCompactViewport, setIsCompactViewport] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 420
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const syncViewport = () => setIsCompactViewport(window.innerWidth <= 420)
    syncViewport()
    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const activePrimary = primaryTabs.some((tab) => tab.key === viewMode) ? viewMode : null
  const isMoreActive = communityTabs.some((tab) => tab.key === viewMode) || viewMode === adminTab.key || isAdmin

  const handlePrimaryClick = (key) => {
    onNavigate(key)
  }

  const handleSecondaryClick = (key) => {
    onNavigate(key)
  }

  const handleAdminClick = () => {
    if (isAdmin && onExitAdmin) {
      onExitAdmin()
      return
    }

    if (onOpenAdmin) {
      onOpenAdmin()
      return
    }

    handleSecondaryClick(adminTab.key)
  }

  return (
    <>
      {isMoreOpen ? (
        <button
          type="button"
          aria-label="Cerrar más"
          onClick={() => setIsMoreOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            padding: 0,
            margin: 0,
            zIndex: 79,
            cursor: 'pointer',
          }}
        />
      ) : null}

      {isMoreOpen ? (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: isCompactViewport ? 88 : 96,
            transform: 'translateX(-50%)',
            width: isCompactViewport ? 'min(96vw, 420px)' : 'min(92vw, 520px)',
            zIndex: 80,
            borderRadius: 'var(--r-lg)',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'linear-gradient(180deg, rgba(8,20,32,0.98) 0%, rgba(6,12,22,0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            padding: isCompactViewport ? 12 : 16,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: '#FFFFFF' }}>Más secciones</div>
          <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, marginBottom: 14 }}>
            Comunidad, desafíos y herramientas de gestión.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              marginBottom: 12,
            }}
          >
            {communityTabs.map((item) => {
              const active = viewMode === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => handleSecondaryClick(item.key)}
                  style={{
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: active ? 'rgba(41,129,243,0.20)' : 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--r-md)',
                    minHeight: 68,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: '#7cc4ff', display: 'inline-flex', flexShrink: 0 }}><Icon name={item.icon} size={20} /></span>
                  <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                    <span>{item.label}</span>
                    {item.desc ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', lineHeight: 1.2 }}>
                        {item.desc}
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleAdminClick}
            style={{
              width: '100%',
              border: '1px solid rgba(41,129,243,0.35)',
              background: (viewMode === adminTab.key || isAdmin) ? 'rgba(41,129,243,0.22)' : 'rgba(41,129,243,0.10)',
              color: '#FFFFFF',
              borderRadius: 'var(--r-md)',
              minHeight: 64,
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              textAlign: 'left',
              fontWeight: 800,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#7cc4ff', display: 'inline-flex' }}><Icon name={adminTab.icon} size={18} /></span>
              <span>{isAdmin ? 'Salir de gestión' : 'Acceso admin'}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>
              {isAdmin ? 'Volver a cliente' : 'Ingresar'}
            </span>
          </button>
        </div>
      ) : null}

      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: isCompactViewport ? 8 : 14,
          transform: 'translateX(-50%)',
          width: isCompactViewport ? 'min(98vw, 420px)' : 'min(94vw, 560px)',
          zIndex: 81,
          borderRadius: 'var(--r-lg)',
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'linear-gradient(180deg, rgba(8,20,32,0.98) 0%, rgba(6,12,22,0.98) 100%)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
          padding: isCompactViewport ? 8 : 10,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: isCompactViewport ? 6 : 8 }}>
          {primaryTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => handlePrimaryClick(item.key)}
              style={getTabButtonStyle(activePrimary === item.key)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => setIsMoreOpen((current) => !current)}
            style={getTabButtonStyle(isMoreActive || isMoreOpen)}
          >
            <Icon name="users" size={20} />
            <span>Más</span>
          </button>
        </div>
      </div>
    </>
  )
}
