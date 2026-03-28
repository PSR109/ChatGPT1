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
  const mainTabs = [
    { key: 'GENERAL', label: 'Ranking general', icon: '🏎️' },
    { key: 'WEEKLY', label: 'Ranking semanal', icon: '🏁' },
    { key: 'MONTHLY', label: 'Ranking mensual', icon: '🏆' },
    { key: 'POINTS', label: 'Puntos', icon: '⭐' },
    { key: 'BOOKINGS', label: 'Reservas', icon: '📅' },
  ]

  const secondaryTabs = [
    { key: 'COMMERCIAL', label: 'PSR para todos', icon: '🚀' },
    { key: 'PROFILE', label: 'Perfil de piloto', icon: '👤' },
  ]

  return (
    <div style={hero}>
      <div style={title}>Patagonia SimRacing</div>
      <div style={subtitle}>Liga, reservas y rankings en tiempo real</div>

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

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
            {secondaryTabs.map((item) => (
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
        </div>

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
          {mainTabs.map((item) => (
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
      </div>
    </div>
  )
}
