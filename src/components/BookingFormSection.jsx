import { useEffect, useMemo, useState } from 'react'
import AdminTextInput from './AdminTextInput'
import PrimarySecondaryActions from './PrimarySecondaryActions'
import StatusMessage from './StatusMessage'
import { normalizeTextInput } from '../utils/psrUtils'

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180]

const kindCards = {
  LOCAL: {
    title: 'Personas',
    subtitle: 'Reserva rápida para venir a correr',
    badge: 'Más pedido',
  },
  EVENTO: {
    title: 'Eventos',
    subtitle: 'Cumpleaños, grupos y celebraciones',
    badge: 'Grupos',
  },
  EMPRESA: {
    title: 'Empresas',
    subtitle: 'Team building y activaciones',
    badge: 'Corporativo',
  },
}

const shellStyle = {
  display: 'grid',
  gap: 18,
  maxWidth: 760,
  margin: '0 auto',
}

const introCardStyle = {
  padding: 18,
  borderRadius: 22,
  border: '1px solid rgba(41, 129, 243, 0.18)',
  background: 'linear-gradient(180deg, rgba(14,44,64,0.92) 0%, rgba(8,21,33,0.98) 100%)',
  boxShadow: '0 16px 36px rgba(0,0,0,0.28)',
}

const heroTitleStyle = {
  margin: 0,
  textAlign: 'center',
  fontSize: 'clamp(24px, 5vw, 30px)',
  lineHeight: 1.05,
  fontWeight: 900,
  color: '#F5FAFF',
}

const heroSubtitleStyle = {
  margin: '10px auto 0',
  maxWidth: 520,
  textAlign: 'center',
  color: '#AEC3D6',
  fontSize: 14,
  lineHeight: 1.45,
}

const cardsGridStyle = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
}

const chipGridStyle = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
}

const sectionLabelStyle = {
  margin: 0,
  color: '#F5FAFF',
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: '0.01em',
}

const helperTextStyle = {
  margin: 0,
  color: '#87A0B4',
  fontSize: 13,
  lineHeight: 1.4,
}

const kindCardBaseStyle = {
  width: '100%',
  padding: 16,
  borderRadius: 18,
  border: '1px solid rgba(140,174,201,0.14)',
  background: 'rgba(255,255,255,0.04)',
  color: '#F5FAFF',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  boxSizing: 'border-box',
}

const selectionPillBaseStyle = {
  width: '100%',
  padding: '14px 12px',
  borderRadius: 16,
  border: '1px solid rgba(140,174,201,0.14)',
  background: 'rgba(255,255,255,0.04)',
  color: '#F5FAFF',
  textAlign: 'center',
  cursor: 'pointer',
  fontWeight: 800,
}

const summaryCardStyle = {
  padding: 16,
  borderRadius: 20,
  border: '1px solid rgba(41,129,243,0.22)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  display: 'grid',
  gap: 10,
}

const summaryGridStyle = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
}

const summaryItemStyle = {
  borderRadius: 16,
  background: 'rgba(255,255,255,0.04)',
  padding: '12px 12px',
  minHeight: 78,
}

const fieldBlockStyle = {
  display: 'grid',
  gap: 6,
}

const fieldLabelStyle = {
  color: '#AEC3D6',
  fontSize: 12,
  fontWeight: 700,
}

const ghostBackButtonStyle = {
  border: '1px solid rgba(140,174,201,0.14)',
  background: 'rgba(255,255,255,0.04)',
  color: '#F5FAFF',
  padding: '10px 14px',
  borderRadius: 14,
  cursor: 'pointer',
  fontWeight: 700,
}

const suggestionWrapStyle = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
}

const suggestionButtonStyle = {
  border: '1px solid rgba(41,129,243,0.22)',
  background: 'rgba(41,129,243,0.10)',
  color: '#F5FAFF',
  padding: '12px 10px',
  borderRadius: 16,
  cursor: 'pointer',
  textAlign: 'left',
}

function formatPrice(value) {
  const amount = Number(value || 0)
  return `$${amount.toLocaleString('es-CL')}`
}

function getConfigLabel(configKey, BOOKING_OPTIONS) {
  return BOOKING_OPTIONS?.[configKey]?.label || configKey
}

export default function BookingFormSection(props) {
  const {
    editingBookingId,
    bookingClient, setBookingClient,
    bookingPhone, setBookingPhone,
    bookingDate, setBookingDate,
    bookingTime, setBookingTime,
    bookingKind, setBookingKind,
    bookingConfig, setBookingConfig,
    bookingDuration, setBookingDuration,
    bookingWhatsappReminder, setBookingWhatsappReminder,
    bookingCommercialContext,
    clearBookingCommercialContext,
    bookingMessage,
    availableTimeOptions,
    smartSuggestions,
    totalBooking,
    createOrUpdateBooking,
    cancelEditBooking,
    BOOKING_OPTIONS,
    normalizePhone,
    formGrid,
    input,
    checkboxRow,
    buttonRow,
    button,
    buttonSecondary,
    messageStyle,
  } = props

  const [step, setStep] = useState(editingBookingId ? 2 : 1)

  useEffect(() => {
    if (editingBookingId) setStep(2)
  }, [editingBookingId])

  const configOptions = useMemo(() => Object.keys(BOOKING_OPTIONS || {}), [BOOKING_OPTIONS])

  const hasAvailableTimes = availableTimeOptions.length > 0
  const timeOptions = hasAvailableTimes ? availableTimeOptions : ['']
  const selectedKind = kindCards[bookingKind] || kindCards.LOCAL
  const selectedConfigLabel = getConfigLabel(bookingConfig, BOOKING_OPTIONS)

  const handleBack = () => {
    if (editingBookingId) {
      cancelEditBooking?.()
      return
    }

    setStep(1)
  }

  const handleCancel = () => {
    cancelEditBooking?.()
    setStep(1)
    clearBookingCommercialContext?.()
  }

  const selectKindAndContinue = (kind) => {
    setBookingKind(kind)
    setStep(2)
  }

  return (
    <div style={shellStyle}>
      {step === 1 ? (
        <div style={introCardStyle}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <h2 style={heroTitleStyle}>Reserva en menos pasos</h2>
              <p style={heroSubtitleStyle}>
                Elige el tipo de experiencia y luego define horario, simuladores y tus datos.
              </p>
            </div>

            <div style={cardsGridStyle}>
              {Object.entries(kindCards).map(([key, item]) => {
                const active = bookingKind === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectKindAndContinue(key)}
                    style={{
                      ...kindCardBaseStyle,
                      borderColor: active ? 'rgba(41,129,243,0.5)' : kindCardBaseStyle.border,
                      background: active
                        ? 'linear-gradient(180deg, rgba(41,129,243,0.24) 0%, rgba(14,44,64,0.96) 100%)'
                        : kindCardBaseStyle.background,
                      boxShadow: active ? '0 14px 28px rgba(41,129,243,0.16)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>{item.title}</div>
                        <div style={{ color: '#AEC3D6', fontSize: 13, lineHeight: 1.4 }}>{item.subtitle}</div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          borderRadius: 999,
                          padding: '6px 8px',
                          background: 'rgba(255,255,255,0.08)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div style={{ ...introCardStyle, display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <h2 style={{ ...heroTitleStyle, textAlign: 'left', fontSize: 'clamp(22px, 4.6vw, 28px)' }}>
                {editingBookingId ? 'Editar reserva' : 'Confirma tu reserva'}
              </h2>
              <p style={{ ...helperTextStyle, color: '#AEC3D6' }}>
                {selectedKind.title} · {selectedKind.subtitle}
              </p>
            </div>

            <button type="button" onClick={handleBack} style={ghostBackButtonStyle}>
              ← {editingBookingId ? 'Salir de edición' : 'Cambiar tipo'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={sectionLabelStyle}>Configuración</p>
            <div style={chipGridStyle}>
              {configOptions.map((configKey) => {
                const active = bookingConfig === configKey
                return (
                  <button
                    key={configKey}
                    type="button"
                    onClick={() => setBookingConfig(configKey)}
                    style={{
                      ...selectionPillBaseStyle,
                      borderColor: active ? 'rgba(41,129,243,0.5)' : 'rgba(140,174,201,0.14)',
                      background: active
                        ? 'linear-gradient(135deg, rgba(14,44,64,1), rgba(41,129,243,0.92))'
                        : 'rgba(255,255,255,0.04)',
                      boxShadow: active ? '0 12px 24px rgba(41,129,243,0.18)' : 'none',
                    }}
                  >
                    {getConfigLabel(configKey, BOOKING_OPTIONS)}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={sectionLabelStyle}>Duración</p>
            <div style={chipGridStyle}>
              {DURATION_OPTIONS.map((duration) => {
                const active = Number(bookingDuration) === duration
                return (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setBookingDuration(duration)}
                    style={{
                      ...selectionPillBaseStyle,
                      borderColor: active ? 'rgba(41,129,243,0.5)' : 'rgba(140,174,201,0.14)',
                      background: active ? 'rgba(41,129,243,0.18)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {duration} min
                  </button>
                )
              })}
            </div>
          </div>

          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#87A0B4', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Resumen</div>
                <div style={{ color: '#F5FAFF', fontWeight: 900, fontSize: 22 }}>{formatPrice(totalBooking)}</div>
              </div>
              <div
                style={{
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontWeight: 800,
                  fontSize: 12,
                  color: '#F5FAFF',
                  background: 'rgba(41,129,243,0.16)',
                  border: '1px solid rgba(41,129,243,0.22)',
                }}
              >
                {bookingWhatsappReminder ? 'Con recordatorio WhatsApp' : 'Sin recordatorio'}
              </div>
            </div>

            <div style={summaryGridStyle}>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Tipo</div>
                <div style={{ color: '#F5FAFF', fontWeight: 800, lineHeight: 1.35 }}>{selectedKind.title}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Simuladores</div>
                <div style={{ color: '#F5FAFF', fontWeight: 800, lineHeight: 1.35 }}>{selectedConfigLabel}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Duración</div>
                <div style={{ color: '#F5FAFF', fontWeight: 800, lineHeight: 1.35 }}>{bookingDuration} min</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={sectionLabelStyle}>Fecha y hora</p>
            <p style={helperTextStyle}>Primero define el bloque. Luego completa tus datos.</p>
            <div style={formGrid}>
              <div style={fieldBlockStyle}>
                <span style={fieldLabelStyle}>Fecha</span>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={input} />
              </div>

              <div style={fieldBlockStyle}>
                <span style={fieldLabelStyle}>Hora</span>
                <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={input}>
                  {timeOptions.map((t) => (
                    <option key={t || 'empty'} value={t}>{t || 'Sin horarios disponibles'}</option>
                  ))}
                </select>
              </div>
            </div>

            {smartSuggestions?.length ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ color: '#87A0B4', fontSize: 12, fontWeight: 700 }}>Horarios sugeridos</div>
                <div style={suggestionWrapStyle}>
                  {smartSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.time}`}
                      type="button"
                      onClick={() => setBookingTime(suggestion.time)}
                      style={suggestionButtonStyle}
                    >
                      <div style={{ fontSize: 12, color: '#AEC3D6', marginBottom: 4 }}>{suggestion.label}</div>
                      <div style={{ fontWeight: 900, fontSize: 17 }}>{suggestion.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!hasAvailableTimes && bookingDate ? (
              <div
                style={{
                  borderRadius: 14,
                  padding: '12px 14px',
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.20)',
                  color: '#FECACA',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                No hay horarios disponibles para esa fecha y configuración.
              </div>
            ) : null}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={sectionLabelStyle}>Tus datos</p>
            <div style={formGrid}>
              <div style={fieldBlockStyle}>
                <span style={fieldLabelStyle}>Nombre</span>
                <AdminTextInput
                  value={bookingClient}
                  onChange={(e) => setBookingClient(normalizeTextInput(e.target.value))}
                  placeholder="Nombre y apellido"
                  style={input}
                />
              </div>

              <div style={fieldBlockStyle}>
                <span style={fieldLabelStyle}>WhatsApp</span>
                <AdminTextInput
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(normalizePhone(e.target.value))}
                  placeholder="+56 9 ..."
                  style={input}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              ...checkboxRow,
              margin: 0,
              padding: '12px 14px',
              borderRadius: 16,
              border: '1px solid rgba(140,174,201,0.14)',
              background: 'rgba(255,255,255,0.04)',
              alignItems: 'flex-start',
            }}
          >
            <input
              type="checkbox"
              checked={bookingWhatsappReminder}
              onChange={(e) => setBookingWhatsappReminder(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <div style={{ display: 'grid', gap: 4 }}>
              <span style={{ color: '#F5FAFF', fontWeight: 800 }}>Quiero recordatorio por WhatsApp</span>
              <span style={{ color: '#87A0B4', fontSize: 12, lineHeight: 1.4 }}>
                Útil para no perder la hora reservada.
              </span>
            </div>
          </div>

          {bookingCommercialContext ? (
            <div
              style={{
                borderRadius: 16,
                padding: '12px 14px',
                border: '1px solid rgba(41,129,243,0.20)',
                background: 'rgba(41,129,243,0.08)',
                color: '#DCEBFF',
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              Llegaste desde una sección comercial. Mantendremos esta reserva alineada con ese contexto.
            </div>
          ) : null}

          <PrimarySecondaryActions
            primaryLabel={editingBookingId ? 'Guardar reserva' : 'Reservar ahora'}
            onPrimary={createOrUpdateBooking}
            secondaryLabel={editingBookingId ? 'Cancelar edición' : 'Limpiar'}
            onSecondary={handleCancel}
            showSecondary
            buttonRow={buttonRow}
            button={{
              ...button,
              width: '100%',
              justifyContent: 'center',
              fontSize: 16,
              padding: '15px 18px',
            }}
            buttonSecondary={buttonSecondary}
          />

          <StatusMessage text={bookingMessage} messageStyle={messageStyle} />
        </div>
      ) : null}
    </div>
  )
}
