/**
 * WRAPPER / COMPATIBILIDAD
 * Mantiene exports heredados delegando 100% en bookingEngine.js.
 * La lógica principal de reservas vive en bookingEngine.js.
 */
import * as bookingEngine from './bookingEngine.js'

export const OPEN_MINUTES = bookingEngine.OPEN_MINUTES
export const CLOSE_MINUTES = bookingEngine.CLOSE_MINUTES

export const getSimulatorBreakdown = (booking = {}) => bookingEngine.getBookingConfigFromBooking(booking)

export const getBookingConfigFromBooking = (booking = {}) => bookingEngine.getBookingConfigFromBooking(booking)

export const buildDailyTimeline = (bookings = [], operationDate = '') =>
  bookingEngine.buildDailyTimeline(bookings, operationDate)

export const buildFocusedTimeline = (timeline = [], bookingTime = '') =>
  bookingEngine.buildFocusedTimeline(timeline, bookingTime)
