import { useMemo } from 'react'
import BookingFormSection from './BookingFormSection'
import BookingTableSection from './BookingTableSection'
import SectionCard from './SectionCard'
import SectionContentSpacing from './SectionContentSpacing'
import { buildDailyTimeline, buildFocusedTimeline } from '../utils/bookingLogic'

function toTimeMinutes(value) {
  const [hours = '0', minutes = '0'] = String(value || '0:0').split(':')
  return Number(hours) * 60 + Number(minutes)
}

function getSmartSuggestions(times = []) {
  if (!times.length) return []

  const ordered = [...times].sort((a, b) => toTimeMinutes(a) - toTimeMinutes(b))

  if (ordered.length === 1) {
    return [{ time: ordered[0], label: 'Último cupo' }]
  }

  if (ordered.length === 2) {
    return [
      { time: ordered[0], label: 'Más próximo' },
      { time: ordered[1], label: 'Último cupo' },
    ]
  }

  const indexes = [0, Math.floor((ordered.length - 1) / 2), ordered.length - 1]
  const labels = ['Más próximo', 'Recomendado', 'Último cupo']

  return indexes.map((index, position) => ({
    time: ordered[index],
    label: labels[position],
  }))
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
  bookingCommercialContext,
  clearBookingCommercialContext,
  bookingMessage,
  availableTimeOptions,
  suggestedTimes,
  totalBooking,
  createOrUpdateBooking,
  cancelEditBooking,
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
  const operationDate = bookingDate || ''
  const dailyTimeline = buildFocusedTimeline(
    buildDailyTimeline(bookings, operationDate),
    bookingTime
  )

  const smartSuggestions = useMemo(() => getSmartSuggestions(suggestedTimes), [suggestedTimes])

  return (
    <SectionCard title="📅 Reservas" card={card} sectionTitle={sectionTitle}>
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
        bookingCommercialContext={bookingCommercialContext}
        clearBookingCommercialContext={clearBookingCommercialContext}
        bookingMessage={bookingMessage}
        availableTimeOptions={availableTimeOptions}
        suggestedTimes={suggestedTimes}
        smartSuggestions={smartSuggestions}
        totalBooking={totalBooking}
        createOrUpdateBooking={createOrUpdateBooking}
        cancelEditBooking={cancelEditBooking}
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
            bookings={bookings}
            operationDate={operationDate}
            dailyTimeline={dailyTimeline}
            startEditBooking={startEditBooking}
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
          />
        </SectionContentSpacing>
      )}
    </SectionCard>
  )
}
