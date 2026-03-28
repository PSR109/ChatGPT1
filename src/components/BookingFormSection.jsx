import { useMemo } from 'react'
import AdminTextInput from './AdminTextInput'
import CenteredMessage from './CenteredMessage'
import PrimarySecondaryActions from './PrimarySecondaryActions'
import StatusMessage from './StatusMessage'

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180, 210, 240]
const PSR_WHATSAPP = '56984630196'

const optionStyle = {
  background: '#081229',
  color: '#ffffff',
}

const selectBaseStyle = {
  background: '#081229',
  color: '#ffffff',
  appearance: 'auto',
  WebkitAppearance: 'menulist',
  MozAppearance: 'menulist',
}

const KIND_CARDS = {
  LOCAL: {
    title: 'Aprender / practicar',
    short: 'Sesión simple',
    description: 'Ideal para conocer PSR, practicar manejo o pasar un buen rato.',
    audience: 'Personas solas, en pareja o quienes quieren empezar.',
    includes: 'Simulador · reserva rápida · experiencia directa',
    urgency: 'Los horarios más cómodos suelen irse primero.',
  },
  EMPRESA: {
    title: 'Empresas / team building',
    short: 'Actividad grupal',
    description: 'Pensado para equipos que buscan algo distinto, simple y entretenido.',
    audience: 'Equipos, áreas de empresa y grupos de trabajo.',
    includes: 'Formato grupal · más impacto · mejor para equipos',
    urgency: 'Para grupos conviene cerrar antes y asegurar horario.',
  },
  EVENTO: {
    title: 'Eventos / cumpleaños',
    short: 'Formato social',
    description: 'Funciona mejor para celebraciones, grupos y fechas especiales.',
    audience: 'Cumpleaños, celebraciones y grupos más grandes.',
    includes: 'Más movimiento · más tiempo recomendado · mejor para grupos',
    urgency: 'Las fechas para evento suelen llenarse antes.',
  },
}

const CONFIG_LABELS = {
  '1_ESTANDAR': '1 estándar',
  '1_PRO': '1 pro',
  '2_ESTANDAR': '2 estándar',
  '1_ESTANDAR_1_PRO': '1 estándar + 1 pro',
  '3_SIMULADORES': '2 estándar + 1 pro',
}

function buildWhatsappLink(message) {
  return `https://wa.me/${PSR_WHATSAPP}?text=${encodeURIComponent(message)}`
}

function buildReservationMessage({ client, phone, date, time, kind, config, duration, total }) {
  const kindLabel = KIND_CARDS[kind]?.title || kind
  const configLabel = CONFIG_LABELS[config] || config

  return [
    'Hola, quiero confirmar esta reserva en PSR:',
    '',
    `Nombre: ${client || 'Sin nombre'}`,
    `Teléfono: ${phone || 'Sin teléfono'}`,
    `Tipo: ${kindLabel}`,
    `Configuración: ${configLabel}`,
    `Duración: ${duration} min`,
    `Fecha: ${date || 'Sin fecha'}`,
    `Hora: ${time || 'Sin hora'}`,
    `Total estimado: $${Number(total || 0).toLocaleString('es-CL')}`,
  ].join('\n')
}

function SuggestionPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.12)',
        background: active ? 'rgba(250, 204, 21, 0.16)' : 'rgba(255,255,255,0.06)',
        color: '#ffffff',
        padding: '10px 14px',
        borderRadius: 999,
        fontWeight: 800,
        cursor: 'pointer',
        minWidth: 88,
      }}
    >
      {label}
    </button>
  )
}

function cardGrid(min = 240) {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
    gap: 12,
    alignItems: 'stretch',
  }
}

function InfoCard({ label, value, tone = 'default' }) {
  const toneStyles = {
    default: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#ffffff',
    },
    highlight: {
      background: 'rgba(250,204,21,0.12)',
      border: '1px solid rgba(250,204,21,0.28)',
      color: '#fff7cc',
    },
  }

  return (
    <div
      style={{
        ...toneStyles[tone],
        borderRadius: 16,
        padding: 14,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 900, lineHeight: 1.4 }}>{value}</div>
    </div>
  )
}

export default function BookingFormSection({
  isAdmin,
  editingBookingId,
  bookingClient,
  setBookingClient,
  bookingPhone,
  setBookingPhone,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  bookingKind,
  setBookingKind,
  bookingConfig,
  setBookingConfig,
  bookingDuration,
  setBookingDuration,
  bookingWhatsappReminder,
  setBookingWhatsappReminder,
  bookingMessage,
  availableTimeOptions,
  suggestedTimes,
  totalBooking,
  createOrUpdateBooking,
  cancelEditBooking,
  BOOKING_OPTIONS,
  normalizeText,
  normalizePhone,
  formGrid,
  input,
  checkboxRow,
  line,
  buttonRow,
  button,
  buttonSecondary,
  messageStyle,
}) {
  const selectStyle = { ...input, ...selectBaseStyle }

  const configOptions = [
    { value: '1_ESTANDAR', label: '1 ESTÁNDAR' },
    { value: '1_PRO', label: '1 PRO' },
    { value: '2_ESTANDAR', label: '2 ESTÁNDAR' },
    { value: '1_ESTANDAR_1_PRO', label: '1 ESTÁNDAR + 1 PRO' },
    { value: '3_SIMULADORES', label: '2 ESTÁNDAR + 1 PRO' },
  ].filter((option) => BOOKING_OPTIONS?.[option.value])

  const currentKind = KIND_CARDS[bookingKind] || KIND_CARDS.LOCAL

  const reservationMessage = useMemo(
    () =>
      buildReservationMessage({
        client: bookingClient,
        phone: bookingPhone,
        date: bookingDate,
        time: bookingTime,
        kind: bookingKind,
        config: bookingConfig,
        duration: bookingDuration,
        total: totalBooking,
      }),
    [bookingClient, bookingPhone, bookingDate, bookingTime, bookingKind, bookingConfig, bookingDuration, totalBooking]
  )

  const canContact = Boolean(bookingDate && bookingTime && bookingClient)
  const totalLabel = `$${Number(totalBooking || 0).toLocaleString('es-CL')}`

  const summary = {
    tipo: currentKind.title,
    para: currentKind.audience,
    configuracion: CONFIG_LABELS[bookingConfig] || bookingConfig,
    incluye: currentKind.includes,
    total: totalLabel,
  }

  const timeOptions = availableTimeOptions.length > 0 ? availableTimeOptions : ['']

  return (
    <>
      <div style={{ maxWidth: 980, margin: '0 auto 18px' }}>
        <div style={{ ...cardGrid(220), justifyContent: 'center' }}>
          {Object.entries(KIND_CARDS).map(([value, item]) => {
            const active = bookingKind === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setBookingKind(value)}
                style={{
                  minHeight: 118,
                  borderRadius: 18,
                  padding: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  border: active ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.12)',
                  background: active
                    ? 'linear-gradient(180deg, rgba(250,204,21,0.16), rgba(250,204,21,0.07))'
                    : 'rgba(255,255,255,0.04)',
                  color: '#ffffff',
                  boxShadow: active ? '0 10px 24px rgba(250,204,21,0.10)' : 'none',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>{item.title}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: active ? '#fde68a' : 'rgba(255,255,255,0.68)',
                    marginBottom: 8,
                  }}
                >
                  {item.short}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,0.84)', maxWidth: 280 }}>
                  {item.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          ...line,
          maxWidth: 980,
          margin: '0 auto 18px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 20,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.8, fontWeight: 900, color: '#facc15', textTransform: 'uppercase', marginBottom: 8 }}>
          Esto es lo que estás reservando
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', marginBottom: 8 }}>{summary.tipo}</div>
        <div style={{ color: 'rgba(255,255,255,0.84)', lineHeight: 1.55, marginBottom: 16, maxWidth: 720, marginInline: 'auto' }}>
          {currentKind.description}
        </div>

        <div style={{ ...cardGrid(200), maxWidth: 920, margin: '0 auto 12px' }}>
          <InfoCard label="Para quién es" value={summary.para} />
          <InfoCard label="Configuración" value={summary.configuracion} />
          <InfoCard label="Incluye" value={summary.incluye} />
          <InfoCard label="Total estimado" value={summary.total} tone="highlight" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <span
            style={{
              background: 'rgba(250,204,21,0.14)',
              color: '#fde68a',
              padding: '8px 12px',
              borderRadius: 999,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {currentKind.urgency}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ ...formGrid, marginBottom: 10 }}>
          <AdminTextInput
            value={bookingClient}
            onChange={(e) => setBookingClient(normalizeText(e.target.value))}
            placeholder="NOMBRE"
            style={input}
          />

          <AdminTextInput
            value={bookingPhone}
            onChange={(e) => setBookingPhone(normalizePhone(e.target.value))}
            placeholder="TELÉFONO"
            style={input}
          />

          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={input} />

          <select value={bookingConfig} onChange={(e) => setBookingConfig(e.target.value)} style={selectStyle}>
            {configOptions.map((option) => (
              <option key={option.value} value={option.value} style={optionStyle}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={String(bookingDuration)}
            onChange={(e) => setBookingDuration(Number(e.target.value) || 30)}
            style={selectStyle}
          >
            {DURATION_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes} style={optionStyle}>
                {minutes} MIN
              </option>
            ))}
          </select>

          <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={selectStyle}>
            {timeOptions.map((time) => (
              <option key={time || 'empty'} value={time} style={optionStyle}>
                {time || 'SIN HORARIOS DISPONIBLES'}
              </option>
            ))}
          </select>

          <AdminTextInput
            value={`TOTAL: ${totalLabel}`}
            onChange={() => {}}
            placeholder=""
            style={{
              ...input,
              fontWeight: 900,
              textAlign: 'center',
              boxShadow: '0 0 0 1px rgba(250,204,21,0.24) inset',
            }}
          />
        </div>
      </div>

      <div style={{ ...line, marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#facc15', marginBottom: 10 }}>Horarios sugeridos</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {suggestedTimes.length > 0 ? (
            suggestedTimes.map((time) => (
              <SuggestionPill key={time} label={time} active={bookingTime === time} onClick={() => setBookingTime(time)} />
            ))
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.72)' }}>Todavía no hay sugerencias para este bloque.</span>
          )}
        </div>
      </div>

      <label style={{ ...checkboxRow, justifyContent: 'center' }}>
        <input
          type="checkbox"
          checked={bookingWhatsappReminder}
          onChange={(e) => setBookingWhatsappReminder(e.target.checked)}
        />
        Recordatorio por WhatsApp
      </label>

      <CenteredMessage
        text={suggestedTimes.length > 0 ? `Horarios sugeridos: ${suggestedTimes.join(' / ')}` : ''}
        line={{ ...line, textAlign: 'center' }}
      />

      <div style={{ ...buttonRow, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <PrimarySecondaryActions
          primaryLabel={editingBookingId ? 'Guardar cambios' : 'Crear reserva'}
          onPrimary={createOrUpdateBooking}
          secondaryLabel="Cancelar edición"
          onSecondary={cancelEditBooking}
          showSecondary={Boolean(isAdmin && editingBookingId)}
          buttonRow={{ display: 'contents' }}
          button={{ ...button, minWidth: 220 }}
          buttonSecondary={{ ...buttonSecondary, minWidth: 180 }}
        />

        <a
          href={buildWhatsappLink(reservationMessage)}
          target="_blank"
          rel="noreferrer"
          style={{
            ...buttonSecondary,
            minWidth: 220,
            textAlign: 'center',
            textDecoration: 'none',
            opacity: canContact ? 1 : 0.6,
            pointerEvents: canContact ? 'auto' : 'none',
          }}
        >
          Confirmar por WhatsApp
        </a>

        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(reservationMessage)}
          style={{ ...buttonSecondary, minWidth: 180 }}
        >
          Copiar resumen
        </button>
      </div>

      <div
        style={{
          ...line,
          marginTop: 16,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: 16,
          textAlign: 'center',
          maxWidth: 980,
          marginInline: 'auto',
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.8, fontWeight: 900, color: '#facc15', textTransform: 'uppercase', marginBottom: 8 }}>
          Resumen para confirmar
        </div>
        <pre
          style={{
            margin: '0 auto',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.88)',
            fontFamily: 'inherit',
            fontSize: 14,
            textAlign: 'left',
            maxWidth: 520,
          }}
        >
          {reservationMessage}
        </pre>
      </div>

      <StatusMessage text={bookingMessage} messageStyle={{ ...messageStyle, textAlign: 'center' }} />
    </>
  )
}
