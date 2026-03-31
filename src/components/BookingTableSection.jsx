import { buildCenteredTableStyles } from '../utils/tableStyles'
import { getBookingConfigFromBooking } from '../utils/bookingLogic.js'
import ActionButtonsRow from './ActionButtonsRow'
import CenteredMessage from './CenteredMessage'

function formatSimulatorBreakdown(booking) {
  const { standardCount, proCount } = getBookingConfigFromBooking(booking)
  const parts = []

  if (standardCount > 0) parts.push(`${standardCount} est.`)
  if (proCount > 0) parts.push(`${proCount} pro`)

  return parts.join(' + ') || '-'
}

function TimelineStatusPill({ status }) {
  const styles = {
    LIBRE: {
      background: 'rgba(34,197,94,0.12)',
      border: '1px solid rgba(34,197,94,0.28)',
      color: '#bbf7d0',
    },
    PARCIAL: {
      background: 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.28)',
      color: '#fde68a',
    },
    COMPLETO: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.28)',
      color: '#fecaca',
    },
  }

  return (
    <span
      style={{
        ...styles[status],
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 700,
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  )
}

function AdminSummary({ bookings }) {
  const todayCount = bookings.length
  const revenue = bookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0)

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        marginBottom: 18,
      }}
    >
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Reservas del día</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{todayCount}</div>
      </div>
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Venta estimada</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>${revenue.toLocaleString('es-CL')}</div>
      </div>
    </div>
  )
}

function DailyTimeline({ timeline = [], normalizeText }) {
  if (!timeline.length) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
        Ocupación cercana al horario elegido
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {timeline.map((slot) => (
          <div
            key={slot.time}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{slot.time}</div>
              <TimelineStatusPill status={slot.status} />
            </div>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.88 }}>
              Estándar: {slot.standardUsed}/2 ocupados
            </div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.88 }}>
              Pro: {slot.proUsed}/1 ocupado
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              {slot.relatedBookings.length > 0
                ? slot.relatedBookings.map((booking) => normalizeText(booking.client)).join(' · ')
                : 'Sin reservas en este bloque'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BookingTableSection({
  isAdmin,
  bookings,
  operationDate,
  dailyTimeline,
  startEditBooking,
  deleteBooking,
  normalizeText,
  normalizePhone,
  formatDateChile,
  line,
  tableWrap,
  table,
  th,
  td,
  buttonRowSmall,
  miniButton,
  miniDanger,
  isBookingSubmitting = false,
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  return (
    <>
      {operationDate ? (
        <DailyTimeline timeline={dailyTimeline} normalizeText={normalizeText} />
      ) : null}

      <AdminSummary bookings={bookings} />

      {bookings.length === 0 ? (
        <CenteredMessage text="Aún no hay reservas" line={line} />
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={thCenter}>Cliente</th>
                <th style={thCenter}>Teléfono</th>
                <th style={thCenter}>Fecha</th>
                <th style={thCenter}>Hora</th>
                <th style={thCenter}>Tipo</th>
                <th style={thCenter}>Configuración</th>
                <th style={thCenter}>Simuladores</th>
                <th style={thCenter}>Duración</th>
                <th style={thCenter}>Total</th>
                {isAdmin ? <th style={thCenter}>Acciones</th> : null}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={tdCenter}>{normalizeText(booking.client)}</td>
                  <td style={tdCenter}>{normalizePhone(booking.phone)}</td>
                  <td style={tdCenter}>{formatDateChile(booking.booking_date)}</td>
                  <td style={tdCenter}>{String(booking.booking_time).slice(0, 5)}</td>
                  <td style={tdCenter}>{booking.reservation_kind || '-'}</td>
                  <td style={tdCenter}>{formatSimulatorBreakdown(booking)}</td>
                  <td style={tdCenter}>{booking.simulators}</td>
                  <td style={tdCenter}>{booking.duration} min</td>
                  <td style={tdCenter}>${Number(booking.total || 0).toLocaleString('es-CL')}</td>
                  {isAdmin ? (
                    <td style={tdCenter}>
                      <ActionButtonsRow
                        onEdit={() => startEditBooking(booking)}
                        onDelete={() => deleteBooking(booking.id)}
                        buttonRowSmall={buttonRowSmall}
                        miniButton={miniButton}
                        miniDanger={miniDanger}
                        disabled={isBookingSubmitting}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
