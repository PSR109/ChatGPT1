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
          style={viewMode === key ? tabActive : tab}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
