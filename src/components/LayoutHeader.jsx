import { useEffect, useMemo, useState } from 'react'
import { colors } from '../styles/appStyles'

export default function LayoutHeader({
  appMode,
  setAppMode,
  viewMode,
  setViewMode,
  hero,
  title,
  subtitle,
  modeWrap,
  modeButton,
  modeButtonActive,
  tabs,
  tab,
  tabActive,
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const allTabs = useMemo(
    () => [
      { key: 'BOOKINGS', label: 'Reservar', icon: '📅' },
      { key: 'GENERAL', label: 'General', icon: '🏎️' },
      { key: 'WEEKLY', label: 'Semanal', icon: '🏁' },
      { key: 'MONTHLY', label: 'Mensual', icon: '🏆' },
      { key: 'POINTS', label: 'Puntos', icon: '⭐' },
      { key: 'COMMERCIAL', label: 'PSR', icon: '🚀' },
      { key: 'PROFILE', label: 'Perfil', icon: '👤' },
      { key: 'FORUM', label: 'Comunidad', icon: '💬' },
    ],
    []
  )

  const desktopPrimaryTabs = allTabs.slice(0, 5)
  const desktopSecondaryTabs = allTabs.slice(5)

  const mobileDock = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    background: 'linear-gradient(180deg, rgba(6,16,24,0.72) 0%, rgba(6,16,24,0.98) 24%, rgba(6,16,24,1) 100%)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
    padding: '10px 10px calc(12px + env(safe-area-inset-bottom, 0px))',
    boxShadow: '0 -14px 30px rgba(0,0,0,0.34)',
  }

  const mobileDockTrack = {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(82px, 1fr)',
    gap: 8,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
    paddingBottom: 2,
  }

  const mobileTabBase = {
    minHeight: 60,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#eaf1ff',
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: 4,
    cursor: 'pointer',
    padding: '8px 10px',
    fontWeight: 800,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
  }

  const mobileTabActive = {
    ...mobileTabBase,
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.16)',
    boxShadow: '0 12px 26px rgba(41,129,243,0.24)',
  }

  return (
    <>
      <div
        style={{
          ...hero,
          marginBottom: isMobile ? 18 : hero.marginBottom,
        }}
      >
        <div style={title}>Patagonia SimRacing</div>
        <div style={subtitle}>Reserva fácil, compite, compara tiempos y vuelve por más.</div>

        <div
          style={{
            display: 'grid',
            gap: 14,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={modeWrap}>
              <button
                style={appMode === 'USER' ? { ...modeButton, ...modeButtonActive } : modeButton}
                onClick={() => setAppMode('USER')}
              >
                Usuario
              </button>
              <button
                style={appMode === 'ADMIN' ? { ...modeButton, ...modeButtonActive } : modeButton}
                onClick={() => setAppMode('ADMIN')}
              >
                Admin
              </button>
            </div>

            {!isMobile && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
                {desktopSecondaryTabs.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setViewMode(item.key)}
                    style={{
                      ...(viewMode === item.key ? { ...tab, ...tabActive } : tab),
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isMobile && (
            <div
              style={{
                ...tabs,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                gap: 10,
                paddingTop: 4,
              }}
            >
              {desktopPrimaryTabs.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key)}
                  style={{
                    ...(viewMode === item.key ? { ...tab, ...tabActive } : tab),
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobile ? (
        <div style={mobileDock}>
          <div style={mobileDockTrack}>
            {allTabs.map((item) => (
              <button
                key={item.key}
                type='button'
                onClick={() => setViewMode(item.key)}
                style={viewMode === item.key ? mobileTabActive : mobileTabBase}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 11 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
