import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './db.js'
import {
  buildTimeOptions,
  formatDateChile,
  normalizeText,
  normalizePhone,
  isValidTimeFormat,
  convertToMs,
  formatGap,
  getGameOrderIndex,
} from './utils/psrUtils'
// ACTIVE RANKING LAYER: App.jsx usa GeneralRankingSection como capa principal.
// Antes de tocar capas heredadas, validar primero este import y su uso real.
import GeneralRankingSection from './components/GeneralRankingSection'
import BookingsSection from './components/BookingsSection'
import ChallengeSection from './components/ChallengeSection'
import { isChallengeExpired, pickActiveChallenge } from './utils/challengeUtils'
import * as bookingEngine from './utils/bookingEngine.js'
import PointsSection from './components/PointsSection'
import LayoutHeader from './components/LayoutHeader'
import LapTimeEditorSection from './components/LapTimeEditorSection'
import PilotProfileSection from './components/PilotProfileSection'
import CommercialSection from './components/CommercialSection'
import ForumSection from './components/ForumSection'
import BookingInsightsSection from './components/BookingInsightsSection'
import MainTabsNav from './components/MainTabsNav'
import { buildBookingFollowupWhatsappLink, buildBusinessEmailLink } from './utils/whatsappHelper'
import { createBookingRecord, deleteBookingRecord, saveBookingAttempt, updateBookingRecord } from './utils/bookingPersistence.js'
import { getAdminAuthErrorMessage, getAdminEmailFromSession, resolveAdminAccess, signInAdmin, signOutAdmin } from './utils/adminAuth.js'
import {
  page,
  container,
  hero,
  title,
  subtitle,
  card,
  sectionTitle,
  line,
  formGrid,
  input,
  buttonRow,
  buttonRowSmall,
  button,
  buttonSecondary,
  miniButton,
  miniDanger,
  messageStyle,
  checkboxRow,
  tableWrap,
  table,
  th,
  td,
} from './styles/appStyles'

const TIME_OPTIONS = buildTimeOptions('10:30', '20:00', 30)


const BOOKING_OPTIONS = bookingEngine.BOOKING_OPTIONS
const getBookingOptionKeyFromBooking = bookingEngine.getBookingOptionKeyFromBooking

const validateFinalBooking = bookingEngine.validateFinalBooking
const buildBookingMutationPayload = bookingEngine.buildBookingMutationPayload
const calculateBookingTotal = bookingEngine.calculateBookingTotal
const getTodayDateString = bookingEngine.getTodayDateString
const getVisibleBookingTimeOptions = bookingEngine.getVisibleBookingTimeOptions
const getNearestBookingTimeSuggestions = bookingEngine.getNearestBookingTimeSuggestions
const getNearestBookingDateSuggestions = bookingEngine.getNearestBookingDateSuggestions
const isTimeSlotAvailable = bookingEngine.isTimeSlotAvailable
const buildBookingEditSnapshot = bookingEngine.buildBookingEditSnapshot
const isSameBookingEditSnapshot = bookingEngine.isSameBookingEditSnapshot
const applyBookingSnapshotFilters = bookingEngine.applyBookingSnapshotFilters
const getCommercialBookingPrefill = bookingEngine.getCommercialBookingPrefill

const isBookingDbCapacityError = bookingEngine.isBookingDbCapacityError
const getBookingDbCapacityMessage = bookingEngine.getBookingDbCapacityMessage

function getFriendlyBookingValidationMessage(message = '') {
  const normalized = String(message || '').trim()
  if (!normalized) return 'No se pudo validar la reserva.'

  const replacements = {
    'Debes ingresar el nombre del cliente.': 'Falta el nombre del cliente.',
    'Debes ingresar teléfono o WhatsApp.': 'Falta el WhatsApp o teléfono.',
    'Debes seleccionar una fecha.': 'Falta seleccionar la fecha.',
    'Debes seleccionar una hora.': 'Falta seleccionar la hora.',
    'No puedes crear reservas en una fecha pasada.': 'No puedes reservar una fecha pasada.',
    'No puedes reservar un horario que ya pasó.': 'Ese horario ya pasó. Elige otro.',
    'La hora seleccionada no es válida.': 'La hora seleccionada no es válida.',
    'La duración mínima es 15 minutos.': 'La duración mínima es 15 minutos.',
    'La duración debe avanzar en bloques de 15 minutos.': 'La duración debe ser en bloques de 15 minutos.',
    'La configuración de simuladores no es válida.': 'La configuración de simuladores no es válida.',
    'No puedes reservar más de 2 simuladores estándar.': 'No puedes reservar más de 2 simuladores estándar.',
    'No puedes reservar más de 1 simulador pro.': 'No puedes reservar más de 1 simulador pro.',
    'La cantidad total de simuladores no coincide con la configuración elegida.': 'La configuración elegida no coincide con la cantidad de simuladores.',
    'El tipo de reserva no coincide con la configuración elegida.': 'El tipo de configuración no coincide con la selección actual.',
    'La configuración de simuladores no coincide con la selección actual.': 'La configuración elegida no coincide con la selección actual.',
    'El total calculado no es válido.': 'No se pudo calcular el total de la reserva.',
    'El total no coincide con la configuración y duración elegidas.': 'El total no coincide con la configuración elegida.',
    'La reserva no puede comenzar antes de las 10:30.': 'La reserva debe comenzar desde las 10:30.',
    'La reserva no puede terminar después de las 20:00.': 'La reserva debe terminar antes de las 20:00.',
    'Ese horario genera conflicto con otra reserva para los simuladores elegidos.': 'Ese horario ya no está disponible para esa configuración.',
  }

  return replacements[normalized] || normalized
}

function getFriendlyBookingMutationMessage(error, fallbackMessage = 'No se pudo guardar la reserva.') {
  if (isBookingDbCapacityError(error)) return getBookingDbCapacityMessage(error)

  const raw = String(error?.message || error?.details || fallbackMessage || '').toLowerCase()

  if (raw.includes('network') || raw.includes('fetch')) {
    return 'No se pudo conectar con Supabase. Revisa internet e inténtalo otra vez.'
  }

  if (raw.includes('duplicate') || raw.includes('unique')) {
    return 'Ya existe una reserva igual o muy similar. Revisa antes de guardar otra vez.'
  }

  if (raw.includes('not-null') || raw.includes('violates not-null constraint')) {
    return 'Falta un dato obligatorio para guardar la reserva.'
  }

  return fallbackMessage
}

function buildChallengeLeaderboard(entries) {
  const safeEntries = Array.isArray(entries) ? entries : []

  const sorted = safeEntries
    .map((entry, index) => {
      const timeMs = Number(entry?.time_ms)
      if (!Number.isFinite(timeMs)) return null

      return {
        ...entry,
        id: entry?.id ?? `challenge-entry-${index}`,
        player: normalizeText(entry?.player || entry?.pilot || entry?.pilot_name || 'SIN NOMBRE'),
        time: String(entry?.time ?? '').trim() || '-',
        time_ms: timeMs,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.time_ms - b.time_ms)

  const best = sorted[0]?.time_ms ?? null

  return sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
    gap: best === null ? '-' : formatGap(entry.time_ms - best),
  }))
}

export default function App() {
  const [appMode, setAppMode] = useState('USER')
  const [viewMode, setViewMode] = useState('BOOKINGS')
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [adminEmailInput, setAdminEmailInput] = useState('')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [adminAccessError, setAdminAccessError] = useState('')
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(false)
  const [adminSessionEmail, setAdminSessionEmail] = useState('')
  const isAdmin = appMode === 'ADMIN'

  const [lapTimes, setLapTimes] = useState([])
  const [weeklyChallenge, setWeeklyChallenge] = useState(null)
  const [monthlyChallenge, setMonthlyChallenge] = useState(null)
  const [weeklyEntries, setWeeklyEntries] = useState([])
  const [monthlyEntries, setMonthlyEntries] = useState([])
  const [bookings, setBookings] = useState([])

  const [generalGame, setGeneralGame] = useState('TODOS')
  const [generalTrack, setGeneralTrack] = useState('TODOS')
  const [generalSearch, setGeneralSearch] = useState('')

  const [weeklyPlayer, setWeeklyPlayer] = useState('')
  const [weeklyTime, setWeeklyTime] = useState('')
  const [weeklyMessage, setWeeklyMessage] = useState('')
  const [editingWeeklyEntryId, setEditingWeeklyEntryId] = useState(null)

  const [monthlyPlayer, setMonthlyPlayer] = useState('')
  const [monthlyTime, setMonthlyTime] = useState('')
  const [monthlyMessage, setMonthlyMessage] = useState('')
  const [editingMonthlyEntryId, setEditingMonthlyEntryId] = useState(null)

  const [weeklyChallengeGame, setWeeklyChallengeGame] = useState('')
  const [weeklyChallengeTrack, setWeeklyChallengeTrack] = useState('')
  const [weeklyChallengeCar, setWeeklyChallengeCar] = useState('')
  const [weeklyChallengeEndAt, setWeeklyChallengeEndAt] = useState('')

  const [monthlyChallengeGame, setMonthlyChallengeGame] = useState('')
  const [monthlyChallengeTrack, setMonthlyChallengeTrack] = useState('')
  const [monthlyChallengeCar, setMonthlyChallengeCar] = useState('')
  const [monthlyChallengeEndAt, setMonthlyChallengeEndAt] = useState('')

  const [bookingClient, setBookingClient] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('10:30')
  const [bookingKind, setBookingKind] = useState('LOCAL')
  const [bookingConfig, setBookingConfig] = useState('1_ESTANDAR')
  const [bookingDuration, setBookingDuration] = useState(30)
  const [bookingWhatsappReminder, setBookingWhatsappReminder] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingSuccessSummary, setBookingSuccessSummary] = useState(null)
  const [bookingCommercialContext, setBookingCommercialContext] = useState(null)
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [editingBookingSnapshot, setEditingBookingSnapshot] = useState(null)
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)

  const [lapEditId, setLapEditId] = useState(null)
  const [lapEditPlayer, setLapEditPlayer] = useState('')
  const [lapEditCountry, setLapEditCountry] = useState('CL')
  const [lapEditGame, setLapEditGame] = useState('')
  const [lapEditTrack, setLapEditTrack] = useState('')
  const [lapEditCar, setLapEditCar] = useState('')
  const [lapEditTime, setLapEditTime] = useState('')
  const [lapEditMessage, setLapEditMessage] = useState('')

  const loadAllRef = useRef(null)
  const loadWeeklyChallengeRef = useRef(null)
  const loadMonthlyChallengeRef = useRef(null)
  const cancelEditBookingRef = useRef(null)
  const applyCommercialPrefillRef = useRef(null)
  const adminAuthSyncIdRef = useRef(0)

  loadAllRef.current = loadAll
  loadWeeklyChallengeRef.current = loadWeeklyChallenge
  loadMonthlyChallengeRef.current = loadMonthlyChallenge
  cancelEditBookingRef.current = cancelEditBooking
  applyCommercialPrefillRef.current = applyCommercialPrefill

  useEffect(() => {
    loadAllRef.current?.()
  }, [])

  useEffect(() => {
    let isMounted = true

    async function syncAdminSession(session) {
      const syncId = adminAuthSyncIdRef.current + 1
      adminAuthSyncIdRef.current = syncId

      if (!isMounted) return

      setAdminSessionEmail(getAdminEmailFromSession(session))

      if (!session) {
        setAppMode('USER')
        setAdminAccessError('')
        return
      }

      const adminAccess = await resolveAdminAccess(supabase, session)
      if (!isMounted || syncId !== adminAuthSyncIdRef.current) return

      setAdminSessionEmail(adminAccess.email || '')
      setAppMode(adminAccess.isAdmin ? 'ADMIN' : 'USER')

      if (adminAccess.error) {
        setAdminAccessError('No se pudo validar el acceso admin con Supabase Auth.')
        return
      }

      setAdminAccessError('')
    }

    async function bootstrapAdminSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!isMounted) return

      if (error) {
        setAppMode('USER')
        setAdminSessionEmail('')
        setAdminAccessError('')
        return
      }

      await syncAdminSession(data?.session ?? null)
    }

    bootstrapAdminSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAdminSession(session)
    })

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    setIsMoreOpen(false)
  }, [viewMode])

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadWeeklyChallengeRef.current?.()
      loadMonthlyChallengeRef.current?.()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isAdmin) return

    cancelEditLapTime()
    cancelEditBookingRef.current?.()
    cancelEditWeeklyEntry()
    cancelEditMonthlyEntry()
  }, [isAdmin])

  async function loadAll() {
    await Promise.all([
      loadLapTimes(),
      loadWeeklyChallenge(),
      loadMonthlyChallenge(),
      loadBookings(),
    ])
  }

  async function loadLapTimes() {
    const { data, error } = await supabase
      .from('lap_times')
      .select('*')
      .order('game', { ascending: true })
      .order('track', { ascending: true })
      .order('time_ms', { ascending: true })

    if (error) {
      console.log('lap_times error:', error)
      setLapTimes([])
      return
    }

    setLapTimes(data || [])
  }




  async function loadActiveChallenge(tableName, type, setChallenge, setEntries) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('end_at', { ascending: false })
      .limit(25)

    if (error) {
      console.log(`${type} challenge error:`, error)
      setChallenge(null)
      setEntries([])
      return
    }

    const activeChallenge = pickActiveChallenge(data, type)

    setChallenge(activeChallenge)

    if (activeChallenge) {
      await loadChallengeEntries(type, activeChallenge.id, setEntries)
    } else {
      setEntries([])
    }
  }

  async function loadWeeklyChallenge() {
    await loadActiveChallenge('weekly_challenges', 'weekly', setWeeklyChallenge, setWeeklyEntries)
  }

  async function loadMonthlyChallenge() {
    await loadActiveChallenge('monthly_challenges', 'monthly', setMonthlyChallenge, setMonthlyEntries)
  }

  async function loadChallengeEntries(type, challengeId, setter) {
    const numericChallengeId = Number(challengeId)

    if (!type || !Number.isFinite(numericChallengeId) || numericChallengeId <= 0) {
      setter([])
      return
    }

    const { data, error } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('challenge_type', type)
      .eq('challenge_id', numericChallengeId)
      .order('time_ms', { ascending: true })

    if (error) {
      console.log('challenge entries error:', error)
      setter([])
      return
    }

    setter(data || [])
  }

  async function loadBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })

    if (error) {
      console.log('bookings error:', error)
      setBookings([])
      return []
    }

    const rows = data || []
    setBookings(rows)
    return rows
  }

  async function loadBookingsByDate(dateValue) {
    if (!dateValue) return []

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', dateValue)
      .order('booking_time', { ascending: true })

    if (error) {
      console.log('bookings by date error:', error)
      return null
    }

    return data || []
  }

  const normalizedLapTimes = useMemo(() => {
    return lapTimes.map((row) => ({
      ...row,
      player: normalizeText(row.player),
      country: normalizeText(row.country),
      game: normalizeText(row.game),
      track: normalizeText(row.track),
      car: normalizeText(row.car),
    }))
  }, [lapTimes])

  const generalGames = useMemo(() => {
    const unique = [...new Set(normalizedLapTimes.map((x) => x.game).filter(Boolean))]
    return ['TODOS', ...unique.sort((a, b) => getGameOrderIndex(a) - getGameOrderIndex(b) || a.localeCompare(b))]
  }, [normalizedLapTimes])

  const generalTracks = useMemo(() => {
    const base = generalGame === 'TODOS'
      ? normalizedLapTimes
      : normalizedLapTimes.filter((x) => x.game === generalGame)

    const unique = [...new Set(base.map((x) => x.track).filter(Boolean))]
    return ['TODOS', ...unique.sort((a, b) => a.localeCompare(b))]
  }, [normalizedLapTimes, generalGame])

  const weeklyLeaderboard = useMemo(() => buildChallengeLeaderboard(weeklyEntries), [weeklyEntries])
  const monthlyLeaderboard = useMemo(() => buildChallengeLeaderboard(monthlyEntries), [monthlyEntries])

  const pointsLeaderboard = useMemo(() => {
    const scoreboard = {}

    function add(player, pts, reason) {
      const p = normalizeText(player)
      if (!p || !pts) return

      if (!scoreboard[p]) scoreboard[p] = { player: p, points: 0, details: [] }

      scoreboard[p].points += pts
      scoreboard[p].details.push(reason)
    }

    const bestByComboAndPlayer = {}

    normalizedLapTimes.forEach((row) => {
      const key = `${row.game}__${row.track}__${row.player}`
      if (!bestByComboAndPlayer[key] || row.time_ms < bestByComboAndPlayer[key].time_ms) {
        bestByComboAndPlayer[key] = row
      }
    })

    const groupedByTrack = {}

    Object.values(bestByComboAndPlayer).forEach((row) => {
      const sectionKey = `${row.game}__${row.track}`
      if (!groupedByTrack[sectionKey]) groupedByTrack[sectionKey] = []
      groupedByTrack[sectionKey].push(row)
    })

    Object.entries(groupedByTrack).forEach(([sectionKey, rows]) => {
      const [game, track] = sectionKey.split('__')
      const ordered = [...rows].sort((a, b) => a.time_ms - b.time_ms)

      ordered.forEach((row, index) => {
        if (index === 0) add(row.player, 3, `🥇 GENERAL ${game} - ${track}`)
        if (index === 1) add(row.player, 2, `🥈 GENERAL ${game} - ${track}`)
        if (index === 2) add(row.player, 1, `🥉 GENERAL ${game} - ${track}`)
      })
    })

    const weeklyPlayers = [...new Set(weeklyEntries.map((e) => normalizeText(e.player)))]
    const monthlyPlayers = [...new Set(monthlyEntries.map((e) => normalizeText(e.player)))]

    weeklyPlayers.forEach((p) => add(p, 5, 'PARTICIPACIÓN SEMANAL'))
    monthlyPlayers.forEach((p) => add(p, 5, 'PARTICIPACIÓN MENSUAL'))

    weeklyLeaderboard.forEach((e) => {
      if (e.position === 1) add(e.player, 3, '🥇 SEMANAL')
      if (e.position === 2) add(e.player, 2, '🥈 SEMANAL')
      if (e.position === 3) add(e.player, 1, '🥉 SEMANAL')
    })

    monthlyLeaderboard.forEach((e) => {
      if (e.position === 1) add(e.player, 3, '🥇 MENSUAL')
      if (e.position === 2) add(e.player, 2, '🥈 MENSUAL')
      if (e.position === 3) add(e.player, 1, '🥉 MENSUAL')
    })

    bookings.forEach((booking) => {
      add(booking.client, 7, `RESERVA ${formatDateChile(booking.booking_date)}`)
    })

    return Object.values(scoreboard)
      .sort((a, b) => b.points - a.points || a.player.localeCompare(b.player))
      .map((e, i) => ({ ...e, position: i + 1 }))
  }, [normalizedLapTimes, weeklyEntries, monthlyEntries, weeklyLeaderboard, monthlyLeaderboard, bookings])

  const groupedGeneralSections = useMemo(() => {
    const rows = normalizedLapTimes.filter((row) => {
      const matchesGame = generalGame === 'TODOS' || row.game === generalGame
      const matchesTrack = generalTrack === 'TODOS' || row.track === generalTrack
      const matchesPlayer = !generalSearch || row.player.includes(normalizeText(generalSearch))
      return matchesGame && matchesTrack && matchesPlayer
    })

    const bestByComboAndPlayer = {}

    for (const row of rows) {
      const key = `${row.game}__${row.track}__${row.player}`
      if (!bestByComboAndPlayer[key] || row.time_ms < bestByComboAndPlayer[key].time_ms) {
        bestByComboAndPlayer[key] = row
      }
    }

    const cleanRows = Object.values(bestByComboAndPlayer)
    const byGameTrack = {}

    cleanRows.forEach((row) => {
      const groupKey = `${row.game}__${row.track}`
      if (!byGameTrack[groupKey]) {
        byGameTrack[groupKey] = {
          game: row.game,
          track: row.track,
          rows: [],
        }
      }
      byGameTrack[groupKey].rows.push(row)
    })

    return Object.values(byGameTrack)
      .sort((a, b) => {
        const gameDiff = getGameOrderIndex(a.game) - getGameOrderIndex(b.game)
        if (gameDiff !== 0) return gameDiff
        return a.track.localeCompare(b.track)
      })
      .map((section) => {
        const ordered = [...section.rows].sort((a, b) => a.time_ms - b.time_ms)
        const best = ordered[0]?.time_ms || 0

        return {
          ...section,
          rows: ordered.map((row, index) => ({
            ...row,
            position: index + 1,
            gap: formatGap(row.time_ms - best),
          })),
        }
      })
  }, [normalizedLapTimes, generalGame, generalTrack, generalSearch])

  const minPublicBookingDate = useMemo(() => getTodayDateString(), [])

  const editingMatchesSnapshot = useMemo(() => {
    if (!editingBookingId || !editingBookingSnapshot) return false

    return (
      String(editingBookingSnapshot.id) === String(editingBookingId)
      && String(editingBookingSnapshot.booking_date || '') === String(bookingDate || '')
      && String(editingBookingSnapshot.booking_time || '') === String(bookingTime || '')
      && String(editingBookingSnapshot.bookingConfig || '') === String(bookingConfig || '')
      && Number(editingBookingSnapshot.bookingDuration || 0) === Number(bookingDuration || 0)
    )
  }, [editingBookingId, editingBookingSnapshot, bookingDate, bookingTime, bookingConfig, bookingDuration])

  const availableTimeOptions = useMemo(() => {
    return getVisibleBookingTimeOptions({
      timeOptions: TIME_OPTIONS,
      bookings,
      bookingDate,
      bookingConfig,
      bookingDuration,
      editingBookingId,
      isAdmin,
      preserveSlot: isAdmin && editingMatchesSnapshot ? bookingTime : '',
    })
  }, [bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId, isAdmin, editingMatchesSnapshot, bookingTime])

  const editingCurrentSelectionAvailable = useMemo(() => {
    if (!editingBookingId || !bookingDate || !bookingTime) return true

    return isTimeSlotAvailable({
      booking_date: bookingDate,
      booking_time: bookingTime,
      duration: Number(bookingDuration),
      simulator_config_id: bookingConfig,
    }, bookings, editingBookingId)
  }, [bookings, bookingDate, bookingTime, bookingConfig, bookingDuration, editingBookingId])

  const editingConflictWarning = useMemo(() => {
    if (!editingBookingId || !editingMatchesSnapshot) return ''
    if (editingCurrentSelectionAvailable) return ''

    return 'Esta reserva original ya quedó en conflicto. Elige otro horario antes de guardar.'
  }, [editingBookingId, editingMatchesSnapshot, editingCurrentSelectionAvailable])

  const bookingSuggestedTimes = useMemo(() => {
    if (!bookingDate) return []

    return getNearestBookingTimeSuggestions(availableTimeOptions, bookingTime, 3)
  }, [availableTimeOptions, bookingDate, bookingTime])

  const bookingSuggestedDates = useMemo(() => {
    if (!bookingDate || availableTimeOptions.length > 0) return []

    return getNearestBookingDateSuggestions({
      timeOptions: TIME_OPTIONS,
      bookings,
      bookingDate,
      bookingConfig,
      bookingDuration,
      editingBookingId,
      isAdmin,
      maxDays: 14,
      maxSuggestions: 4,
    })
  }, [availableTimeOptions, bookingConfig, bookingDate, bookingDuration, bookings, editingBookingId, isAdmin])

  useEffect(() => {
    if (editingMatchesSnapshot && editingBookingId && bookingTime) return

    if (!availableTimeOptions.includes(bookingTime)) {
      setBookingTime(availableTimeOptions[0] || '')
    }
  }, [availableTimeOptions, bookingTime, editingMatchesSnapshot, editingBookingId])


  async function submitChallengeTime(type) {
    if (!isAdmin) return

    if (type === 'weekly') {
      setWeeklyMessage('')
      if (!weeklyChallenge) {
        setWeeklyMessage('No hay desafío semanal activo')
        return
      }

      if (isChallengeExpired(weeklyChallenge.end_at, 'weekly')) {
        await loadWeeklyChallenge()
        setWeeklyMessage('El desafío semanal ya finalizó')
        return
      }

      const cleanPlayer = normalizeText(weeklyPlayer)
      const cleanTime = String(weeklyTime || '').trim()

      if (!cleanPlayer || !cleanTime) {
        setWeeklyMessage('Faltan datos')
        return
      }

      if (!isValidTimeFormat(cleanTime)) {
        setWeeklyMessage('Formato inválido. Usa por ejemplo: 1:28.500')
        return
      }

      const timeMs = convertToMs(cleanTime)

      if (editingWeeklyEntryId) {
        const { error } = await supabase
          .from('challenge_entries')
          .update({
            player: cleanPlayer,
            time: cleanTime,
            time_ms: timeMs,
            car: weeklyChallenge.car,
            country: 'CL',
          })
          .eq('id', editingWeeklyEntryId)

        if (error) {
          console.log('edit weekly entry error:', error)
          setWeeklyMessage('Error al editar tiempo')
          return
        }

        setWeeklyMessage('Tiempo semanal actualizado')
        setEditingWeeklyEntryId(null)
        setWeeklyPlayer('')
        setWeeklyTime('')
        await loadChallengeEntries('weekly', weeklyChallenge.id, setWeeklyEntries)
        return
      }

      const { data: existing, error: existingError } = await supabase
        .from('challenge_entries')
        .select('*')
        .eq('challenge_id', weeklyChallenge.id)
        .eq('challenge_type', 'weekly')
        .eq('player', cleanPlayer)
        .maybeSingle()

      if (existingError) {
        console.log('existing weekly error:', existingError)
        setWeeklyMessage('Error al revisar tiempo existente')
        return
      }

      if (existing) {
        if (timeMs < existing.time_ms) {
          const { error: updateError } = await supabase
            .from('challenge_entries')
            .update({
              time: cleanTime,
              time_ms: timeMs,
              car: weeklyChallenge.car,
              country: 'CL',
            })
            .eq('id', existing.id)

          if (updateError) {
            console.log('update weekly error:', updateError)
            setWeeklyMessage('Error al actualizar tiempo')
            return
          }

          setWeeklyMessage('Tiempo mejorado y reemplazado correctamente')
        } else {
          setWeeklyMessage('Tu tiempo no mejora el anterior')
          return
        }
      } else {
        const { error: insertError } = await supabase
          .from('challenge_entries')
          .insert([{
            challenge_type: 'weekly',
            challenge_id: weeklyChallenge.id,
            player: cleanPlayer,
            country: 'CL',
            time: cleanTime,
            time_ms: timeMs,
            car: weeklyChallenge.car,
          }])

        if (insertError) {
          console.log('insert weekly error:', insertError)
          setWeeklyMessage('Error al guardar tiempo')
          return
        }

        setWeeklyMessage('Tiempo registrado correctamente')
      }

      setWeeklyPlayer('')
      setWeeklyTime('')
      await loadChallengeEntries('weekly', weeklyChallenge.id, setWeeklyEntries)
      return
    }

    if (type === 'monthly') {
      setMonthlyMessage('')
      if (!monthlyChallenge) {
        setMonthlyMessage('No hay desafío mensual activo')
        return
      }

      if (isChallengeExpired(monthlyChallenge.end_at, 'monthly')) {
        await loadMonthlyChallenge()
        setMonthlyMessage('El desafío mensual ya finalizó')
        return
      }

      const cleanPlayer = normalizeText(monthlyPlayer)
      const cleanTime = String(monthlyTime || '').trim()

      if (!cleanPlayer || !cleanTime) {
        setMonthlyMessage('Faltan datos')
        return
      }

      if (!isValidTimeFormat(cleanTime)) {
        setMonthlyMessage('Formato inválido. Usa por ejemplo: 1:28.500')
        return
      }

      const timeMs = convertToMs(cleanTime)

      if (editingMonthlyEntryId) {
        const { error } = await supabase
          .from('challenge_entries')
          .update({
            player: cleanPlayer,
            time: cleanTime,
            time_ms: timeMs,
            car: monthlyChallenge.car,
            country: 'CL',
          })
          .eq('id', editingMonthlyEntryId)

        if (error) {
          console.log('edit monthly entry error:', error)
          setMonthlyMessage('Error al editar tiempo')
          return
        }

        setMonthlyMessage('Tiempo mensual actualizado')
        setEditingMonthlyEntryId(null)
        setMonthlyPlayer('')
        setMonthlyTime('')
        await loadChallengeEntries('monthly', monthlyChallenge.id, setMonthlyEntries)
        return
      }

      const { data: existing, error: existingError } = await supabase
        .from('challenge_entries')
        .select('*')
        .eq('challenge_id', monthlyChallenge.id)
        .eq('challenge_type', 'monthly')
        .eq('player', cleanPlayer)
        .maybeSingle()

      if (existingError) {
        console.log('existing monthly error:', existingError)
        setMonthlyMessage('Error al revisar tiempo existente')
        return
      }

      if (existing) {
        if (timeMs < existing.time_ms) {
          const { error: updateError } = await supabase
            .from('challenge_entries')
            .update({
              time: cleanTime,
              time_ms: timeMs,
              car: monthlyChallenge.car,
              country: 'CL',
            })
            .eq('id', existing.id)

          if (updateError) {
            console.log('update monthly error:', updateError)
            setMonthlyMessage('Error al actualizar tiempo')
            return
          }

          setMonthlyMessage('Tiempo mejorado y reemplazado correctamente')
        } else {
          setMonthlyMessage('Tu tiempo no mejora el anterior')
          return
        }
      } else {
        const { error: insertError } = await supabase
          .from('challenge_entries')
          .insert([{
            challenge_type: 'monthly',
            challenge_id: monthlyChallenge.id,
            player: cleanPlayer,
            country: 'CL',
            time: cleanTime,
            time_ms: timeMs,
            car: monthlyChallenge.car,
          }])

        if (insertError) {
          console.log('insert monthly error:', insertError)
          setMonthlyMessage('Error al guardar tiempo')
          return
        }

        setMonthlyMessage('Tiempo registrado correctamente')
      }

      setMonthlyPlayer('')
      setMonthlyTime('')
      await loadChallengeEntries('monthly', monthlyChallenge.id, setMonthlyEntries)
    }
  }


  function resetChallengeCreator(type) {
    if (type === 'weekly') {
      setWeeklyChallengeGame('')
      setWeeklyChallengeTrack('')
      setWeeklyChallengeCar('')
      setWeeklyChallengeEndAt('')
      return
    }

    setMonthlyChallengeGame('')
    setMonthlyChallengeTrack('')
    setMonthlyChallengeCar('')
    setMonthlyChallengeEndAt('')
  }

  async function createChallenge(type) {
    if (!isAdmin) return

    const isWeekly = type === 'weekly'
    const activeChallenge = isWeekly ? weeklyChallenge : monthlyChallenge
    const game = normalizeText(isWeekly ? weeklyChallengeGame : monthlyChallengeGame)
    const track = normalizeText(isWeekly ? weeklyChallengeTrack : monthlyChallengeTrack)
    const car = normalizeText(isWeekly ? weeklyChallengeCar : monthlyChallengeCar)
    const endAtRaw = isWeekly ? weeklyChallengeEndAt : monthlyChallengeEndAt
    const setMessage = isWeekly ? setWeeklyMessage : setMonthlyMessage
    const tableName = isWeekly ? 'weekly_challenges' : 'monthly_challenges'

    setMessage('')

    if (activeChallenge) {
      setMessage(`Ya existe un desafío ${isWeekly ? 'semanal' : 'mensual'} activo`)
      return
    }

    if (!game || !track || !car || !endAtRaw) {
      setMessage('Faltan datos para crear el desafío')
      return
    }

    const endAtDate = new Date(endAtRaw)
    if (Number.isNaN(endAtDate.getTime())) {
      setMessage('Fecha de cierre inválida')
      return
    }

    if (endAtDate.getTime() <= Date.now()) {
      setMessage('La fecha de cierre debe ser futura')
      return
    }

    const payload = {
      game,
      track,
      car,
      end_at: endAtDate.toISOString(),
    }

    const { error } = await supabase.from(tableName).insert([payload])

    if (error) {
      console.log(`create ${type} challenge error:`, error)
      setMessage('Error al crear desafío')
      return
    }

    resetChallengeCreator(type)
    setMessage(`Desafío ${isWeekly ? 'semanal' : 'mensual'} creado correctamente`)

    if (isWeekly) {
      await loadWeeklyChallenge()
      return
    }

    await loadMonthlyChallenge()
  }

  async function deleteActiveChallenge(type) {
    if (!isAdmin) return

    const challenge = type === 'weekly' ? weeklyChallenge : monthlyChallenge
    if (!challenge) return

    const ok = window.confirm(`¿Eliminar este desafío ${type === 'weekly' ? 'semanal' : 'mensual'} y todos sus tiempos?`)
    if (!ok) return

    const { error: entriesError } = await supabase
      .from('challenge_entries')
      .delete()
      .eq('challenge_type', type)
      .eq('challenge_id', challenge.id)

    if (entriesError) {
      console.log(`delete ${type} entries error:`, entriesError)
      if (type === 'weekly') setWeeklyMessage('Error al eliminar tiempos del desafío')
      if (type === 'monthly') setMonthlyMessage('Error al eliminar tiempos del desafío')
      return
    }

    const tableName = type === 'weekly' ? 'weekly_challenges' : 'monthly_challenges'
    const { error: challengeError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', challenge.id)

    if (challengeError) {
      console.log(`delete ${type} challenge error:`, challengeError)
      if (type === 'weekly') setWeeklyMessage('Error al eliminar desafío')
      if (type === 'monthly') setMonthlyMessage('Error al eliminar desafío')
      return
    }

    if (type === 'weekly') {
      cancelEditWeeklyEntry()
      setWeeklyChallenge(null)
      setWeeklyEntries([])
      setWeeklyMessage('Desafío semanal eliminado')
      return
    }

    cancelEditMonthlyEntry()
    setMonthlyChallenge(null)
    setMonthlyEntries([])
    setMonthlyMessage('Desafío mensual eliminado')
  }

  function startEditWeeklyEntry(entry) {
    if (!isAdmin) return
    setEditingWeeklyEntryId(entry.id)
    setWeeklyPlayer(normalizeText(entry.player))
    setWeeklyTime(entry.time)
    setWeeklyMessage('Editando tiempo semanal')
  }

  function cancelEditWeeklyEntry() {
    setEditingWeeklyEntryId(null)
    setWeeklyPlayer('')
    setWeeklyTime('')
    setWeeklyMessage('')
  }

  async function deleteWeeklyEntry(id) {
    if (!isAdmin) return
    const ok = window.confirm('¿Eliminar este tiempo semanal?')
    if (!ok || !weeklyChallenge) return

    const { error } = await supabase.from('challenge_entries').delete().eq('id', id)

    if (error) {
      console.log('delete weekly entry error:', error)
      setWeeklyMessage('Error al eliminar tiempo')
      return
    }

    if (editingWeeklyEntryId === id) cancelEditWeeklyEntry()
    setWeeklyMessage('Tiempo semanal eliminado')
    await loadChallengeEntries('weekly', weeklyChallenge.id, setWeeklyEntries)
  }

  function startEditMonthlyEntry(entry) {
    if (!isAdmin) return
    setEditingMonthlyEntryId(entry.id)
    setMonthlyPlayer(normalizeText(entry.player))
    setMonthlyTime(entry.time)
    setMonthlyMessage('Editando tiempo mensual')
  }

  function cancelEditMonthlyEntry() {
    setEditingMonthlyEntryId(null)
    setMonthlyPlayer('')
    setMonthlyTime('')
    setMonthlyMessage('')
  }

  async function deleteMonthlyEntry(id) {
    if (!isAdmin) return
    const ok = window.confirm('¿Eliminar este tiempo mensual?')
    if (!ok || !monthlyChallenge) return

    const { error } = await supabase.from('challenge_entries').delete().eq('id', id)

    if (error) {
      console.log('delete monthly entry error:', error)
      setMonthlyMessage('Error al eliminar tiempo')
      return
    }

    if (editingMonthlyEntryId === id) cancelEditMonthlyEntry()
    setMonthlyMessage('Tiempo mensual eliminado')
    await loadChallengeEntries('monthly', monthlyChallenge.id, setMonthlyEntries)
  }

  function startEditLapTime(entry) {
    if (!isAdmin) return
    setLapEditId(entry.id)
    setLapEditPlayer(normalizeText(entry.player))
    setLapEditCountry(normalizeText(entry.country || 'CL'))
    setLapEditGame(normalizeText(entry.game))
    setLapEditTrack(normalizeText(entry.track))
    setLapEditCar(normalizeText(entry.car))
    setLapEditTime(entry.time)
    setLapEditMessage('Editando tiempo general')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditLapTime() {
    setLapEditId(null)
    setLapEditPlayer('')
    setLapEditCountry('CL')
    setLapEditGame('')
    setLapEditTrack('')
    setLapEditCar('')
    setLapEditTime('')
    setLapEditMessage('')
  }

  async function createOrUpdateLapTime() {
    if (!isAdmin) return

    setLapEditMessage('')

    if (!lapEditPlayer || !lapEditGame || !lapEditTrack || !lapEditCar || !lapEditTime) {
      setLapEditMessage(lapEditId ? 'Faltan datos para editar' : 'Faltan datos para crear')
      return
    }

    if (!isValidTimeFormat(lapEditTime)) {
      setLapEditMessage('Formato inválido. Usa por ejemplo: 1:28.500')
      return
    }

    const payload = {
      player: normalizeText(lapEditPlayer),
      country: normalizeText(lapEditCountry || 'CL'),
      game: normalizeText(lapEditGame),
      track: normalizeText(lapEditTrack),
      car: normalizeText(lapEditCar),
      time: lapEditTime.trim(),
      time_ms: convertToMs(lapEditTime),
    }

    if (lapEditId) {
      const { error } = await supabase
        .from('lap_times')
        .update(payload)
        .eq('id', lapEditId)

      if (error) {
        console.log('save lap edit error:', error)
        setLapEditMessage('Error al actualizar tiempo')
        return
      }

      setLapEditMessage('Tiempo actualizado correctamente')
    } else {
      const { error } = await supabase.from('lap_times').insert([payload])

      if (error) {
        console.log('create lap time error:', error)
        setLapEditMessage('Error al crear tiempo')
        return
      }

      setLapEditMessage('Tiempo creado correctamente')
    }

    await loadLapTimes()

    if (lapEditId) {
      cancelEditLapTime()
    } else {
      setLapEditPlayer('')
      setLapEditCountry('CL')
      setLapEditGame('')
      setLapEditTrack('')
      setLapEditCar('')
      setLapEditTime('')
    }
  }

  async function deleteLapTime(id) {
    if (!isAdmin) return
    const ok = window.confirm('¿Eliminar este tiempo general?')
    if (!ok) return

    const { error } = await supabase.from('lap_times').delete().eq('id', id)

    if (error) {
      console.log('delete lap time error:', error)
      setLapEditMessage('Error al eliminar tiempo')
      return
    }

    if (lapEditId === id) cancelEditLapTime()
    await loadLapTimes()
  }


  function syncBookingsForDate(dateValue, rows = []) {
    const targetDate = String(dateValue || '')
    if (!targetDate) return

    setBookings((current) => {
      const withoutDate = current.filter((item) => String(item?.booking_date || '') !== targetDate)
      return [...withoutDate, ...(rows || [])]
    })
  }

  function applyBookingToForm(booking) {
    const configKey = getBookingOptionKeyFromBooking(booking)

    setEditingBookingId(booking.id)
    setEditingBookingSnapshot(buildBookingEditSnapshot(booking))
    setBookingClient(normalizeText(booking.client))
    setBookingPhone(normalizePhone(booking.phone))
    setBookingDate(booking.booking_date)
    setBookingTime(String(booking.booking_time).slice(0, 5))
    setBookingKind(booking.reservation_kind || 'LOCAL')
    setBookingConfig(configKey)
    setBookingDuration(Number(booking.duration))
    setBookingWhatsappReminder(Boolean(booking.whatsapp_reminder))
    clearBookingSuccessSummary()
    clearBookingCommercialContext()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function startEditBooking(booking) {
    if (!isAdmin) return
    if (!booking?.id || isBookingSubmitting) return

    setIsBookingSubmitting(true)
    setBookingMessage('Validando reserva para edición...')

    try {
      const { data: latestBooking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking.id)
        .maybeSingle()

      if (error) {
        console.log('start edit booking error:', error)
        setBookingMessage('No se pudo abrir la reserva para edición.')
        return
      }

      if (!latestBooking) {
        if (editingBookingId === booking.id) cancelEditBooking()
        clearBookingSuccessSummary()
        clearBookingCommercialContext()
        await loadBookings()
        setBookingMessage('La reserva ya no existe o fue eliminada.')
        return
      }

      const liveBookings = await loadBookingsByDate(latestBooking.booking_date)
      if (liveBookings !== null) {
        syncBookingsForDate(latestBooking.booking_date, liveBookings)
      }

      applyBookingToForm(latestBooking)

      if (liveBookings === null) {
        setBookingMessage('Reserva cargada, pero no se pudo validar en tiempo real.')
        return
      }

      const liveValidation = validateFinalBooking(latestBooking, liveBookings, latestBooking.id, { allowPast: true })

      if (!liveValidation.valid) {
        setBookingMessage(
          liveValidation.conflicts.length > 0
            ? 'Esta reserva quedó en conflicto con otra. Corrígela antes de guardar.'
            : getFriendlyBookingValidationMessage(liveValidation.errors[0] || 'Reserva cargada con observaciones. Revísala antes de guardar.')
        )
        return
      }

      setBookingMessage('Editando reserva')
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  function clearBookingSuccessSummary() {
    setBookingSuccessSummary(null)
  }

  function clearBookingCommercialContext() {
    setBookingCommercialContext(null)
  }

  function resetBookingForm() {
    setEditingBookingId(null)
    setEditingBookingSnapshot(null)
    setBookingClient('')
    setBookingPhone('')
    setBookingDate('')
    setBookingTime('10:30')
    setBookingKind('LOCAL')
    setBookingConfig('1_ESTANDAR')
    setBookingDuration(30)
    setBookingWhatsappReminder(false)
  }

  function cancelEditBooking() {
    resetBookingForm()
    clearBookingCommercialContext()
    clearBookingSuccessSummary()
    setBookingMessage('')
  }

  async function createOrUpdateBooking() {
    if (!isAdmin && editingBookingId) return
    if (isBookingSubmitting) return

    const currentAttemptBase = {
      booking_date: bookingDate,
      booking_time: bookingTime,
      reservation_kind: bookingKind,
      simulator_config_id: bookingConfig,
      duration: Number(bookingDuration),
      total: Number(totalBooking || 0),
      source: editingBookingId ? 'admin_update' : (isAdmin ? 'admin_create' : 'public_create'),
    }

    setBookingMessage(editingBookingId ? 'Guardando cambios...' : 'Guardando reserva...')
    setIsBookingSubmitting(true)

    try {
      const draftPayload = buildBookingMutationPayload({
        client: normalizeText(bookingClient),
        phone: normalizePhone(bookingPhone),
        whatsapp_reminder: bookingWhatsappReminder,
        booking_date: bookingDate,
        booking_time: bookingTime,
        reservation_kind: bookingKind,
        duration: Number(bookingDuration),
        simulator_config_id: bookingConfig,
      })
      const selectedConfig = BOOKING_OPTIONS[draftPayload.simulator_config_id] || BOOKING_OPTIONS[bookingConfig]

      const localValidation = validateFinalBooking(draftPayload, bookings, editingBookingId, { allowPast: isAdmin })

      if (!localValidation.valid) {
        if (localValidation.conflicts.length > 0) {
          await saveBookingAttempt({
            supabase,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'local_conflict',
            metadata: { scope: 'local', conflicts: localValidation.conflicts.length },
          })
          setBookingMessage('Ese horario ya no está disponible para la configuración elegida.')
          return
        }

        if (
          !draftPayload.client
          || !draftPayload.phone
          || !draftPayload.booking_date
          || !draftPayload.booking_time
        ) {
          await saveBookingAttempt({
            supabase,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'incomplete_required_fields',
          })
          setBookingMessage('Completa nombre, WhatsApp, fecha y hora antes de reservar.')
          return
        }

        await saveBookingAttempt({
          supabase,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: 'validation_error',
          metadata: { first_error: localValidation.errors[0] || '' },
        })
        setBookingMessage(getFriendlyBookingValidationMessage(localValidation.errors[0]))
        return
      }

      const freshBookings = await loadBookingsByDate(draftPayload.booking_date)

      if (freshBookings === null) {
        await saveBookingAttempt({
          supabase,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: 'live_validation_unavailable',
        })
        setBookingMessage('No se pudo validar la disponibilidad en tiempo real')
        return
      }

      const liveValidation = validateFinalBooking(draftPayload, freshBookings, editingBookingId, { allowPast: isAdmin })

      if (!liveValidation.valid) {
        syncBookingsForDate(draftPayload.booking_date, freshBookings)
        await saveBookingAttempt({
          supabase,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: liveValidation.conflicts.length > 0 ? 'live_conflict' : 'live_validation_error',
          metadata: { first_error: liveValidation.errors[0] || '', conflicts: liveValidation.conflicts.length },
        })
        setBookingMessage(
          liveValidation.conflicts.length > 0
            ? 'Ese horario acaba de ocuparse. Elige otro horario.'
            : getFriendlyBookingValidationMessage(liveValidation.errors[0] || 'No se pudo validar la reserva en tiempo real')
        )
        return
      }

      const payload = {
        client: draftPayload.client,
        phone: draftPayload.phone,
        whatsapp_reminder: draftPayload.whatsapp_reminder,
        booking_date: draftPayload.booking_date,
        booking_time: draftPayload.booking_time,
        reservation_kind: draftPayload.reservation_kind,
        simulators: draftPayload.simulators,
        booking_type: draftPayload.booking_type,
        duration: draftPayload.duration,
        total: draftPayload.total,
        standard_simulators: draftPayload.standard_simulators,
        pro_simulators: draftPayload.pro_simulators,
      }

      if (editingBookingId) {
        const previousBooking = bookings.find((item) => String(item?.id) === String(editingBookingId))
        const currentEditSnapshot = editingBookingSnapshot

        const updateResult = await updateBookingRecord({
          supabase,
          bookingId: editingBookingId,
          payload,
          draftPayload,
          previousBooking,
          currentEditSnapshot,
          isSameBookingEditSnapshot,
          validateFinalBooking,
          loadBookingsByDate,
          syncBookingsForDate,
          loadBookings,
          isAdmin,
        })

        if (updateResult.status === 'missing') {
          cancelEditBooking()
          await loadBookings()
          await saveBookingAttempt({
            supabase,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'update_missing_before_save',
          })
          setBookingMessage('La reserva fue eliminada por otro admin antes de guardar.')
          return
        }

        if (updateResult.status === 'stale') {
          applyBookingToForm(updateResult.latestBooking)
          await saveBookingAttempt({
            supabase,
            booking_id: updateResult.latestBooking?.id ?? editingBookingId,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'abandoned',
            reason: 'stale_edit_snapshot',
          })
          setBookingMessage('La reserva cambió mientras la editabas. Se cargó la versión más reciente.')
          return
        }

        if (updateResult.status === 'rpc_unavailable') {
          await saveBookingAttempt({
            supabase,
            booking_id: editingBookingId,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'rpc_unavailable',
            reason_detail: 'La RPC segura de actualización no está disponible.',
          })
          setBookingMessage('No se pudo actualizar porque la validación segura del servidor no está disponible.')
          return
        }

        if (updateResult.status === 'revalidation_unavailable') {
          await saveBookingAttempt({
            supabase,
            booking_id: updateResult.updatedBooking?.id ?? editingBookingId,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'update_revalidation_unavailable',
          })
          setBookingMessage('La reserva se actualizó, pero no se pudo revalidar el horario')
          return
        }

        if (updateResult.status === 'rollback_failed') {
          applyBookingToForm(updateResult.updatedBooking || previousBooking)
          await saveBookingAttempt({
            supabase,
            booking_id: editingBookingId,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'update_rollback_failed',
            reason_detail: 'La edición quedó inconsistente y no se pudo restaurar por RPC segura.',
          })
          setBookingMessage('La reserva quedó en un estado que requiere revisión manual. Se recargó la última versión disponible.')
          return
        }

        if (updateResult.status === 'live_conflict') {
          await saveBookingAttempt({
            supabase,
            booking_id: editingBookingId,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'update_live_conflict',
          })
          setBookingMessage('Ese horario acaba de ocuparse. No se aplicó el cambio.')
          return
        }

        if (updateResult.status === 'error') {
          await saveBookingAttempt({
            supabase,
            booking_id: editingBookingId,
            ...currentAttemptBase,
            ...draftPayload,
            attempt_status: 'failed',
            reason: 'update_error',
            metadata: { phase: updateResult.phase || 'update' },
          })
          console.log('update booking error:', updateResult.error)
          setBookingMessage(getFriendlyBookingMutationMessage(updateResult.error, 'No se pudo actualizar la reserva.'))
          return
        }

        await loadBookings()
        await saveBookingAttempt({
          supabase,
          booking_id: updateResult.updatedBooking?.id ?? editingBookingId,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'confirmed',
          reason: 'updated',
        })
        cancelEditBooking()
        setBookingMessage('Reserva actualizada correctamente')
        return
      }

      const createResult = await createBookingRecord({
        supabase,
        payload,
        draftPayload,
        isAdmin,
        validateFinalBooking,
        loadBookingsByDate,
        syncBookingsForDate,
      })

      if (createResult.status === 'rpc_unavailable') {
        await saveBookingAttempt({
          supabase,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: 'rpc_unavailable',
          reason_detail: 'La RPC segura de creación no está disponible.',
        })
        setBookingMessage('No se pudo crear porque la validación segura del servidor no está disponible.')
        return
      }

      if (createResult.status === 'revalidation_unavailable') {
        await saveBookingAttempt({
          supabase,
          booking_id: createResult.createdBookingId,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: 'create_revalidation_unavailable',
        })
        setBookingMessage('La reserva se guardó, pero no se pudo revalidar el horario')
        await loadBookings()
        return
      }

      if (createResult.status === 'live_conflict') {
        await saveBookingAttempt({
          supabase,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: 'create_live_conflict',
        })
        setBookingMessage('Ese horario acaba de ocuparse. No se alcanzó a guardar la reserva.')
        return
      }

      if (createResult.status === 'error') {
        await saveBookingAttempt({
          supabase,
          ...currentAttemptBase,
          ...draftPayload,
          attempt_status: 'failed',
          reason: 'create_error',
        })
        console.log('create booking error:', createResult.error)
        setBookingMessage(getFriendlyBookingMutationMessage(createResult.error, 'No se pudo guardar la reserva.'))
        return
      }

      await loadBookings()
      const bookingSummary = {
        client: draftPayload.client,
        phone: draftPayload.phone,
        date: formatDateChile(draftPayload.booking_date),
        time: draftPayload.booking_time,
        kind: draftPayload.reservation_kind,
        configLabel: selectedConfig?.label || '',
        duration: draftPayload.duration,
        total: draftPayload.total,
        whatsappReminder: Boolean(draftPayload.whatsapp_reminder),
      }
      setBookingSuccessSummary({
        ...bookingSummary,
        contactLink: draftPayload.reservation_kind === 'EMPRESA' || draftPayload.reservation_kind === 'EVENTO'
          ? buildBusinessEmailLink(bookingSummary)
          : buildBookingFollowupWhatsappLink(bookingSummary),
      })
      setBookingCommercialContext({
        source: 'booking_created',
        kind: draftPayload.reservation_kind,
        configLabel: selectedConfig?.label || '',
      })
      await saveBookingAttempt({
        supabase,
        booking_id: createResult.createdBooking?.id ?? null,
        ...currentAttemptBase,
        ...draftPayload,
        attempt_status: 'confirmed',
        reason: 'created',
      })
      resetBookingForm()
      setBookingMessage('Reserva creada correctamente')
    } catch (error) {
      console.log('booking submit unexpected error:', error)
      await saveBookingAttempt({
        supabase,
        ...currentAttemptBase,
        attempt_status: 'failed',
        reason: editingBookingId ? 'unexpected_update_error' : 'unexpected_create_error',
      })
      setBookingMessage(getFriendlyBookingMutationMessage(error, 'Ocurrió un error inesperado al guardar la reserva.'))
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  async function deleteBooking(id) {
    if (!isAdmin) return
    if (isBookingSubmitting) return

    const targetBooking = bookings.find((item) => String(item?.id) === String(id)) || null
    const ok = window.confirm('¿Eliminar esta reserva?')

    if (!ok) {
      if (targetBooking) {
        await saveBookingAttempt({
          supabase,
          booking_id: targetBooking.id,
          client: targetBooking.client,
          phone: targetBooking.phone,
          booking_date: targetBooking.booking_date,
          booking_time: targetBooking.booking_time,
          reservation_kind: targetBooking.reservation_kind,
          simulator_config_id: targetBooking.simulator_config_id || getBookingOptionKeyFromBooking(targetBooking),
          simulators: targetBooking.simulators,
          standard_simulators: targetBooking.standard_simulators,
          pro_simulators: targetBooking.pro_simulators,
          booking_type: targetBooking.booking_type,
          duration: targetBooking.duration,
          total: targetBooking.total,
          attempt_status: 'abandoned',
          reason: 'delete_cancelled',
          source: 'admin_delete',
        })
      }
      return
    }

    setIsBookingSubmitting(true)
    try {
      const deleteResult = await deleteBookingRecord({
        supabase,
        bookingId: id,
        editingBookingId,
        currentEditSnapshot: editingBookingId === id ? editingBookingSnapshot : null,
        applyBookingSnapshotFilters,
        isSameBookingEditSnapshot,
        loadBookings,
        syncBookingsForDate,
        saveAttempt: async (payload) => saveBookingAttempt({ supabase, ...payload }),
      })

      if (deleteResult.status === 'missing') {
        if (editingBookingId === id) cancelEditBooking()
        clearBookingSuccessSummary()
        clearBookingCommercialContext()
        await loadBookings()
        setBookingMessage('La reserva ya había sido eliminada.')
        return
      }

      if (deleteResult.status === 'missing_after_snapshot') {
        const latestBooking = deleteResult.latestBooking || targetBooking
        if (latestBooking) {
          await saveBookingAttempt({
            supabase,
            booking_id: latestBooking.id,
            client: latestBooking.client,
            phone: latestBooking.phone,
            booking_date: latestBooking.booking_date,
            booking_time: latestBooking.booking_time,
            reservation_kind: latestBooking.reservation_kind,
            simulator_config_id: latestBooking.simulator_config_id || getBookingOptionKeyFromBooking(latestBooking),
            simulators: latestBooking.simulators,
            standard_simulators: latestBooking.standard_simulators,
            pro_simulators: latestBooking.pro_simulators,
            booking_type: latestBooking.booking_type,
            duration: latestBooking.duration,
            total: latestBooking.total,
            attempt_status: 'abandoned',
            reason: 'delete_missing_after_snapshot',
            source: 'admin_delete',
          })
        }
        if (editingBookingId === id) cancelEditBooking()
        clearBookingSuccessSummary()
        clearBookingCommercialContext()
        setBookingMessage('La reserva ya había sido eliminada.')
        return
      }

      if (deleteResult.status === 'stale') {
        if (deleteResult.latestBooking) applyBookingToForm(deleteResult.latestBooking)
        setBookingMessage('La reserva cambió justo antes de eliminarla. Revísala otra vez.')
        return
      }

      if (deleteResult.status === 'error') {
        const latestBooking = targetBooking || {}
        await saveBookingAttempt({
          supabase,
          booking_id: id,
          client: latestBooking.client || '',
          phone: latestBooking.phone || '',
          booking_date: latestBooking.booking_date || '',
          booking_time: latestBooking.booking_time || '',
          reservation_kind: latestBooking.reservation_kind || bookingKind,
          simulator_config_id: latestBooking.simulator_config_id || getBookingOptionKeyFromBooking(latestBooking),
          simulators: latestBooking.simulators || 0,
          standard_simulators: latestBooking.standard_simulators || 0,
          pro_simulators: latestBooking.pro_simulators || 0,
          booking_type: latestBooking.booking_type || '',
          duration: latestBooking.duration || 0,
          total: latestBooking.total || 0,
          attempt_status: 'failed',
          reason: deleteResult.phase === 'precheck' ? 'delete_precheck_error' : 'delete_error',
          reason_detail: 'No se pudo eliminar la reserva.',
          source: 'admin_delete',
        })
        console.log('delete booking error:', deleteResult.error)
        setBookingMessage('Error al eliminar reserva')
        return
      }

      const deletedBooking = deleteResult.deletedBooking
      await saveBookingAttempt({
        supabase,
        booking_id: deletedBooking?.id ?? id,
        client: deletedBooking?.client || targetBooking?.client || '',
        phone: deletedBooking?.phone || targetBooking?.phone || '',
        booking_date: deletedBooking?.booking_date || targetBooking?.booking_date || '',
        booking_time: deletedBooking?.booking_time || targetBooking?.booking_time || '',
        reservation_kind: deletedBooking?.reservation_kind || targetBooking?.reservation_kind || '',
        simulator_config_id: deletedBooking?.simulator_config_id || targetBooking?.simulator_config_id || getBookingOptionKeyFromBooking(deletedBooking || targetBooking || {}),
        simulators: deletedBooking?.simulators ?? targetBooking?.simulators ?? 0,
        standard_simulators: deletedBooking?.standard_simulators ?? targetBooking?.standard_simulators ?? 0,
        pro_simulators: deletedBooking?.pro_simulators ?? targetBooking?.pro_simulators ?? 0,
        booking_type: deletedBooking?.booking_type || targetBooking?.booking_type || '',
        duration: deletedBooking?.duration ?? targetBooking?.duration ?? 0,
        total: deletedBooking?.total ?? targetBooking?.total ?? 0,
        attempt_status: 'confirmed',
        reason: 'deleted',
        source: 'admin_delete',
      })

      if (editingBookingId === id) cancelEditBooking()
      clearBookingSuccessSummary()
      clearBookingCommercialContext()
      setBookingMessage('Reserva eliminada correctamente')
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  const totalBooking = useMemo(() => {
    return calculateBookingTotal(bookingConfig, bookingDuration)
  }, [bookingConfig, bookingDuration])

  function applyCommercialPrefill(prefill = {}) {
    const segment = prefill?.segment || 'aprender'
    const resolvedPrefill = getCommercialBookingPrefill(segment)

    clearBookingSuccessSummary()
    setBookingCommercialContext({
      source: 'commercial_prefill',
      segment,
      sourceLabel: resolvedPrefill.sourceLabel || prefill?.sourceLabel || segment,
    })

    setBookingKind(resolvedPrefill.bookingKind)
    setBookingConfig(resolvedPrefill.bookingConfig)
    setBookingDuration(resolvedPrefill.bookingDuration)
    setBookingMessage(resolvedPrefill.message || 'Reserva preconfigurada desde sección comercial')
  }

  useEffect(() => {
    const handler = (event) => {
      setViewMode('BOOKINGS')
      applyCommercialPrefillRef.current?.(event?.detail || {})
    }

    window.addEventListener('psr-commercial-booking-prefill', handler)
    return () => window.removeEventListener('psr-commercial-booking-prefill', handler)
  }, [])

  function navigateToView(nextView) {
    setIsMoreOpen(false)

    if (nextView !== 'ADMIN') {
      setAdminAccessError('')
      setAdminEmailInput('')
      setAdminPasswordInput('')
    }

    setViewMode(nextView)
  }

  function openAdminAccess() {
    setAdminAccessError('')
    setAdminEmailInput('')
    setAdminPasswordInput('')
    navigateToView('ADMIN')
  }

  async function handleAdminAccess() {
    const email = String(adminEmailInput || '').trim().toLowerCase()
    const password = String(adminPasswordInput || '')

    if (!email) {
      setAdminAccessError('Falta el correo admin.')
      return
    }

    if (!password) {
      setAdminAccessError('Falta la contraseña admin.')
      return
    }

    setIsAdminAuthLoading(true)
    setAdminAccessError('')

    const { data, error } = await signInAdmin(supabase, email, password)

    if (error) {
      setIsAdminAuthLoading(false)
      setAdminAccessError(getAdminAuthErrorMessage(error))
      return
    }

    const adminAccess = await resolveAdminAccess(supabase, data?.session ?? null)

    if (adminAccess.error) {
      await signOutAdmin(supabase)
      setIsAdminAuthLoading(false)
      setAdminAccessError('Se inició sesión, pero no se pudo validar el rol admin.')
      return
    }

    if (!adminAccess.isAdmin) {
      await signOutAdmin(supabase)
      setIsAdminAuthLoading(false)
      setAdminAccessError('Ese usuario no tiene permisos de administrador.')
      return
    }

    clearBookingSuccessSummary()
    clearBookingCommercialContext()
    setAdminSessionEmail(adminAccess.email || '')
    setAppMode('ADMIN')
    setAdminAccessError('')
    setAdminEmailInput('')
    setAdminPasswordInput('')
    setIsAdminAuthLoading(false)
    navigateToView('BOOKINGS')
  }

  async function exitAdminMode() {
    clearBookingSuccessSummary()
    clearBookingCommercialContext()
    setAdminAccessError('')
    setAdminEmailInput('')
    setAdminPasswordInput('')
    setAdminSessionEmail('')
    setIsAdminAuthLoading(true)
    await supabase.auth.signOut()
    setAppMode('USER')
    setIsAdminAuthLoading(false)
    navigateToView('BOOKINGS')
  }

  return (
    <div style={{ ...page, paddingBottom: 148 }}>
      <div style={container}>
        <LayoutHeader
          appMode={appMode}
          hero={hero}
          title={title}
          subtitle={subtitle}
          onAdminBadgeClick={isAdmin ? exitAdminMode : undefined}
        />

        {viewMode === 'GENERAL' && (
          <>
            <LapTimeEditorSection
              isAdmin={isAdmin}
              lapEditId={lapEditId}
              lapEditPlayer={lapEditPlayer}
              setLapEditPlayer={setLapEditPlayer}
              lapEditCountry={lapEditCountry}
              setLapEditCountry={setLapEditCountry}
              lapEditGame={lapEditGame}
              setLapEditGame={setLapEditGame}
              lapEditTrack={lapEditTrack}
              setLapEditTrack={setLapEditTrack}
              lapEditCar={lapEditCar}
              setLapEditCar={setLapEditCar}
              lapEditTime={lapEditTime}
              setLapEditTime={setLapEditTime}
              lapEditMessage={lapEditMessage}
              createOrUpdateLapTime={createOrUpdateLapTime}
              isEditingLapTime={Boolean(lapEditId)}
              cancelEditLapTime={cancelEditLapTime}
              normalizeText={normalizeText}
              card={card}
              sectionTitle={sectionTitle}
              formGrid={formGrid}
              input={input}
              buttonRow={buttonRow}
              button={button}
              buttonSecondary={buttonSecondary}
              messageStyle={messageStyle}
            />

            <GeneralRankingSection
              groupedRanking={groupedGeneralSections.map((section) => ({ ...section, entries: section.rows }))}
              selectedGame={generalGame}
              setSelectedGame={setGeneralGame}
              selectedTrack={generalTrack}
              setSelectedTrack={setGeneralTrack}
              selectedPilot={generalSearch}
              setSelectedPilot={setGeneralSearch}
              generalGames={generalGames}
              generalTracks={generalTracks}
              isAdmin={isAdmin}
              startEditLapTime={startEditLapTime}
              deleteLapTime={deleteLapTime}
              card={card}
              sectionTitle={sectionTitle}
              formGrid={formGrid}
              input={input}
              line={line}
              tableWrap={tableWrap}
              table={table}
              th={th}
              td={td}
              buttonRowSmall={buttonRowSmall}
              miniButton={miniButton}
              miniDanger={miniDanger}
            />
          </>
        )}

        {viewMode === 'WEEKLY' && (
          <ChallengeSection
            challenge={weeklyChallenge}
            leaderboard={weeklyLeaderboard}
            type="weekly"
            isAdmin={isAdmin}
            playerValue={weeklyPlayer}
            setPlayerValue={setWeeklyPlayer}
            timeValue={weeklyTime}
            setTimeValue={setWeeklyTime}
            messageValue={weeklyMessage}
            editingEntryId={editingWeeklyEntryId}
            onSubmit={() => submitChallengeTime('weekly')}
            onCancelEdit={cancelEditWeeklyEntry}
            onEditEntry={startEditWeeklyEntry}
            onDeleteEntry={deleteWeeklyEntry}
            onDeleteChallenge={() => deleteActiveChallenge('weekly')}
            createGameValue={weeklyChallengeGame}
            setCreateGameValue={setWeeklyChallengeGame}
            createTrackValue={weeklyChallengeTrack}
            setCreateTrackValue={setWeeklyChallengeTrack}
            createCarValue={weeklyChallengeCar}
            setCreateCarValue={setWeeklyChallengeCar}
            createEndAtValue={weeklyChallengeEndAt}
            setCreateEndAtValue={setWeeklyChallengeEndAt}
            onCreateChallenge={() => createChallenge('weekly')}
            normalizeText={normalizeText}
            card={card}
            sectionTitle={sectionTitle}
            formGrid={formGrid}
            input={input}
            line={line}
            buttonRow={buttonRow}
            button={button}
            buttonSecondary={buttonSecondary}
            messageStyle={messageStyle}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
            buttonRowSmall={buttonRowSmall}
            miniButton={miniButton}
            miniDanger={miniDanger}
          />
        )}

        {viewMode === 'MONTHLY' && (
          <ChallengeSection
            challenge={monthlyChallenge}
            leaderboard={monthlyLeaderboard}
            type="monthly"
            isAdmin={isAdmin}
            playerValue={monthlyPlayer}
            setPlayerValue={setMonthlyPlayer}
            timeValue={monthlyTime}
            setTimeValue={setMonthlyTime}
            messageValue={monthlyMessage}
            editingEntryId={editingMonthlyEntryId}
            onSubmit={() => submitChallengeTime('monthly')}
            onCancelEdit={cancelEditMonthlyEntry}
            onEditEntry={startEditMonthlyEntry}
            onDeleteEntry={deleteMonthlyEntry}
            onDeleteChallenge={() => deleteActiveChallenge('monthly')}
            createGameValue={monthlyChallengeGame}
            setCreateGameValue={setMonthlyChallengeGame}
            createTrackValue={monthlyChallengeTrack}
            setCreateTrackValue={setMonthlyChallengeTrack}
            createCarValue={monthlyChallengeCar}
            setCreateCarValue={setMonthlyChallengeCar}
            createEndAtValue={monthlyChallengeEndAt}
            setCreateEndAtValue={setMonthlyChallengeEndAt}
            onCreateChallenge={() => createChallenge('monthly')}
            normalizeText={normalizeText}
            card={card}
            sectionTitle={sectionTitle}
            formGrid={formGrid}
            input={input}
            line={line}
            buttonRow={buttonRow}
            button={button}
            buttonSecondary={buttonSecondary}
            messageStyle={messageStyle}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
            buttonRowSmall={buttonRowSmall}
            miniButton={miniButton}
            miniDanger={miniDanger}
          />
        )}

        {viewMode === 'POINTS' && (
          <PointsSection
            pointsLeaderboard={pointsLeaderboard}
            card={card}
            sectionTitle={sectionTitle}
            line={line}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
          />
        )}


        {viewMode === 'COMMERCIAL' && (
          <CommercialSection
            setActiveTab={(nextTab) => {
              if (nextTab === 'reservas') {
                setViewMode('BOOKINGS')
                return
              }
              setViewMode(nextTab)
            }}
            onCommercialReserve={(prefill) => {
              setViewMode('BOOKINGS')
              applyCommercialPrefill(prefill)
            }}
          />
        )}


        {viewMode === 'PROFILE' && (
          <PilotProfileSection
            lapTimes={normalizedLapTimes}
            bookings={bookings}
            pointsLeaderboard={pointsLeaderboard}
            normalizeText={normalizeText}
            formatDateChile={formatDateChile}
            card={card}
            sectionTitle={sectionTitle}
            formGrid={formGrid}
            input={input}
            line={line}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
          />
        )}


        {viewMode === 'FORUM' && <ForumSection isAdmin={isAdmin} />}

        {viewMode === 'ADMIN' && (
          <div
            style={{
              ...card,
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
            }}
          >
            <h2 style={sectionTitle}>{isAdmin ? 'Modo admin activo' : 'Acceso administrador'}</h2>

            {!isAdmin ? (
              <>
                <div style={{ ...formGrid, gridTemplateColumns: '1fr', maxWidth: 360, margin: '0 auto 12px' }}>
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(event) => setAdminEmailInput(event.target.value)}
                    placeholder="Correo admin"
                    autoComplete="username"
                    style={input}
                  />
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(event) => setAdminPasswordInput(event.target.value)}
                    placeholder="Contraseña admin"
                    autoComplete="current-password"
                    style={input}
                  />
                </div>
                <div style={{ ...buttonRow, justifyContent: 'center' }}>
                  <button style={button} onClick={handleAdminAccess} disabled={isAdminAuthLoading}>
                    {isAdminAuthLoading ? 'Validando acceso...' : 'Entrar como admin'}
                  </button>
                  <button style={buttonSecondary} onClick={() => navigateToView('BOOKINGS')}>Volver a reservas</button>
                </div>
                {adminAccessError ? <div style={messageStyle}>{adminAccessError}</div> : null}
              </>
            ) : (
              <>
                <div style={{ color: '#aab6d3', marginBottom: 12 }}>
                  Ya puedes gestionar rankings, reservas, desafíos y comunidad.
                  {adminSessionEmail ? ` Sesión activa: ${adminSessionEmail}` : ''}
                </div>
                <div style={{ ...buttonRow, justifyContent: 'center' }}>
                  <button style={button} onClick={() => setViewMode('BOOKINGS')}>Ir a reservas</button>
                  <button style={buttonSecondary} onClick={exitAdminMode}>Salir de admin</button>
                </div>
                <BookingInsightsSection />
              </>
            )}
          </div>
        )}

        {viewMode === 'BOOKINGS' && (
          <BookingsSection
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
            bookings={bookings}
            startEditBooking={startEditBooking}
            deleteBooking={deleteBooking}
            BOOKING_OPTIONS={BOOKING_OPTIONS}
            normalizeText={normalizeText}
            normalizePhone={normalizePhone}
            formatDateChile={formatDateChile}
            card={card}
            sectionTitle={sectionTitle}
            formGrid={formGrid}
            input={input}
            checkboxRow={checkboxRow}
            line={line}
            buttonRow={buttonRow}
            button={button}
            buttonSecondary={buttonSecondary}
            messageStyle={messageStyle}
            tableWrap={tableWrap}
            table={table}
            th={th}
            td={td}
            buttonRowSmall={buttonRowSmall}
            miniButton={miniButton}
            miniDanger={miniDanger}
          />
        )}
      </div>

      <MainTabsNav
        viewMode={viewMode}
        onNavigate={navigateToView}
        isMoreOpen={isMoreOpen}
        setIsMoreOpen={setIsMoreOpen}
        isAdmin={isAdmin}
        onOpenAdmin={openAdminAccess}
        onExitAdmin={exitAdminMode}
      />
    </div>
  )
}
