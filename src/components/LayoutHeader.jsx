export default function LayoutHeader({ appMode, hero, title, subtitle, onAdminBadgeClick }) {
  return (
    <div style={hero}>
      <div style={title}>Patagonia SimRacing</div>
      <div style={subtitle}>Liga, reservas y rankings en tiempo real</div>
      {appMode === 'ADMIN' ? (
        <button
          type="button"
          onClick={onAdminBadgeClick}
          style={{
            marginTop: 14,
            padding: '8px 12px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.06)',
            color: '#dbeafe',
            fontWeight: 700,
            fontSize: 12,
            cursor: onAdminBadgeClick ? 'pointer' : 'default',
          }}
        >
          Gestión activa
        </button>
      ) : null}
    </div>
  )
}
