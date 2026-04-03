const wrapStyle = {
  display: 'grid',
  gap: 14,
  padding: 18,
  borderRadius: 20,
  border: '1px solid rgba(245, 158, 11, 0.22)',
  background: 'linear-gradient(180deg, rgba(44, 30, 10, 0.94) 0%, rgba(23, 16, 7, 0.98) 100%)',
  boxShadow: '0 16px 32px rgba(0,0,0,0.22)',
}

const titleStyle = {
  margin: 0,
  color: '#F8FAFC',
  fontSize: 'clamp(22px, 4vw, 28px)',
  fontWeight: 900,
  lineHeight: 1.1,
}

const textStyle = {
  margin: 0,
  color: '#E2E8F0',
  fontSize: 14,
  lineHeight: 1.6,
}

const bulletListStyle = {
  margin: 0,
  paddingLeft: 18,
  color: '#CBD5E1',
  fontSize: 14,
  lineHeight: 1.6,
  display: 'grid',
  gap: 6,
}

const badgeStyle = {
  display: 'inline-flex',
  width: 'fit-content',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(245, 158, 11, 0.14)',
  border: '1px solid rgba(245, 158, 11, 0.22)',
  color: '#FDE68A',
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

/**
 * Legacy guard.
 * Este archivo quedaba con escrituras directas a Supabase y ya no debe usarse para operar reservas.
 * Se mantiene solo para no romper imports históricos mientras el flujo real vive en App.jsx + BookingsSection + bookingPersistence.js.
 */
export default function ReservationTab() {
  return (
    <section style={wrapStyle}>
      <span style={badgeStyle}>Legacy bloqueado</span>
      <h2 style={titleStyle}>Este módulo ya no opera reservas</h2>
      <p style={textStyle}>
        La ruta antigua de reservas quedó desactivada para evitar escrituras paralelas sobre Supabase.
        El flujo vigente y validado está centralizado en la capa principal de reservas de la app.
      </p>
      <ul style={bulletListStyle}>
        <li>No crea reservas.</li>
        <li>No edita reservas.</li>
        <li>No elimina reservas.</li>
        <li>No escribe directo en la tabla <strong>bookings</strong>.</li>
      </ul>
      <p style={textStyle}>
        Si este componente vuelve a usarse en el futuro, debe reconectarse únicamente a <strong>bookingPersistence.js</strong>
        y nunca con <strong>insert / update / delete</strong> directos.
      </p>
    </section>
  )
}
