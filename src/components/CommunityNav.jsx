/**
 * Sub-navegación entre las secciones de comunidad (Ranking / Perfil / Foro).
 * Antes había que volver a "Más" cada vez (2 taps); esto las cruza en 1 tap.
 * Se renderiza arriba de cada una de las 3 secciones.
 */
const ITEMS = [
  { key: 'GENERAL', label: 'Ranking', icon: '🏁' },
  { key: 'PROFILE', label: 'Perfil piloto', icon: '👤' },
  { key: 'FORUM', label: 'Foro', icon: '💬' },
]

export default function CommunityNav({ current, onNavigate }) {
  if (typeof onNavigate !== 'function') return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}
    >
      {ITEMS.map((item) => {
        const active = current === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              minHeight: 44,
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 13,
              lineHeight: 1.1,
              textAlign: 'center',
              color: '#fff',
              border: active ? '1px solid rgba(96,165,250,0.45)' : '1px solid rgba(255,255,255,0.10)',
              background: active
                ? 'linear-gradient(180deg, #2981F3 0%, #1E5FB7 100%)'
                : 'rgba(255,255,255,0.04)',
              boxShadow: active ? '0 8px 20px rgba(41,129,243,0.24)' : 'none',
            }}
          >
            <span style={{ fontSize: 16 }} aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
