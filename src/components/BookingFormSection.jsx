import { useMemo, useState } from 'react'
import AdminTextInput from './AdminTextInput'
import PrimarySecondaryActions from './PrimarySecondaryActions'
import StatusMessage from './StatusMessage'
import { normalizeTextInput } from '../utils/psrUtils'
import { PSR_EMAIL, buildBookingWhatsappLink, buildBusinessEmailLink } from '../utils/whatsappHelper'

const DURATION_OPTIONS = [15, 30, 60, 90, 120, 150, 180]

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
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
}

const chipGridStyle = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
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
  padding: '14px 10px',
  borderRadius: 16,
  border: '1px solid rgba(140,174,201,0.14)',
  background: 'rgba(255,255,255,0.04)',
  color: '#F5FAFF',
  textAlign: 'center',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: 'clamp(12px, 3.2vw, 14px)',
  lineHeight: 1.15,
  whiteSpace: 'normal',
  minHeight: 52,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
}

const summaryCardStyle = {
  padding: 16,
  borderRadius: 20,
  border: '1px solid rgba(41,129,243,0.22)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  display: 'grid',
  gap: 10,
  minWidth: 0,
}

const summaryMainContentStyle = {
  display: 'grid',
  gap: 6,
  minWidth: 0,
  flex: '1 1 260px',
}

const businessRequirementLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 'clamp(12px, 3.4vw, 14px)',
  lineHeight: 1.25,
  textAlign: 'center',
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  textDecoration: 'none',
  cursor: 'pointer',
  color: '#F5FAFF',
  background: 'rgba(41,129,243,0.16)',
  border: '1px solid rgba(41,129,243,0.22)',
  boxSizing: 'border-box',
}

const businessRequirementTextStyle = {
  color: '#F5FAFF',
  fontWeight: 900,
  fontSize: 'clamp(16px, 4vw, 22px)',
  lineHeight: 1.15,
  minWidth: 0,
  maxWidth: '100%',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
}

const summaryGridStyle = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
}

const summaryItemStyle = {
  borderRadius: 16,
  background: 'rgba(255,255,255,0.04)',
  padding: '12px 12px',
  minHeight: 78,
  minWidth: 0,
  overflow: 'hidden',
}


const summaryValueStyle = {
  color: '#F5FAFF',
  fontWeight: 800,
  lineHeight: 1.2,
  minWidth: 0,
  maxWidth: '100%',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
}

const summarySimulatorValueStyle = {
  ...summaryValueStyle,
  fontSize: 'clamp(11px, 2.9vw, 14px)',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
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


function formatPrice(value) {
  const amount = Number(value || 0)
  return `$${amount.toLocaleString('es-CL')}`
}

function getConfigLabel(configKey, BOOKING_OPTIONS) {
  return BOOKING_OPTIONS?.[configKey]?.label || configKey
}

function renderTopConfigLabel(label) {
  if (label === '3 SIMULADORES') {
    return (
      <span style={{ display: 'inline-grid', justifyItems: 'center', lineHeight: 1.05 }}>
        <span>3</span>
        <span>SIMULADORES</span>
      </span>
    )
  }

  return <span>{label}</span>
}

function renderSummaryConfigLabel(label) {
  if (label === '3 SIMULADORES') {
    return (
      <span style={{ display: 'inline-grid', gap: 2 }}>
        <span>3</span>
        <span>SIMULADORES</span>
      </span>
    )
  }

  if (label === '1 ESTÁNDAR + 1 PRO') {
    return (
      <span style={{ display: 'inline-grid', gap: 2 }}>
        <span>1 ESTÁNDAR</span>
        <span>+ 1 PRO</span>
      </span>
    )
  }

  return label
}

export default function BookingFormSection(props) {
  const {
    isAdmin,
    editingBookingId,
    bookingClient, setBookingClient,
    bookingPhone, setBookingPhone,
    bookingDate, setBookingDate,
    bookingTime, setBookingTime,
    bookingKind, setBookingKind,
    bookingConfig, setBookingConfig,
    bookingDuration, setBookingDuration,
    bookingWhatsappReminder, setBookingWhatsappReminder,
    bookingSuccessSummary,
    bookingCommercialContext,
    clearBookingCommercialContext,
    clearBookingSuccessSummary,
    bookingMessage,
    bookingSuggestedTimes = [],
    bookingSuggestedDates = [],
    editingConflictWarning = '',
    isBookingSubmitting,
    availableTimeOptions,
    minPublicBookingDate = '',
    totalBooking,
    createOrUpdateBooking,
    cancelEditBooking,
    onBookingDraftAbandon,
    onBookingCancel,
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
  const currentStep = editingBookingId ? 2 : step

  const configOptions = useMemo(() => Object.keys(BOOKING_OPTIONS || {}), [BOOKING_OPTIONS])

  const hasAvailableTimes = availableTimeOptions.length > 0
  const hasEditingConflictWarning = Boolean(editingConflictWarning)
  const timeOptions = hasAvailableTimes ? availableTimeOptions : ['']
  const selectedKind = kindCards[bookingKind] || kindCards.LOCAL
  const selectedConfigLabel = getConfigLabel(bookingConfig, BOOKING_OPTIONS)
  const businessMailto = useMemo(() => buildBusinessEmailLink({
    client: bookingClient,
    phone: bookingPhone,
    date: bookingDate,
    time: bookingTime,
    kind: bookingKind,
    configLabel: selectedConfigLabel,
    duration: bookingDuration,
  }), [bookingClient, bookingPhone, bookingDate, bookingTime, bookingKind, selectedConfigLabel, bookingDuration])
  const isBusinessBooking = bookingKind === 'EVENTO' || bookingKind === 'EMPRESA'
  const successIsBusinessBooking = bookingSuccessSummary?.kind === 'EVENTO' || bookingSuccessSummary?.kind === 'EMPRESA'
  const successContactLink = bookingSuccessSummary?.contactLink || (successIsBusinessBooking ? buildBusinessEmailLink({
    client: bookingSuccessSummary?.client,
    phone: bookingSuccessSummary?.phone,
    date: bookingSuccessSummary?.date,
    time: bookingSuccessSummary?.time,
    kind: bookingSuccessSummary?.kind,
    configLabel: bookingSuccessSummary?.configLabel,
    duration: bookingSuccessSummary?.duration,
  }) : bookingSuccessSummary?.whatsappLink)
  const alternativeWhatsappLink = buildBookingWhatsappLink([
    'Hola, quiero una alternativa de horario en Patagonia SimRacing.',
    bookingKind ? `Tipo: ${selectedKind.title}` : '',
    bookingDate ? `Fecha que me acomoda: ${bookingDate}` : '',
    bookingConfig ? `Configuración: ${selectedConfigLabel}` : '',
    bookingDuration ? `Duración: ${bookingDuration} min` : '',
    '',
    '¿Qué horario cercano me recomiendan?',
  ].filter(Boolean).join('\n'))

  const handleBack = () => {
    if (editingBookingId) {
      onBookingCancel?.('user_back_edit')
      cancelEditBooking?.()
      return
    }

    if (currentStep > 1) {
      onBookingDraftAbandon?.('user_back')
    }
    clearBookingSuccessSummary?.()
    setStep(1)
  }

  const handleCancel = () => {
    if (editingBookingId) {
      onBookingCancel?.('user_cancel_edit')
    } else if (currentStep > 1) {
      onBookingDraftAbandon?.('user_cancel')
    }
    cancelEditBooking?.()
    setStep(1)
    clearBookingCommercialContext?.()
  }

  const selectKindAndContinue = (kind) => {
    clearBookingSuccessSummary?.()
    setBookingKind(kind)
    setStep(2)
  }

  const handleCreateAnotherBooking = () => {
    clearBookingSuccessSummary?.()
    clearBookingCommercialContext?.()
    setStep(1)
  }

  if (bookingSuccessSummary && !editingBookingId) {
    return (
      <div style={shellStyle}>
        <div style={{ ...introCardStyle, display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gap: 8, textAlign: 'center' }}>
            <div
              style={{
                margin: '0 auto',
                width: 56,
                height: 56,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                fontSize: 26,
                fontWeight: 900,
                color: '#F5FAFF',
                background: 'linear-gradient(135deg, rgba(14,44,64,1), rgba(41,129,243,0.92))',
                boxShadow: '0 14px 28px rgba(41,129,243,0.18)',
              }}
            >
              ✓
            </div>
            <h2 style={heroTitleStyle}>Reserva confirmada ✅</h2>
            <p style={heroSubtitleStyle}>
              {successIsBusinessBooking
                ? 'Tu solicitud quedó registrada. Para eventos y empresas, el siguiente paso es escribirnos por correo para definir requerimientos.'
                : 'Tu reserva quedó registrada. Te esperamos en PSR. Si quieres acelerar la confirmación, puedes escribirnos por WhatsApp ahora.'}
            </p>
          </div>

          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={summaryMainContentStyle}>
                <div style={{ color: '#87A0B4', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {successIsBusinessBooking ? 'Requerimiento' : 'Total estimado'}
                </div>
                <div style={businessRequirementTextStyle}>
                  {successIsBusinessBooking ? 'Escríbenos para definir tus requerimientos' : formatPrice(bookingSuccessSummary.total)}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontWeight: 800,
                  fontSize: 12,
                  lineHeight: 1.15,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  color: '#F5FAFF',
                  background: 'rgba(41,129,243,0.16)',
                  border: '1px solid rgba(41,129,243,0.22)',
                }}
              >
                {bookingSuccessSummary.whatsappReminder ? 'Con recordatorio WhatsApp' : 'Sin recordatorio'}
              </div>
            </div>

            <div
              style={{
                borderRadius: 14,
                padding: '10px 12px',
                background: 'rgba(41,129,243,0.08)',
                border: '1px solid rgba(41,129,243,0.18)',
                color: '#DCEBFF',
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              Horarios se llenan rápido después de las 18:00
            </div>

            <div style={summaryGridStyle}>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Nombre</div>
                <div style={summaryValueStyle}>{bookingSuccessSummary.client || '-'}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Fecha</div>
                <div style={summaryValueStyle}>{bookingSuccessSummary.date || '-'}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Hora</div>
                <div style={summaryValueStyle}>{bookingSuccessSummary.time || '-'}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Tipo</div>
                <div style={summaryValueStyle}>{kindCards[bookingSuccessSummary.kind]?.title || bookingSuccessSummary.kind || '-'}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Simuladores</div>
                <div style={summarySimulatorValueStyle}>{renderSummaryConfigLabel(bookingSuccessSummary.configLabel || '-')}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Duración</div>
                <div style={summaryValueStyle}>{bookingSuccessSummary.duration || '-'} min</div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: '12px 14px',
              border: '1px solid rgba(41,129,243,0.20)',
              background: 'rgba(41,129,243,0.08)',
              color: '#DCEBFF',
              fontSize: 13,
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {successIsBusinessBooking
              ? 'Tu solicitud ya quedó registrada. Escríbenos por correo y definimos requerimientos, formato y disponibilidad.'
              : 'Tu reserva ya quedó registrada. WhatsApp sirve para confirmar más rápido o pedir una alternativa cercana.'}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <a
              href={successContactLink}
              target="_blank"
              rel="noreferrer"
              style={{
                ...button,
                width: '100%',
                justifyContent: 'center',
                fontSize: 16,
                padding: '15px 18px',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              {successIsBusinessBooking ? 'Escribir por correo' : 'Confirmar más rápido por WhatsApp'}
            </a>
            <button
              type="button"
              onClick={handleCreateAnotherBooking}
              style={{
                ...buttonSecondary,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              Crear otra reserva
            </button>
          </div>

          <StatusMessage text={bookingMessage} messageStyle={messageStyle} />
        </div>
      </div>
    )
  }

  return (
    <div style={shellStyle}>
      {currentStep === 1 ? (
        <div style={{ ...introCardStyle, padding: 14 }}>
          <div style={cardsGridStyle}>
            {Object.entries(kindCards).map(([key, item]) => {
              const active = bookingKind === key

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectKindAndContinue(key)}
                  disabled={isBookingSubmitting || (Boolean(bookingDate) && !hasAvailableTimes)}
                  style={{
                    ...kindCardBaseStyle,
                    borderColor: active ? 'rgba(41,129,243,0.5)' : kindCardBaseStyle.border,
                    background: active
                      ? 'linear-gradient(180deg, rgba(41,129,243,0.24) 0%, rgba(14,44,64,0.96) 100%)'
                      : kindCardBaseStyle.background,
                    boxShadow: active ? '0 14px 28px rgba(41,129,243,0.16)' : 'none',
                    opacity: isBookingSubmitting ? 0.7 : 1,
                    cursor: isBookingSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>{item.title}</div>
                      <div style={{ color: '#AEC3D6', fontSize: 13, lineHeight: 1.4 }}>{item.subtitle}</div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 0,
                        maxWidth: '100%',
                        minHeight: 32,
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                        borderRadius: 999,
                        padding: '6px 10px',
                        background: 'rgba(255,255,255,0.08)',
                        whiteSpace: 'normal',
                        lineHeight: 1.15,
                        flexShrink: 0,
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
      ) : null}

      {currentStep === 2 ? (
        <div style={{ ...introCardStyle, display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gap: 6 }}>
              {!editingBookingId ? (
                <p style={{ ...helperTextStyle, color: '#DCEBFF', fontWeight: 700 }}>
                  Reserva tu simulador en menos de 30 segundos
                </p>
              ) : null}
              <h2 style={{ ...heroTitleStyle, textAlign: 'left', fontSize: 'clamp(22px, 4.6vw, 28px)' }}>
                {editingBookingId ? 'Actualiza tu reserva' : 'Confirma tu reserva'}
              </h2>
              <p style={{ ...helperTextStyle, color: '#AEC3D6' }}>
                {selectedKind.title} · {selectedKind.subtitle}
              </p>
              {bookingKind === 'EVENTO' ? (
                <p style={{ ...helperTextStyle, color: '#DCEBFF' }}>
                  Ideal para cumpleaños o grupos. Podemos ayudarte a organizarlo.
                </p>
              ) : null}
              {bookingKind === 'EMPRESA' ? (
                <p style={{ ...helperTextStyle, color: '#DCEBFF' }}>
                  Team building, eventos corporativos o experiencias privadas.
                </p>
              ) : null}
            </div>

            <button type="button" onClick={handleBack} style={ghostBackButtonStyle} disabled={isBookingSubmitting}>
              ← {editingBookingId ? 'Volver al resumen' : 'Cambiar tipo'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={sectionLabelStyle}>Configuración</p>
            <div style={chipGridStyle}>
              {configOptions.map((configKey) => {
                const active = bookingConfig === configKey
                const configLabel = getConfigLabel(configKey, BOOKING_OPTIONS)
                const isThreeSimulators = configLabel === '3 SIMULADORES'

                return (
                  <button
                    key={configKey}
                    type="button"
                    onClick={() => setBookingConfig(configKey)}
                  disabled={isBookingSubmitting}
                    style={{
                      ...selectionPillBaseStyle,
                      borderColor: active ? 'rgba(41,129,243,0.5)' : 'rgba(140,174,201,0.14)',
                      background: active
                        ? 'linear-gradient(135deg, rgba(14,44,64,1), rgba(41,129,243,0.92))'
                        : 'rgba(255,255,255,0.04)',
                      boxShadow: active ? '0 12px 24px rgba(41,129,243,0.18)' : 'none',
                      whiteSpace: isThreeSimulators ? 'normal' : selectionPillBaseStyle.whiteSpace,
                      opacity: isBookingSubmitting ? 0.7 : 1,
                      cursor: isBookingSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'grid',
                        width: '100%',
                        minWidth: 0,
                        justifyItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      {renderTopConfigLabel(configLabel)}
                    </span>
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
                  disabled={isBookingSubmitting}
                    style={{
                      ...selectionPillBaseStyle,
                      borderColor: active ? 'rgba(41,129,243,0.5)' : 'rgba(140,174,201,0.14)',
                      background: active ? 'rgba(41,129,243,0.18)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ display: 'block', width: '100%', minWidth: 0 }}>{duration} min</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={summaryMainContentStyle}>
                <div style={{ color: '#87A0B4', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {isBusinessBooking ? 'Requerimiento' : 'Resumen'}
                </div>
                <div style={businessRequirementTextStyle}>
                  {isBusinessBooking ? (
                  <a
                    href={businessMailto}
                    title={`Escribir a ${PSR_EMAIL}`}
                    style={businessRequirementLinkStyle}
                  >
                    Escríbenos para definir tus requerimientos
                  </a>
                ) : formatPrice(totalBooking)}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontWeight: 800,
                  fontSize: 12,
                  lineHeight: 1.15,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
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
                <div style={summaryValueStyle}>{selectedKind.title}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Simuladores</div>
                <div style={summarySimulatorValueStyle}>{renderSummaryConfigLabel(selectedConfigLabel)}</div>
              </div>
              <div style={summaryItemStyle}>
                <div style={{ color: '#87A0B4', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Duración</div>
                <div style={summaryValueStyle}>{bookingDuration} min</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={sectionLabelStyle}>Fecha y hora</p>
            <p style={helperTextStyle}>Primero define el bloque. Luego completa tus datos.</p>
            <div style={formGrid}>
              <div style={fieldBlockStyle}>
                <span style={fieldLabelStyle}>Fecha</span>
                <input type="date" min={!isAdmin ? minPublicBookingDate : undefined} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={input} />
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

            {hasEditingConflictWarning ? (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  borderRadius: 14,
                  padding: '12px 14px',
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.22)',
                }}
              >
                <div style={{ color: '#FECACA', fontSize: 13, fontWeight: 800 }}>
                  Revisión necesaria antes de guardar
                </div>
                <div style={{ color: '#FDE2E2', fontSize: 13, lineHeight: 1.45 }}>
                  {editingConflictWarning}
                </div>
              </div>
            ) : null}

            {hasAvailableTimes && bookingDate && bookingSuggestedTimes.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  borderRadius: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(140,174,201,0.14)',
                }}
              >
                <div style={{ color: '#F5FAFF', fontSize: 13, fontWeight: 800 }}>
                  Horarios cercanos disponibles
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {bookingSuggestedTimes.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTime(slot)}
                      disabled={isBookingSubmitting}
                      style={{
                        ...buttonSecondary,
                        padding: '10px 14px',
                        minWidth: 88,
                        justifyContent: 'center',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!hasAvailableTimes && bookingDate ? (
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  borderRadius: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(140,174,201,0.14)',
                }}
              >
                <div style={{ color: '#F5FAFF', fontSize: 13, fontWeight: 800 }}>
                  Este horario ya no está disponible, prueba otro.
                </div>
                <div style={{ color: '#AEC3D6', fontSize: 13, lineHeight: 1.45 }}>
                  {isBusinessBooking
                    ? 'Escríbenos por correo y te ayudamos a definir una alternativa según tus requerimientos.'
                    : 'Escríbenos y te ayudamos a encontrar una alternativa cercana.'}
                </div>

                {bookingSuggestedDates.length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ color: '#F5FAFF', fontSize: 13, fontWeight: 800 }}>
                      Días cercanos con horarios disponibles
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {bookingSuggestedDates.map((item) => (
                        <button
                          key={item.date}
                          type="button"
                          onClick={() => {
                            setBookingDate(item.date)
                            setBookingTime(item.firstTime)
                          }}
                          disabled={isBookingSubmitting}
                          style={{
                            ...buttonSecondary,
                            padding: '10px 12px',
                            minWidth: 112,
                            justifyContent: 'center',
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ display: 'grid', gap: 2 }}>
                            <span>{item.date}</span>
                            <span style={{ fontSize: 11, opacity: 0.82 }}>
                              {item.firstTime} · {item.slotsCount} horarios
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <a
                  href={isBusinessBooking ? businessMailto : alternativeWhatsappLink}
                  style={{
                    ...buttonSecondary,
                    width: '100%',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {isBusinessBooking ? 'Consultar alternativa por correo' : 'Consultar alternativa por WhatsApp'}
                </a>
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

          <div
            style={{
              borderRadius: 14,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(140,174,201,0.14)',
              color: '#AEC3D6',
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            {isBusinessBooking
              ? 'Al enviar verás un resumen final y el acceso directo al correo de contacto para definir requerimientos.'
              : 'Al enviar verás un resumen final y el acceso directo para confirmar por WhatsApp.'}
          </div>

          <PrimarySecondaryActions
            primaryLabel={isBookingSubmitting ? (editingBookingId ? 'Guardando...' : 'Guardando...') : (editingBookingId ? 'Guardar reserva' : 'Reservar ahora')}
            onPrimary={createOrUpdateBooking}
            secondaryLabel={editingBookingId ? 'Descartar cambios' : 'Limpiar'}
            onSecondary={handleCancel}
            disabled={isBookingSubmitting || hasEditingConflictWarning}
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
