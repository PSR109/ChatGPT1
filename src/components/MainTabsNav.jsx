const primaryTabs = [
  { key: 'BOOKINGS', label: 'Reservas', icon: '📅' },
  { key: 'GENERAL', label: 'Ranking', icon: '🏎️' },
  { key: 'COMMERCIAL', label: 'PSR', icon: '🚀' },
]

const communityTabs = [
  { key: 'PROFILE', label: 'Perfil piloto', icon: '👤' },
  { key: 'FORUM', label: 'Foro', icon: '💬' },
  { key: 'POINTS', label: 'Puntos', icon: '⭐' },
  { key: 'WEEKLY', label: 'Semanal', icon: '🏁' },
  { key: 'MONTHLY', label: 'Mensual', icon: '🏆' },
]

const adminTab = { key: 'ADMIN', label: 'Admin', icon: '🔒' }

function getTabButtonStyle(active) {
  return {
    flex: 1,
    minWidth: 0,
    border: '1px solid transparent',
    background: active ? 'linear-gradient(180deg, #2981F3 0%, #1E5FB7 100%)' : 'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    borderColor: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    padding: '10px 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontWeight: 700,
    fontSize: 12,
    boxShadow: active ? '0 10px 24px rgba(41,129,243,0.28)' : 'none',
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
            bottom: 96,
            transform: 'translateX(-50%)',
            width: 'min(92vw, 520px)',
            zIndex: 80,
            borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'linear-gradient(180deg, rgba(8,20,32,0.98) 0%, rgba(6,12,22,0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            padding: 16,
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
                    borderRadius: 14,
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
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
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
              borderRadius: 16,
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
              <span style={{ fontSize: 18 }}>{adminTab.icon}</span>
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
          bottom: 14,
          transform: 'translateX(-50%)',
          width: 'min(94vw, 560px)',
          zIndex: 81,
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'linear-gradient(180deg, rgba(8,20,32,0.98) 0%, rgba(6,12,22,0.98) 100%)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
          padding: 10,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {primaryTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => handlePrimaryClick(item.key)}
              style={getTabButtonStyle(activePrimary === item.key)}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <button
            onClick={() => setIsMoreOpen((current) => !current)}
            style={getTabButtonStyle(isMoreActive || isMoreOpen)}
          >
            <span style={{ fontSize: 17 }}>➕</span>
            <span>Más</span>
          </button>
        </div>
      </div>
    </>
  )
}
