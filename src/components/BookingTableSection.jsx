import { useEffect, useState } from 'react'
import ActionButtonsRow from './ActionButtonsRow'
import CenteredMessage from './CenteredMessage'
import { buildCenteredTableStyles } from '../utils/tableStyles'

function formatSimulatorBreakdown(booking) {
  const standard = Number(booking.standard_quantity || 0)
  const pro = Number(booking.pro_quantity || 0)

  if (standard > 0 && pro > 0) return `${standard} estándar + ${pro} pro`
  if (standard > 0) return `${standard} estándar`
  if (pro > 0) return `${pro} pro`
  return booking.booking_type || '-'
}

function TimelineStatusPill({ status }) {
  const styles = {
    LIBRE: {
      background: 'rgba(34,197,94,0.12)',
      border: '1px solid rgba(34,197,94,0.28)',
      color: '#86efac',
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

function AdminSummary({ bookings, isMobile }) {
  const todayCount = bookings.length
  const revenue = bookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0)
  const whatsappCount = bookings.filter((booking) => booking.whatsapp_reminder).length
  const eventCount = bookings.filter((booking) => String(booking.reservation_kind || '').toUpperCase() !== 'LOCAL').length

  const summaryItems = [
    { label: 'Reservas visibles', value: todayCount },
    { label: 'Venta visible', value: `$${revenue.toLocaleString('es-CL')}` },
    { label: 'Con recordatorio', value: whatsappCount },
    { label: 'Eventos / empresas', value: eventCount },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(170px, 1fr))',
        marginBottom: 18,
      }}
    >
      {summaryItems.map((item, index) => (
        <div
          key={item.label}
          style={{
            border: index === 1 ? '1px solid rgba(34,197,94,0.26)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 14,
            background: index === 1
              ? 'linear-gradient(180deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6, wordBreak: 'break-word' }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}

function DailyTimeline({ timeline = [], normalizeText, isMobile }) {
  if (!timeline.length) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
        Radar de ocupación cercano al horario elegido
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {timeline.map((slot) => (
          <div
            key={slot.time}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 14,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{slot.time}</div>
              <TimelineStatusPill status={slot.status} />
            </div>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.88 }}>
              Estándar: {slot.standardUsed}/2 ocupados
            </div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.88 }}>
              Pro: {slot.proUsed}/1 ocupado
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, wordBreak: 'break-word' }}>
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

function MobileBookingCard({
  booking,
  startEditBooking,
  deleteBooking,
  normalizeText,
  normalizePhone,
  formatDateChile,
  isAdmin,
  buttonRowSmall,
  miniButton,
  miniDanger,
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 12,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 17, marginBottom: 10, wordBreak: 'break-word' }}>
        {normalizeText(booking.client)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Teléfono</div>
          <div style={{ marginTop: 4, fontWeight: 700, wordBreak: 'break-word' }}>{normalizePhone(booking.phone)}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Fecha</div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{formatDateChile(booking.booking_date)}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Hora</div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{String(booking.booking_time).slice(0, 5)}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Tipo</div>
          <div style={{ marginTop: 4, fontWeight: 700, wordBreak: 'break-word' }}>{booking.reservation_kind || '-'}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Configuración</div>
          <div style={{ marginTop: 4, fontWeight: 700, wordBreak: 'break-word' }}>{formatSimulatorBreakdown(booking)}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Total</div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>${Number(booking.total || 0).toLocaleString('es-CL')}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, opacity: 0.8 }}>
        {booking.duration} min · {booking.simulators} simulador(es)
      </div>

      {isAdmin ? (
        <div
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: 10,
            background: 'rgba(255,255,255,0.025)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.66 }}>Admin</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700 }}>Edita o elimina esta reserva sin salir del panel</div>
        </div>
      ) : null}

      {isAdmin ? (
        <div style={{ marginTop: 10 }}>
          <ActionButtonsRow
            onEdit={() => startEditBooking(booking)}
            onDelete={() => deleteBooking(booking.id)}
            buttonRowSmall={{ ...buttonRowSmall, justifyContent: 'center' }}
            miniButton={miniButton}
            miniDanger={miniDanger}
          />
        </div>
      ) : null}
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
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  return (
    <>
      <div
        style={{
          border: '1px solid rgba(59,130,246,0.20)',
          borderRadius: 18,
          padding: isMobile ? 14 : 18,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(34,197,94,0.10))',
          textAlign: 'center',
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900 }}>Panel admin de reservas</div>
        <div style={{ marginTop: 8, opacity: 0.84, maxWidth: 820, marginInline: 'auto', lineHeight: 1.45 }}>
          Visualiza ocupación, ventas y reservas activas con un formato más claro para operar rápido desde teléfono o escritorio.
        </div>
      </div>

      {operationDate ? (
        <DailyTimeline timeline={dailyTimeline} normalizeText={normalizeText} isMobile={isMobile} />
      ) : null}

      <AdminSummary bookings={bookings} isMobile={isMobile} />

      {bookings.length === 0 ? (
        <CenteredMessage text='Aún no hay reservas' line={line} />
      ) : isMobile ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {bookings.map((booking) => (
            <MobileBookingCard
              key={booking.id}
              booking={booking}
              startEditBooking={startEditBooking}
              deleteBooking={deleteBooking}
              normalizeText={normalizeText}
              normalizePhone={normalizePhone}
              formatDateChile={formatDateChile}
              isAdmin={isAdmin}
              buttonRowSmall={buttonRowSmall}
              miniButton={miniButton}
              miniDanger={miniDanger}
            />
          ))}
        </div>
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
                {isAdmin ? <th style={thCenter}>Acciones admin</th> : null}
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
