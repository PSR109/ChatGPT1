import { colors } from '../styles/appStyles'

export default function MainTabsNav({
  viewMode,
  setViewMode,
  tabs,
  tab,
  tabActive,
}) {
  const items = [
    ['GENERAL', 'Ranking General'],
    ['WEEKLY', 'Ranking Semanal'],
    ['MONTHLY', 'Ranking Mensual'],
    ['POINTS', 'Puntos'],
    ['BOOKINGS', 'Reservas'],
  ]

  return (
    <div style={tabs}>
      {items.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setViewMode(key)}
          style={{
            ...(viewMode === key ? tabActive : tab),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
          {viewMode === key ? (
            <span
              aria-hidden='true'
              style={{
                position: 'absolute',
                inset: 'auto 12px 6px',
                height: 3,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.92)',
              }}
            />
          ) : (
            <span
              aria-hidden='true'
              style={{
                position: 'absolute',
                inset: 'auto 12px 6px',
                height: 3,
                borderRadius: 999,
                background: colors.accent,
                opacity: 0.4,
              }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
