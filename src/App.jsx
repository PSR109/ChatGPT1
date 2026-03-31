import { useEffect, useMemo, useState } from 'react'
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
import MainTabsNav from './components/MainTabsNav'
import { buildBookingFollowupWhatsappLink } from './utils/whatsappHelper'
import {
  page,
  container,
  hero,
  title,
  subtitle,
  modeWrap,
  modeButton,
  modeButtonActive,
  tabs,
  tab,
  tabActive,
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

const BOOKING_OPTIONS = {
  '1_ESTANDAR': {
    label: '1 ESTÁNDAR',
    simulators: 1,
    pricingModel: ['ESTANDAR'],
  },
  '1_PRO': {
    label: '1 PRO',
    simulators: 1,
    pricingModel: ['PRO'],
  },
  '2_ESTANDAR': {
    label: '2 ESTÁNDAR',
    simulators: 2,
    pricingModel: ['ESTANDAR', 'ESTANDAR'],
  },
  '1_ESTANDAR_1_PRO': {
    label: '1 ESTÁNDAR + 1 PRO',
    simulators: 2,
    pricingModel: ['ESTANDAR', 'PRO'],
  },
  '3_SIMULADORES': {
    label: '3 SIMULADORES',
    simulators: 3,
    pricingModel: ['ESTANDAR', 'ESTANDAR', 'PRO'],
  },
}

const TIME_OPTIONS = buildTimeOptions('10:30', '20:00', 30)


const getBookingOptionKeyFromBooking = bookingEngine.getBookingOptionKeyFromBooking

const normalizeBookingDraft = bookingEngine.normalizeBookingDraft

const validateBookingPayload = bookingEngine.validateBookingPayload

const getConflicts = bookingEngine.getConflicts

const ADMIN_ACCESS_KEY = import.meta.env.VITE_ADMIN_ACCESS_KEY || 'PSR109PV'

function calculateSingleSimulatorPrice(type, minutes) {
  const m = Number(minutes)

  const rates = {
    ESTANDAR: {
      base15: 9000,
      base30: 16000,
      hour: 28000,
    },
    PRO: {
      base15: 10000,
      base30: 18000,
      hour: 32000,
    },
  }

  const cfg = rates[type]
  if (!cfg || m < 15) return 0

  const minuteRate = cfg.hour / 60

  if (m === 15) return cfg.base15
  if (m === 30) return cfg.base30
  if (m === 60) return cfg.hour
  if (m >= 16 && m <= 29) return cfg.base15 + minuteRate * (m - 15)
  if (m >= 31 && m <= 59) return cfg.base30 + minuteRate * (m - 30)
  if (m > 60) return minuteRate * m

  return 0
}

function calculateBookingTotal(configKey, duration) {
  const config = BOOKING_OPTIONS[configKey]
  if (!config) return 0

  const total = config.pricingModel.reduce((sum, simulatorType) => {
    return sum + calculateSingleSimulatorPrice(simulatorType, duration)
  }, 0)

  return Math.round(total)
}

function isTimeSlotAvailable(bookings, bookingDate, bookingConfig, bookingDuration, slot, editingBookingId = null) {
  if (!bookingDate || !slot) return true

  return getConflicts(
    {
      booking_date: bookingDate,
      booking_time: slot,
      duration: Number(bookingDuration),
      simulator_config_id: bookingConfig,
    },
    bookings,
    editingBookingId
  ).length === 0
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
  const [adminKeyInput, setAdminKeyInput] = useState('')
  const [adminAccessError, setAdminAccessError] = useState('')
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
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)

  const [lapEditId, setLapEditId] = useState(null)
  const [lapEditPlayer, setLapEditPlayer] = useState('')
  const [lapEditCountry, setLapEditCountry] = useState('CL')
  const [lapEditGame, setLapEditGame] = useState('')
  const [lapEditTrack, setLapEditTrack] = useState('')
  const [lapEditCar, setLapEditCar] = useState('')
  const [lapEditTime, setLapEditTime] = useState('')
  const [lapEditMessage, setLapEditMessage] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    setIsMoreOpen(false)
  }, [viewMode])

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadWeeklyChallenge()
      loadMonthlyChallenge()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isAdmin) return

    cancelEditLapTime()
    cancelEditBooking()
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
    const { data, error } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('challenge_type', type)
      .eq('challenge_id', challengeId)
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

  const availableTimeOptions = useMemo(() => {
    if (!bookingDate) return TIME_OPTIONS

    return TIME_OPTIONS.filter((slot) =>
      isTimeSlotAvailable(bookings, bookingDate, bookingConfig, bookingDuration, slot, editingBookingId)
    )
  }, [bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId])

  useEffect(() => {
    if (!availableTimeOptions.includes(bookingTime)) {
      setBookingTime(availableTimeOptions[0] || '')
    }
  }, [availableTimeOptions, bookingTime])


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

  function startEditBooking(booking) {
    if (!isAdmin) return

    const configKey = getBookingOptionKeyFromBooking(booking)

    setEditingBookingId(booking.id)
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
    setBookingMessage('Editando reserva')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearBookingSuccessSummary() {
    setBookingSuccessSummary(null)
  }

  function clearBookingCommercialContext() {
    setBookingCommercialContext(null)
  }

  function resetBookingForm() {
    setEditingBookingId(null)
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

    setBookingMessage('')
    setIsBookingSubmitting(true)

    try {
      const selectedConfig = BOOKING_OPTIONS[bookingConfig]
      const total = calculateBookingTotal(bookingConfig, bookingDuration)

      const draftPayload = normalizeBookingDraft({
        client: normalizeText(bookingClient),
        phone: normalizePhone(bookingPhone),
        whatsapp_reminder: bookingWhatsappReminder,
        booking_date: bookingDate,
        booking_time: bookingTime,
        reservation_kind: bookingKind,
        simulators: Number(selectedConfig?.simulators || 0),
        booking_type: selectedConfig?.label || '',
        duration: Number(bookingDuration),
        total,
        simulator_config_id: bookingConfig,
      })

      const localValidation = validateBookingPayload(draftPayload, bookings, editingBookingId)

      if (!localValidation.valid) {
        if (localValidation.conflicts.length > 0) {
          setBookingMessage('Horario no disponible')
          return
        }

        if (
          !draftPayload.client ||
          !draftPayload.phone ||
          !draftPayload.booking_date ||
          !draftPayload.booking_time
        ) {
          setBookingMessage('Faltan datos')
          return
        }

        setBookingMessage(localValidation.errors[0] || 'No se pudo validar la reserva')
        return
      }

      const freshBookings = await loadBookingsByDate(draftPayload.booking_date)

      if (freshBookings === null) {
        setBookingMessage('No se pudo validar la disponibilidad en tiempo real')
        return
      }

      const liveValidation = validateBookingPayload(draftPayload, freshBookings, editingBookingId)

      if (!liveValidation.valid) {
        setBookings((current) => {
          const withoutDate = current.filter((item) => item.booking_date !== draftPayload.booking_date)
          return [...withoutDate, ...freshBookings]
        })
        setBookingMessage(
          liveValidation.conflicts.length > 0
            ? 'Ese horario acaba de ocuparse. Elige otro horario.'
            : (liveValidation.errors[0] || 'No se pudo validar la reserva en tiempo real')
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
        const { error } = await supabase.from('bookings').update(payload).eq('id', editingBookingId)

        if (error) {
          console.log('update booking error:', error)
          setBookingMessage('Error al actualizar reserva')
          return
        }

        await loadBookings()
        cancelEditBooking()
        setBookingMessage('Reserva actualizada correctamente')
        return
      }

      const { error } = await supabase.from('bookings').insert([payload])

      if (error) {
        console.log('create booking error:', error)
        setBookingMessage('Error al guardar reserva')
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
        whatsappLink: buildBookingFollowupWhatsappLink(bookingSummary),
      })
      setBookingCommercialContext({
        source: 'booking_created',
        kind: draftPayload.reservation_kind,
        configLabel: selectedConfig?.label || '',
      })
      resetBookingForm()
      setBookingMessage('Reserva creada correctamente')
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  async function deleteBooking(id) {
    if (!isAdmin) return
    if (isBookingSubmitting) return
    const ok = window.confirm('¿Eliminar esta reserva?')
    if (!ok) return

    setIsBookingSubmitting(true)
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id)

      if (error) {
        console.log('delete booking error:', error)
        setBookingMessage('Error al eliminar reserva')
        return
      }

      if (editingBookingId === id) cancelEditBooking()
      clearBookingSuccessSummary()
      clearBookingCommercialContext()
      await loadBookings()
      setBookingMessage('Reserva eliminada correctamente')
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  const totalBooking = useMemo(() => {
    return calculateBookingTotal(bookingConfig, bookingDuration)
  }, [bookingConfig, bookingDuration])

  const applyCommercialPrefill = (prefill = {}) => {
    const segment = prefill?.segment || 'aprender'
    clearBookingSuccessSummary()
    setBookingCommercialContext({
      source: 'commercial_prefill',
      segment,
      sourceLabel: prefill?.sourceLabel || segment,
    })

    if (segment === 'empresa') {
      setBookingKind('EMPRESA')
      setBookingConfig('3_SIMULADORES')
      setBookingDuration(120)
      setBookingMessage('Reserva preconfigurada desde sección comercial: Empresa')
      return
    }

    if (segment === 'evento') {
      setBookingKind('EVENTO')
      setBookingConfig('2_ESTANDAR')
      setBookingDuration(60)
      setBookingMessage('Reserva preconfigurada desde sección comercial: Evento')
      return
    }

    if (segment === 'activacion') {
      setBookingKind('EVENTO')
      setBookingConfig('3_SIMULADORES')
      setBookingDuration(120)
      setBookingMessage('Reserva preconfigurada desde sección comercial: Activación')
      return
    }

    setBookingKind('LOCAL')
    setBookingConfig('1_ESTANDAR')
    setBookingDuration(30)
    setBookingMessage('Reserva preconfigurada desde sección comercial: Práctica')
  }

  useEffect(() => {
    const handler = (event) => {
      setViewMode('BOOKINGS')
      applyCommercialPrefill(event?.detail || {})
    }

    window.addEventListener('psr-commercial-booking-prefill', handler)
    return () => window.removeEventListener('psr-commercial-booking-prefill', handler)
  }, [])

  function navigateToView(nextView) {
    setIsMoreOpen(false)

    if (nextView !== 'ADMIN') {
      setAdminAccessError('')
      setAdminKeyInput('')
    }

    setViewMode(nextView)
  }

  function openAdminAccess() {
    setAdminAccessError('')
    setAdminKeyInput('')
    navigateToView('ADMIN')
  }

  function handleAdminAccess() {
    if ((adminKeyInput || '').trim() !== ADMIN_ACCESS_KEY) {
      setAdminAccessError('Clave incorrecta')
      return
    }

    clearBookingSuccessSummary()
    clearBookingCommercialContext()
    setAppMode('ADMIN')
    setAdminAccessError('')
    setAdminKeyInput('')
    navigateToView('BOOKINGS')
  }

  function exitAdminMode() {
    clearBookingSuccessSummary()
    clearBookingCommercialContext()
    setAppMode('USER')
    setAdminAccessError('')
    setAdminKeyInput('')
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
                    type="password"
                    value={adminKeyInput}
                    onChange={(event) => setAdminKeyInput(event.target.value)}
                    placeholder="Clave admin"
                    style={input}
                  />
                </div>
                <div style={{ ...buttonRow, justifyContent: 'center' }}>
                  <button style={button} onClick={handleAdminAccess}>Entrar como admin</button>
                  <button style={buttonSecondary} onClick={() => navigateToView('BOOKINGS')}>Volver a reservas</button>
                </div>
                {adminAccessError ? <div style={messageStyle}>{adminAccessError}</div> : null}
              </>
            ) : (
              <>
                <div style={{ color: '#aab6d3', marginBottom: 12 }}>
                  Ya puedes gestionar rankings, reservas, desafíos y comunidad.
                </div>
                <div style={{ ...buttonRow, justifyContent: 'center' }}>
                  <button style={button} onClick={() => setViewMode('BOOKINGS')}>Ir a reservas</button>
                  <button style={buttonSecondary} onClick={exitAdminMode}>Salir de admin</button>
                </div>
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
            isBookingSubmitting={isBookingSubmitting}
            availableTimeOptions={availableTimeOptions}
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
