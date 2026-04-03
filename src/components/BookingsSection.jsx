/**
 * ACTIVE / CAPA PRINCIPAL DE RESERVAS
 * Este contenedor sí está conectado al flujo principal desde src/App.jsx.
 * Los cambios del flujo real de reservas deben validarse aquí y en bookingEngine.js.
 */
import { useMemo, useState } from 'react'

import BookingFormSection from './BookingFormSection'
import BookingTableSection from './BookingTableSection'
import SectionCard from './SectionCard'
import SectionContentSpacing from './SectionContentSpacing'
import { buildDailyTimeline, buildFocusedTimeline, getTodayDateString, timeToMinutes } from '../utils/bookingEngine.js'

const publicIntroCardStyle = {
  display: 'grid',
  gap: 14,
  padding: 18,
  borderRadius: 22,
  border: '1px solid rgba(41,129,243,0.18)',
  background: 'linear-gradient(180deg, rgba(14,44,64,0.92) 0%, rgba(8,21,33,0.98) 100%)',
  boxShadow: '0 16px 36px rgba(0,0,0,0.24)',
}

const publicHeroTitleStyle = {
  margin: 0,
  color: '#F5FAFF',
  fontSize: 'clamp(24px, 5vw, 31px)',
  lineHeight: 1.06,
  fontWeight: 900,
  textAlign: 'center',
}

const publicHeroTextStyle = {
  margin: 0,
  color: '#AEC3D6',
  fontSize: 14,
  lineHeight: 1.55,
  maxWidth: 620,
  marginInline: 'auto',
  textAlign: 'center',
}

const quickPointsGridStyle = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
}

const quickPointStyle = {
  display: 'grid',
  gap: 6,
  padding: '14px 12px',
  borderRadius: 18,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(140,174,201,0.12)',
  textAlign: 'center',
}

const quickPointStepStyle = {
  color: '#7AB2FF',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const quickPointTitleStyle = {
  color: '#F5FAFF',
  fontSize: 15,
  fontWeight: 900,
  lineHeight: 1.2,
}

const quickPointTextStyle = {
  color: '#87A0B4',
  fontSize: 12,
  lineHeight: 1.45,
}

const trustRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
}

const trustPillStyle = {
  padding: '8px 11px',
  borderRadius: 999,
  background: 'rgba(41,129,243,0.12)',
  border: '1px solid rgba(41,129,243,0.18)',
  color: '#DCEBFF',
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.2,
}


function sortBookingsNewestFirst(bookings = []) {
  return [...bookings].sort((a, b) => {
    const dateCompare = String(b.booking_date || '').localeCompare(String(a.booking_date || ''))
    if (dateCompare !== 0) return dateCompare

    const timeCompare = (timeToMinutes(String(b.booking_time || '').slice(0, 5)) || 0) - (timeToMinutes(String(a.booking_time || '').slice(0, 5)) || 0)
    if (timeCompare !== 0) return timeCompare

    return Number(b.id || 0) - Number(a.id || 0)
  })
}


export default function BookingsSection({
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
  bookingSuccessSummary,
  bookingCommercialContext,
  clearBookingCommercialContext,
  clearBookingSuccessSummary,
  bookingMessage,
  bookingSuggestedTimes,
  bookingSuggestedDates,
  editingConflictWarning,
  isBookingSubmitting,
  availableTimeOptions,
  minPublicBookingDate,
  totalBooking,
  createOrUpdateBooking,
  cancelEditBooking,
  onBookingDraftAbandon,
  onBookingCancel,
  bookings,
  startEditBooking,
  deleteBooking,
  BOOKING_OPTIONS,
  normalizeText,
  normalizePhone,
  formatDateChile,
  card,
  sectionTitle,
  formGrid,
  input,
  checkboxRow,
  line,
  buttonRow,
  button,
  buttonSecondary,
  messageStyle,
  tableWrap,
  table,
  th,
  td,
  buttonRowSmall,
  miniButton,
  miniDanger,
}) {
  const [adminViewMode, setAdminViewMode] = useState('all')
  const [adminOperationDate, setAdminOperationDate] = useState(bookingDate || getTodayDateString())

  const syncedAdminOperationDate = bookingDate || adminOperationDate
  const operationDate = isAdmin && adminViewMode === 'day' ? syncedAdminOperationDate : ''
  const dailyTimeline = buildFocusedTimeline(
    buildDailyTimeline(bookings, operationDate),
    bookingTime
  )

  const visibleBookings = useMemo(() => {
    const base = isAdmin && adminViewMode === 'day'
      ? bookings.filter((booking) => booking.booking_date === syncedAdminOperationDate)
      : bookings

    return sortBookingsNewestFirst(base)
  }, [adminViewMode, bookings, isAdmin, syncedAdminOperationDate])


  return (
    <SectionCard title="📅 Reservas" card={card} sectionTitle={sectionTitle}>
      {!isAdmin ? (
        <div style={publicIntroCardStyle}>
          <div style={{ display: 'grid', gap: 10 }}>
            <h2 style={publicHeroTitleStyle}>Reserva rápido y sin enredos</h2>
            <p style={publicHeroTextStyle}>
              Elige el tipo de experiencia, define simuladores, fecha y hora, y confirma todo desde el teléfono en pocos pasos.
            </p>
          </div>

          <div style={trustRowStyle}>
            <span style={trustPillStyle}>Sin experiencia previa</span>
            <span style={trustPillStyle}>Desde el teléfono</span>
            <span style={trustPillStyle}>Confirmación rápida</span>
          </div>

          <div style={quickPointsGridStyle}>
            <div style={quickPointStyle}>
              <span style={quickPointStepStyle}>Paso 1</span>
              <span style={quickPointTitleStyle}>Elige tu tipo</span>
              <span style={quickPointTextStyle}>Persona, grupo o empresa según lo que necesites.</span>
            </div>
            <div style={quickPointStyle}>
              <span style={quickPointStepStyle}>Paso 2</span>
              <span style={quickPointTitleStyle}>Arma tu bloque</span>
              <span style={quickPointTextStyle}>Selecciona simuladores, duración, fecha y horario disponible.</span>
            </div>
            <div style={quickPointStyle}>
              <span style={quickPointStepStyle}>Paso 3</span>
              <span style={quickPointTitleStyle}>Confirma tu hora</span>
              <span style={quickPointTextStyle}>Deja tus datos y asegura la reserva en pocos segundos.</span>
            </div>
          </div>
        </div>
      ) : null}

      <BookingFormSection
        isAdmin={isAdmin}
        editingBookingId={editingBookingId}
        bookingClient={bookingClient}
        setBookingClient={setBookingClient}
        bookingPhone={bookingPhone}
        setBookingPhone={setBookingPhone}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        bookingTime={bookingTime}
        setBookingTime={setBookingTime}
        bookingKind={bookingKind}
        setBookingKind={setBookingKind}
        bookingConfig={bookingConfig}
        setBookingConfig={setBookingConfig}
        bookingDuration={bookingDuration}
        setBookingDuration={setBookingDuration}
        bookingWhatsappReminder={bookingWhatsappReminder}
        setBookingWhatsappReminder={setBookingWhatsappReminder}
        bookingSuccessSummary={bookingSuccessSummary}
        bookingCommercialContext={bookingCommercialContext}
        clearBookingCommercialContext={clearBookingCommercialContext}
        clearBookingSuccessSummary={clearBookingSuccessSummary}
        bookingMessage={bookingMessage}
        bookingSuggestedTimes={bookingSuggestedTimes}
        bookingSuggestedDates={bookingSuggestedDates}
        editingConflictWarning={editingConflictWarning}
        isBookingSubmitting={isBookingSubmitting}
        availableTimeOptions={availableTimeOptions}
        minPublicBookingDate={minPublicBookingDate}
        totalBooking={totalBooking}
        createOrUpdateBooking={createOrUpdateBooking}
        cancelEditBooking={cancelEditBooking}
        onBookingDraftAbandon={onBookingDraftAbandon}
        onBookingCancel={onBookingCancel}
        BOOKING_OPTIONS={BOOKING_OPTIONS}
        normalizeText={normalizeText}
        normalizePhone={normalizePhone}
        formGrid={formGrid}
        input={input}
        checkboxRow={checkboxRow}
        line={line}
        buttonRow={buttonRow}
        button={button}
        buttonSecondary={buttonSecondary}
        messageStyle={messageStyle}
      />

      {isAdmin && (
        <SectionContentSpacing>
          <BookingTableSection
            isAdmin={isAdmin}
            bookings={visibleBookings}
            operationDate={operationDate}
            adminViewMode={adminViewMode}
            setAdminViewMode={setAdminViewMode}
            adminOperationDate={syncedAdminOperationDate}
            setAdminOperationDate={setAdminOperationDate}
            dailyTimeline={dailyTimeline}
            bookingMessage={bookingMessage}
            startEditBooking={startEditBooking}
            cancelEditBooking={cancelEditBooking}
            deleteBooking={deleteBooking}
            normalizeText={normalizeText}
            normalizePhone={normalizePhone}
            formatDateChile={formatDateChile}
            line={line}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
            buttonRowSmall={buttonRowSmall}
            miniButton={miniButton}
            miniDanger={miniDanger}
            isBookingSubmitting={isBookingSubmitting}
          />
        </SectionContentSpacing>
      )}
    </SectionCard>
  )
}
