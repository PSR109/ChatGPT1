import { useEffect, useMemo, useState } from 'react'
import AdminTextInput from './AdminTextInput'
import CenteredMessage from './CenteredMessage'
import PrimarySecondaryActions from './PrimarySecondaryActions'
import StatusMessage from './StatusMessage'
import { normalizeTextInput } from '../utils/psrUtils'

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
    socialProof: 'Perfecto para venir, correr y después revisar tu tiempo en el ranking.',
    nextStep: 'Reserva, corre y compárate con otros tiempos del local.',
  },
  EMPRESA: {
    title: 'Empresas / team building',
    short: 'Actividad grupal',
    description: 'Pensado para equipos que buscan algo distinto, simple y entretenido.',
    audience: 'Equipos, áreas de empresa y grupos de trabajo.',
    includes: 'Formato grupal · más impacto · mejor para equipos',
    urgency: 'Para grupos conviene cerrar antes y asegurar horario.',
    socialProof: 'Sirve muy bien cuando se quiere competencia sana, rotación y conversación entre equipos.',
    nextStep: 'Define el grupo, bloquea el horario y luego afinamos el formato por WhatsApp.',
  },
  EVENTO: {
    title: 'Eventos / cumpleaños',
    short: 'Formato social',
    description: 'Funciona mejor para celebraciones, grupos y fechas especiales.',
    audience: 'Cumpleaños, celebraciones y grupos más grandes.',
    includes: 'Más movimiento · más tiempo recomendado · mejor para grupos',
    urgency: 'Las fechas para evento suelen llenarse antes.',
    socialProof: 'Cuando el grupo ve tiempos, posiciones y repeticiones, la experiencia se vuelve mucho más entretenida.',
    nextStep: 'Elige la fecha, asegura el cupo y cerramos los detalles del grupo por WhatsApp.',
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
      type='button'
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

function SectionBadge({ children, tone = 'default' }) {
  const styles = {
    default: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#dbe5ff',
    },
    success: {
      background: 'rgba(0,168,107,0.16)',
      border: '1px solid rgba(0,168,107,0.28)',
      color: '#dbfff1',
    },
  }

  return (
    <div
      style={{
        ...styles[tone],
        borderRadius: 999,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 800,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
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
      <div style={{ fontWeight: 900, lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</div>
    </div>
  )
}


function TrustPill({ children }) {
  return (
    <div
      style={{
        borderRadius: 999,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 800,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}

function SocialProofCard({ title, value, description }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.035))',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'grid',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 12, color: '#8ea3d5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.15 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.45 }}>{description}</div>
    </div>
  )
}

function CompletionBadge({ label, done }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: '12px 14px',
        background: done ? 'rgba(57,226,125,0.12)' : 'rgba(255,255,255,0.05)',
        border: done ? '1px solid rgba(57,226,125,0.28)' : '1px solid rgba(255,255,255,0.08)',
        color: done ? '#dbfff1' : '#ffffff',
        display: 'grid',
        gap: 4,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.3, textTransform: 'uppercase', color: done ? '#9ff0bf' : 'rgba(255,255,255,0.56)' }}>
        {done ? 'Listo' : 'Pendiente'}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>{label}</div>
    </div>
  )
}

function HighlightDetail({ label, value, tone = 'default' }) {
  const tones = {
    default: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      valueColor: '#ffffff',
    },
    success: {
      background: 'rgba(57,226,125,0.12)',
      border: '1px solid rgba(57,226,125,0.22)',
      valueColor: '#dbfff1',
    },
    alert: {
      background: 'rgba(250,204,21,0.10)',
      border: '1px solid rgba(250,204,21,0.22)',
      valueColor: '#fff7cc',
    },
  }

  const current = tones[tone] || tones.default

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        background: current.background,
        border: current.border,
        display: 'grid',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.35 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.3, color: current.valueColor, wordBreak: 'break-word' }}>{value}</div>
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
  bookingCommercialContext,
  clearBookingCommercialContext,
  bookingMessage,
  availableTimeOptions,
  suggestedTimes,
  smartSuggestions = [],
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

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

  const completionChecks = [
    { label: 'Nombre', done: Boolean(String(bookingClient || '').trim()) },
    { label: 'Fecha', done: Boolean(bookingDate) },
    { label: 'Hora', done: Boolean(bookingTime) },
    { label: 'Cierre por WhatsApp', done: canContact },
  ]

  const missingLabels = completionChecks.filter((item) => !item.done && item.label !== 'Cierre por WhatsApp').map((item) => item.label)
  const selectedSlotLabel = bookingDate && bookingTime ? `${bookingDate} · ${bookingTime}` : 'Falta elegir fecha y hora'
  const closingStatusLabel = canContact ? 'Ya puedes cerrar la reserva ahora' : `Te falta: ${missingLabels.join(', ') || 'completar datos'}`

  const timeOptions = availableTimeOptions.length > 0 ? availableTimeOptions : ['']

  const quickSuggestions = smartSuggestions.length > 0
    ? smartSuggestions
    : suggestedTimes.map((time) => ({ time, label: 'Disponible' }))

  const mobileFormGrid = {
    ...formGrid,
    gridTemplateColumns: isMobile ? '1fr' : formGrid.gridTemplateColumns,
  }

  const summaryGrid = {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
  }

  const trustGrid = {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    marginTop: 16,
  }

  const proofGrid = {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    marginTop: 18,
  }

  const bookingHeroGrid = {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
    alignItems: 'stretch',
    marginBottom: 18,
  }

  return (
    <>
      <div
        style={{
          ...bookingHeroGrid,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,168,107,0.2) 0%, rgba(8,18,41,0.96) 55%, rgba(250,204,21,0.12) 100%)',
            border: '1px solid rgba(0,168,107,0.24)',
            borderRadius: 22,
            padding: isMobile ? 18 : 22,
            display: 'grid',
            gap: 12,
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SectionBadge tone='success'>Reserva rápida</SectionBadge>
            <SectionBadge>Mobile first</SectionBadge>
            <SectionBadge>Confirmación por WhatsApp</SectionBadge>
          </div>

          <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#9fd9bf', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reserva protagonista</div>
            <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, lineHeight: 1.08, wordBreak: 'break-word' }}>
              Reserva en pocos pasos y cierra más rápido desde el teléfono
            </div>
            <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.5, fontSize: 14 }}>
              Elige tipo de sesión, horario y configuración. La app te muestra un total estimado claro y te deja listo para confirmar.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: 10,
              minWidth: 0,
            }}
          >
            {[
              ['1', 'Elige el formato'],
              ['2', 'Selecciona fecha y hora'],
              ['3', 'Confirma y asegura tu cupo'],
            ].map(([step, label]) => (
              <div
                key={step}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: 14,
                  minWidth: 0,
                }}
              >
                <div style={{ fontSize: 12, color: '#facc15', fontWeight: 900, marginBottom: 4 }}>Paso {step}</div>
                <div style={{ fontWeight: 800, lineHeight: 1.35, wordBreak: 'break-word' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, rgba(8,18,41,0.96), rgba(7,13,30,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 22,
            padding: isMobile ? 18 : 20,
            display: 'grid',
            gap: 12,
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: 12, color: '#8ea3d5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Resumen rápido</div>
          <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>Lo más importante primero</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <InfoCard label='Tipo actual' value={summary.tipo} />
            <InfoCard label='Configuración actual' value={summary.configuracion} />
            <InfoCard label='Total estimado' value={summary.total} tone='highlight' />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.45 }}>
            Si completas nombre, fecha y hora, puedes pasar directo a confirmación por WhatsApp.
          </div>
          <div style={trustGrid}>
            <TrustPill>Respuesta rápida</TrustPill>
            <TrustPill>Total claro antes de confirmar</TrustPill>
            <TrustPill>Mejor experiencia en teléfono</TrustPill>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto 18px' }}>
        <div style={{ ...cardGrid(isMobile ? 180 : 220), justifyContent: 'center' }}>
          {Object.entries(KIND_CARDS).map(([value, item]) => {
            const active = bookingKind === value
            return (
              <button
                key={value}
                type='button'
                onClick={() => setBookingKind(value)}
                style={{
                  minHeight: isMobile ? 106 : 118,
                  borderRadius: 18,
                  padding: isMobile ? 16 : 18,
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
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4, wordBreak: 'break-word' }}>{item.short}</div>
                <div style={{ fontSize: 13, opacity: 0.78, lineHeight: 1.35, wordBreak: 'break-word' }}>{item.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          marginBottom: 18,
          padding: isMobile ? 16 : 18,
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 12, color: '#8ea3d5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Antes de confirmar</div>
        <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, lineHeight: 1.2 }}>Elige rápido, revisa el total y cierra tu horario</div>
        <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 1.5 }}>
          Esta parte ya quedó pensada para que la decisión sea simple: tipo de sesión, configuración, duración y confirmación directa.
        </div>
      </div>

      <div style={summaryGrid}>
        <InfoCard label='Tipo' value={summary.tipo} />
        <InfoCard label='Para quién' value={summary.para} />
        <InfoCard label='Configuración' value={summary.configuracion} />
        <InfoCard label='Incluye' value={summary.incluye} />
        <InfoCard label='Urgencia' value={currentKind.urgency} />
        <InfoCard label='Total' value={summary.total} tone='highlight' />
      </div>

      <div
        style={{
          marginTop: 18,
          padding: isMobile ? 16 : 18,
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(5,15,34,0.98), rgba(7,13,30,0.96))',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 12, color: '#8ea3d5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Prueba social + cierre</div>
        <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, lineHeight: 1.2 }}>Reserva, corre y haz que la experiencia siga después</div>
        <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 1.5 }}>
          La reserva no solo sirve para asegurar horario. También alimenta competencia, comparación de tiempos y ganas de volver.
        </div>

        <div style={proofGrid}>
          <SocialProofCard
            title='Lo que engancha'
            value='Ver tiempos y posiciones'
            description='Después de correr, el ranking hace que la experiencia no termine solo en la sesión.'
          />
          <SocialProofCard
            title='Lo que ayuda a cerrar'
            value='WhatsApp listo y total claro'
            description='Mientras menos dudas queden antes del mensaje, más fácil es confirmar.'
          />
          <SocialProofCard
            title='Lo que hace volver'
            value='Desafíos y comunidad'
            description='Quien reserva una vez puede volver por ranking, retos o por competir con otros.'
          />
        </div>
      </div>

      <div style={{ ...line, margin: '16px 0' }} />

      <div style={mobileFormGrid}>
        <AdminTextInput
          value={bookingClient}
          onChange={(e) => setBookingClient(normalizeTextInput(e.target.value))}
          placeholder='NOMBRE'
          style={input}
        />

        <AdminTextInput
          value={bookingPhone}
          onChange={(e) => setBookingPhone(normalizePhone(e.target.value))}
          placeholder='TELÉFONO'
          style={input}
        />

        <input type='date' value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={input} />

        <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={selectStyle}>
          {timeOptions.map((time) => (
            <option key={time || 'empty'} value={time} style={optionStyle}>
              {time ? time : 'SIN HORARIOS DISPONIBLES'}
            </option>
          ))}
        </select>

        <select value={bookingConfig} onChange={(e) => setBookingConfig(e.target.value)} style={selectStyle}>
          {configOptions.map((option) => (
            <option key={option.value} value={option.value} style={optionStyle}>
              {option.label}
            </option>
          ))}
        </select>

        <select value={String(bookingDuration)} onChange={(e) => setBookingDuration(Number(e.target.value))} style={selectStyle}>
          {DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes} style={optionStyle}>
              {minutes} MIN
            </option>
          ))}
        </select>
      </div>


      <div
        style={{
          marginTop: 18,
          padding: isMobile ? 16 : 18,
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(6,18,39,0.98), rgba(7,13,30,0.96))',
          border: canContact ? '1px solid rgba(57,226,125,0.24)' : '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, color: canContact ? '#9ff0bf' : '#8ea3d5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Estado de cierre
          </div>
          <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, lineHeight: 1.2 }}>
            {canContact ? 'Tu reserva ya está lista para confirmarse' : 'Todavía faltan datos para cerrar rápido'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 1.5 }}>
            {closingStatusLabel}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 10,
            gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
          }}
        >
          {completionChecks.map((item) => (
            <CompletionBadge key={item.label} label={item.label} done={item.done} />
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gap: 10,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          }}
        >
          <HighlightDetail label='Horario seleccionado' value={selectedSlotLabel} tone={bookingDate && bookingTime ? 'success' : 'alert'} />
          <HighlightDetail label='Configuración actual' value={summary.configuracion} />
          <HighlightDetail label='Total estimado' value={summary.total} tone='alert' />
        </div>
      </div>

      {quickSuggestions.length > 0 ? (
        <>
          <div style={{ textAlign: 'center', fontWeight: 800, marginTop: 18, marginBottom: 10 }}>
            Horarios sugeridos
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {quickSuggestions.map((item) => (
              <SuggestionPill
                key={`${item.time}-${item.label}`}
                label={`${item.label}: ${item.time}`}
                active={bookingTime === item.time}
                onClick={() => setBookingTime(item.time)}
              />
            ))}
          </div>
        </>
      ) : null}

      <div style={{ ...checkboxRow, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type='checkbox'
            checked={bookingWhatsappReminder}
            onChange={(e) => setBookingWhatsappReminder(e.target.checked)}
          />
          Enviar recordatorio por WhatsApp
        </label>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: isMobile ? 16 : 18,
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 12, color: '#8ea3d5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Después de reservar</div>
        <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, lineHeight: 1.2 }}>La reserva ya te deja listo para competir, compartir o repetir</div>
        <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 1.5 }}>
          {currentKind.socialProof}
        </div>
        <div style={summaryGrid}>
          <InfoCard label='Experiencia' value='Reserva + corre + compara' />
          <InfoCard label='Siguiente paso' value={currentKind.nextStep} />
          <InfoCard label='Cierre ideal' value={canContact ? 'Ya puedes pasar a WhatsApp' : 'Completa los datos y actívalo'} tone={canContact ? 'highlight' : 'default'} />
        </div>
      </div>

      {!isAdmin && canContact ? (
        <div
          style={{
            marginTop: 14,
            padding: isMobile ? 16 : 18,
            borderRadius: 20,
            background: 'linear-gradient(180deg, rgba(37,211,102,0.14), rgba(8,18,41,0.96))',
            border: '1px solid rgba(37,211,102,0.24)',
            textAlign: 'center',
            display: 'grid',
            gap: 12,
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, color: '#9ff0bf', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.4 }}>Cierre listo</div>
            <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 900, lineHeight: 1.18 }}>Pasa a WhatsApp y asegura tu horario ahora</div>
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.5 }}>
              Ya tienes nombre, fecha, hora y total estimado. Solo falta enviar el mensaje para cerrar más rápido.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              textAlign: 'left',
            }}
          >
            <HighlightDetail label='Fecha y hora' value={selectedSlotLabel} tone='success' />
            <HighlightDetail label='Formato elegido' value={`${summary.tipo} · ${summary.configuracion}`} />
            <HighlightDetail label='Total estimado' value={summary.total} tone='alert' />
          </div>

          <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
            <a
              href={buildWhatsappLink(reservationMessage)}
              target='_blank'
              rel='noreferrer'
              style={{
                display: 'inline-block',
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? 420 : 'none',
                textDecoration: 'none',
                padding: isMobile ? '15px 18px' : '13px 20px',
                borderRadius: 16,
                background: 'linear-gradient(180deg, #39e27d, #25D366)',
                color: '#062b14',
                fontWeight: 900,
                boxShadow: '0 14px 28px rgba(37, 211, 102, 0.22)',
              }}
            >
              Confirmar por WhatsApp
            </a>
            <div style={{ color: 'rgba(255,255,255,0.64)', fontSize: 12 }}>
              El mensaje ya va armado con tu reserva para evitar ida y vuelta innecesaria.
            </div>
          </div>
        </div>
      ) : (
        !isAdmin ? (
          <div
            style={{
              marginTop: 14,
              padding: isMobile ? 14 : 16,
              borderRadius: 18,
              background: 'rgba(250,204,21,0.08)',
              border: '1px solid rgba(250,204,21,0.22)',
              textAlign: 'center',
              color: '#fff7cc',
              lineHeight: 1.5,
              fontSize: 14,
              fontWeight: 700,
              display: 'grid',
              gap: 8,
            }}
          >
            <div>Completa {missingLabels.join(', ') || 'los datos principales'} para activar el cierre directo por WhatsApp.</div>
            <div style={{ color: 'rgba(255,247,204,0.76)', fontSize: 12, fontWeight: 600 }}>
              Mientras antes lo cierres, menos riesgo de perder ese horario.
            </div>
          </div>
        ) : null
      )}

      {bookingCommercialContext ? (
        <CenteredMessage
          text={`Contexto comercial activo: ${bookingCommercialContext.label}`}
          line={line}
        />
      ) : null}

      <PrimarySecondaryActions
        primaryLabel={editingBookingId ? 'Guardar reserva' : 'Crear reserva'}
        onPrimary={createOrUpdateBooking}
        secondaryLabel={editingBookingId || bookingCommercialContext ? 'Cancelar / limpiar' : 'Limpiar'}
        onSecondary={() => {
          cancelEditBooking()
          if (typeof clearBookingCommercialContext === 'function') clearBookingCommercialContext()
        }}
        showSecondary
        buttonRow={{ ...buttonRow, justifyContent: 'center', flexWrap: 'wrap' }}
        button={button}
        buttonSecondary={buttonSecondary}
      />

      <StatusMessage
        text={bookingMessage || (canContact ? `Reserva lista para confirmar por WhatsApp. Total estimado: ${totalLabel}` : `Completa nombre, fecha y hora para activar la confirmación. Total estimado: ${totalLabel}`)}
        messageStyle={messageStyle}
      />
    </>
  )
}
