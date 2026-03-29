import { useEffect, useMemo, useState } from 'react'
import { supabase } from './db.js'
import {
  buildTimeOptions,
  timeToMinutes,
  getDurationMinutes,
  formatDateChile,
  normalizeText,
  normalizePhone,
  isValidTimeFormat,
  convertToMs,
  formatGap,
  getGameOrderIndex,
} from './utils/psrUtils'
import { buildDirectWhatsappLink, buildRankingAlertWhatsappMessage } from './utils/whatsappHelper'
import GeneralRankingSection from './components/GeneralRankingSection'
import BookingsSection from './components/BookingsSection'
import ChallengeSection from './components/ChallengeSection'
import { isChallengeExpired } from './utils/challengeUtils'
import PointsSection from './components/PointsSection'
import LayoutHeader from './components/LayoutHeader'
import LapTimeEditorSection from './components/LapTimeEditorSection'
import PilotProfileSection from './components/PilotProfileSection'
import CommercialSection from './components/CommercialSection'
import ForumSection from './components/ForumSection'
import RankingAlertQueueSection from './components/RankingAlertQueueSection'
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

function getSuggestedTimes(bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId = null) {
  if (!bookingDate) return []

  const selectedConfig = BOOKING_OPTIONS[bookingConfig]
  const neededSims = selectedConfig?.simulators || 1
  const durationMinutes = getDurationMinutes(bookingDuration)

  return TIME_OPTIONS.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + durationMinutes

    let reservedSims = 0

    bookings.forEach((booking) => {
      if (editingBookingId && booking.id === editingBookingId) return
      if (booking.booking_date !== bookingDate) return

      const existingStart = timeToMinutes(String(booking.booking_time).slice(0, 5))
      const existingEnd = existingStart + getDurationMinutes(booking.duration)
      const overlap = slotStart < existingEnd && slotEnd > existingStart

      if (overlap) reservedSims += Number(booking.simulators || 0)
    })

    return reservedSims + neededSims <= 3
  })
}

function buildChallengeLeaderboard(entries) {
  const sorted = [...entries]
    .map((entry) => ({
      ...entry,
      player: normalizeText(entry.player),
    }))
    .sort((a, b) => a.time_ms - b.time_ms)

  const best = sorted[0]?.time_ms || 0

  return sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
    gap: formatGap(entry.time_ms - best),
  }))
}

export default function App() {
  const [appMode, setAppMode] = useState('USER')
  const [viewMode, setViewMode] = useState('GENERAL')
  const isAdmin = appMode === 'ADMIN'

  const [lapTimes, setLapTimes] = useState([])
  const [weeklyChallenge, setWeeklyChallenge] = useState(null)
  const [monthlyChallenge, setMonthlyChallenge] = useState(null)
  const [weeklyEntries, setWeeklyEntries] = useState([])
  const [monthlyEntries, setMonthlyEntries] = useState([])
  const [bookings, setBookings] = useState([])
  const [rankingAlertEvents, setRankingAlertEvents] = useState([])
  const [rankingAlertMessage, setRankingAlertMessage] = useState('')

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
  const [editingBookingId, setEditingBookingId] = useState(null)

  const [lapEditId, setLapEditId] = useState(null)
  const [lapEditPlayer, setLapEditPlayer] = useState('')
  const [lapEditCountry, setLapEditCountry] = useState('CL')
  const [lapEditGame, setLapEditGame] = useState('')
  const [lapEditTrack, setLapEditTrack] = useState('')
  const [lapEditCar, setLapEditCar] = useState('')
  const [lapEditTime, setLapEditTime] = useState('')
  const [lapEditWhatsapp, setLapEditWhatsapp] = useState('')
  const [lapEditRankingAlertOptIn, setLapEditRankingAlertOptIn] = useState(false)
  const [lapEditMessage, setLapEditMessage] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

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
      loadRankingAlertEvents(),
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

  async function loadWeeklyChallenge() {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .gte('end_at', now)
      .order('end_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.log('weekly challenge error:', error)
      setWeeklyChallenge(null)
      setWeeklyEntries([])
      return
    }

    setWeeklyChallenge(data)

    if (data) {
      await loadChallengeEntries('weekly', data.id, setWeeklyEntries)
    } else {
      setWeeklyEntries([])
    }
  }

  async function loadMonthlyChallenge() {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('monthly_challenges')
      .select('*')
      .gte('end_at', now)
      .order('end_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.log('monthly challenge error:', error)
      setMonthlyChallenge(null)
      setMonthlyEntries([])
      return
    }

    setMonthlyChallenge(data)

    if (data) {
      await loadChallengeEntries('monthly', data.id, setMonthlyEntries)
    } else {
      setMonthlyEntries([])
    }
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
      return
    }

    setBookings(data || [])
  }

  async function loadRankingAlertEvents() {
    const { data, error } = await supabase
      .from('ranking_alert_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.log('ranking_alert_events error:', error)
      setRankingAlertEvents([])
      return
    }

    setRankingAlertEvents(data || [])
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

  const unavailableTimes = useMemo(() => {
    if (!bookingDate) return []

    const selectedConfig = BOOKING_OPTIONS[bookingConfig]
    const neededSims = selectedConfig?.simulators || 1
    const durationMinutes = getDurationMinutes(bookingDuration)

    return TIME_OPTIONS.filter((slot) => {
      const slotStart = timeToMinutes(slot)
      const slotEnd = slotStart + durationMinutes

      let reservedSims = 0

      bookings.forEach((booking) => {
        if (editingBookingId && booking.id === editingBookingId) return
        if (booking.booking_date !== bookingDate) return

        const existingStart = timeToMinutes(String(booking.booking_time).slice(0, 5))
        const existingEnd = existingStart + getDurationMinutes(booking.duration)
        const overlap = slotStart < existingEnd && slotEnd > existingStart

        if (overlap) reservedSims += Number(booking.simulators || 0)
      })

      return reservedSims + neededSims > 3
    })
  }, [bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId])

  const availableTimeOptions = useMemo(() => {
    return TIME_OPTIONS.filter((slot) => !unavailableTimes.includes(slot))
  }, [unavailableTimes])

  useEffect(() => {
    if (!availableTimeOptions.includes(bookingTime)) {
      setBookingTime(availableTimeOptions[0] || '')
    }
  }, [availableTimeOptions, bookingTime])

  const suggestedTimes = useMemo(() => {
    return getSuggestedTimes(bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId).slice(0, 4)
  }, [bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId])

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


  async function tryCreateRankingAlert(newPayload) {
    const cleanPlayer = normalizeText(newPayload.player)

    const { data: existingRows, error: existingRowsError } = await supabase
      .from('lap_times')
      .select('id, player, game, track, time, time_ms, whatsapp_phone, ranking_alert_opt_in')
      .eq('game', newPayload.game)
      .eq('track', newPayload.track)
      .order('time_ms', { ascending: true })
      .limit(10)

    if (existingRowsError) {
      console.log('ranking alert compare error:', existingRowsError)
      return
    }

    const rivalLeader = (existingRows || []).find((row) => normalizeText(row.player) !== cleanPlayer)

    if (!rivalLeader) return
    if (Number(newPayload.time_ms || 0) >= Number(rivalLeader.time_ms || 0)) return

    const targetPhone = normalizePhone(rivalLeader.whatsapp_phone || '')
    const hasOptIn = Boolean(rivalLeader.ranking_alert_opt_in)

    if (!targetPhone || !hasOptIn) return

    const preview = buildRankingAlertWhatsappMessage({
      targetPlayer: rivalLeader.player,
      challengerPlayer: newPayload.player,
      game: newPayload.game,
      track: newPayload.track,
      oldTime: rivalLeader.time,
      newTime: newPayload.time,
    })

    const { error: alertInsertError } = await supabase.from('ranking_alert_events').insert([
      {
        target_player: normalizeText(rivalLeader.player),
        target_phone: targetPhone,
        challenger_player: normalizeText(newPayload.player),
        game: newPayload.game,
        track: newPayload.track,
        previous_time: rivalLeader.time,
        new_time: newPayload.time,
        message_preview: preview,
        status: 'PENDING',
      },
    ])

    if (alertInsertError) {
      console.log('ranking alert insert error:', alertInsertError)
      return
    }

    setRankingAlertMessage(`Alerta creada para ${normalizeText(rivalLeader.player)}`)
    await loadRankingAlertEvents()
  }

  async function markRankingAlertStatus(alertId, status) {
    const { error } = await supabase
      .from('ranking_alert_events')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', alertId)

    if (error) {
      console.log('ranking alert status error:', error)
      setRankingAlertMessage('Error al actualizar alerta')
      return
    }

    setRankingAlertMessage(
      status === 'SENT' ? 'Alerta marcada como enviada' : status === 'CANCELLED' ? 'Alerta descartada' : 'Alerta actualizada'
    )
    await loadRankingAlertEvents()
  }

  async function markRankingAlertAsSent(alertId) {
    await markRankingAlertStatus(alertId, 'SENT')
  }

  async function dismissRankingAlert(alertId) {
    await markRankingAlertStatus(alertId, 'CANCELLED')
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
    setLapEditWhatsapp(normalizePhone(entry.whatsapp_phone || ''))
    setLapEditRankingAlertOptIn(Boolean(entry.ranking_alert_opt_in))
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
    setLapEditWhatsapp('')
    setLapEditRankingAlertOptIn(false)
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
      whatsapp_phone: normalizePhone(lapEditWhatsapp),
      ranking_alert_opt_in: Boolean(lapEditRankingAlertOptIn),
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

      await tryCreateRankingAlert(payload)
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
      setLapEditWhatsapp('')
      setLapEditRankingAlertOptIn(false)
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

    const configKey =
      Object.keys(BOOKING_OPTIONS).find(
        (key) =>
          BOOKING_OPTIONS[key].label === booking.booking_type &&
          BOOKING_OPTIONS[key].simulators === Number(booking.simulators)
      ) || '1_ESTANDAR'

    setEditingBookingId(booking.id)
    setBookingClient(normalizeText(booking.client))
    setBookingPhone(normalizePhone(booking.phone))
    setBookingDate(booking.booking_date)
    setBookingTime(String(booking.booking_time).slice(0, 5))
    setBookingKind(booking.reservation_kind || 'LOCAL')
    setBookingConfig(configKey)
    setBookingDuration(Number(booking.duration))
    setBookingWhatsappReminder(Boolean(booking.whatsapp_reminder))
    setBookingMessage('Editando reserva')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditBooking() {
    setEditingBookingId(null)
    setBookingClient('')
    setBookingPhone('')
    setBookingDate('')
    setBookingTime('10:30')
    setBookingKind('LOCAL')
    setBookingConfig('1_ESTANDAR')
    setBookingDuration(30)
    setBookingWhatsappReminder(false)
    setBookingMessage('')
  }

  async function createOrUpdateBooking() {
    if (!isAdmin && editingBookingId) return

    setBookingMessage('')

    if (!bookingClient || !bookingPhone || !bookingDate || !bookingTime) {
      setBookingMessage('Faltan datos')
      return
    }

    if (Number(bookingDuration) < 15) {
      setBookingMessage('La duración mínima es 15 minutos')
      return
    }

    const selectedConfig = BOOKING_OPTIONS[bookingConfig]
    const total = calculateBookingTotal(bookingConfig, bookingDuration)

    const bookingStart = timeToMinutes(bookingTime)
    const bookingEnd = bookingStart + getDurationMinutes(bookingDuration)

    let reservedSims = 0

    bookings.forEach((booking) => {
      if (editingBookingId && booking.id === editingBookingId) return
      if (booking.booking_date !== bookingDate) return

      const existingStart = timeToMinutes(String(booking.booking_time).slice(0, 5))
      const existingEnd = existingStart + getDurationMinutes(booking.duration)
      const overlap = bookingStart < existingEnd && bookingEnd > existingStart

      if (overlap) reservedSims += Number(booking.simulators || 0)
    })

    if (reservedSims + selectedConfig.simulators > 3) {
      setBookingMessage(
        suggestedTimes.length > 0
          ? `Horario no disponible. Prueba: ${suggestedTimes.join(' / ')}`
          : 'Horario no disponible'
      )
      return
    }

    const payload = {
      client: normalizeText(bookingClient),
      phone: normalizePhone(bookingPhone),
      whatsapp_reminder: bookingWhatsappReminder,
      booking_date: bookingDate,
      booking_time: bookingTime,
      reservation_kind: bookingKind,
      simulators: selectedConfig.simulators,
      booking_type: selectedConfig.label,
      duration: Number(bookingDuration),
      total,
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
    setBookingClient('')
    setBookingPhone('')
    setBookingDate('')
    setBookingTime('10:30')
    setBookingKind('LOCAL')
    setBookingConfig('1_ESTANDAR')
    setBookingDuration(30)
    setBookingWhatsappReminder(false)
    setBookingMessage('Reserva creada correctamente')
  }

  async function deleteBooking(id) {
    if (!isAdmin) return
    const ok = window.confirm('¿Eliminar esta reserva?')
    if (!ok) return

    const { error } = await supabase.from('bookings').delete().eq('id', id)

    if (error) {
      console.log('delete booking error:', error)
      setBookingMessage('Error al eliminar reserva')
      return
    }

    if (editingBookingId === id) cancelEditBooking()
    await loadBookings()
  }

  const totalBooking = useMemo(() => {
    return calculateBookingTotal(bookingConfig, bookingDuration)
  }, [bookingConfig, bookingDuration])

  const applyCommercialPrefill = (prefill = {}) => {
    const segment = prefill?.segment || 'aprender'

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

  function goToBookingFromRanking({ rankingType = 'GENERAL', position = 99, gap = '-', game = '', track = '', player = '' } = {}) {
    const rankingLabel =
      rankingType === 'WEEKLY' ? 'desafío semanal' : rankingType === 'MONTHLY' ? 'desafío mensual' : 'ranking general'

    const isLeader = Number(position) === 1
    const isTopThree = Number(position) > 1 && Number(position) <= 3
    const suggestedMinutes = isLeader ? 30 : isTopThree ? 45 : 60

    setViewMode('BOOKINGS')
    setBookingKind('LOCAL')
    setBookingConfig(isLeader ? '1_PRO' : '1_ESTANDAR')
    setBookingDuration(suggestedMinutes)

    const focusLine = isLeader
      ? `Defiende tu puesto en ${rankingLabel}.`
      : isTopThree
        ? `Estás peleando arriba en ${rankingLabel}.`
        : `Tienes espacio para subir en ${rankingLabel}.`

    const gapLine = !isLeader && gap && gap !== '-'
      ? `Te separan ${gap} del líder en ${game || '-'} · ${track || '-'}.`
      : `Combo objetivo: ${game || '-'} · ${track || '-'}.`

    const playerLine = player ? `Piloto objetivo: ${normalizeText(player)}.` : ''

    setBookingMessage(
      [
        focusLine,
        gapLine,
        playerLine,
        `Reserva sugerida: ${suggestedMinutes} min para ir por la revancha.`,
      ]
        .filter(Boolean)
        .join(' ')
    )

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  useEffect(() => {
    const handler = (event) => {
      setViewMode('BOOKINGS')
      applyCommercialPrefill(event?.detail || {})
    }

    window.addEventListener('psr-commercial-booking-prefill', handler)
    return () => window.removeEventListener('psr-commercial-booking-prefill', handler)
  }, [])


  return (
    <div style={page}>
      <div style={container}>
        <LayoutHeader
          appMode={appMode}
          setAppMode={setAppMode}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hero={hero}
          title={title}
          subtitle={subtitle}
          modeWrap={modeWrap}
          modeButton={modeButton}
          modeButtonActive={modeButtonActive}
          tabs={tabs}
          tab={tab}
          tabActive={tabActive}
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
              lapEditWhatsapp={lapEditWhatsapp}
              setLapEditWhatsapp={setLapEditWhatsapp}
              lapEditRankingAlertOptIn={lapEditRankingAlertOptIn}
              setLapEditRankingAlertOptIn={setLapEditRankingAlertOptIn}
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

            <RankingAlertQueueSection
              isAdmin={isAdmin}
              alerts={rankingAlertEvents}
              alertMessage={rankingAlertMessage}
              onMarkSent={markRankingAlertAsSent}
              onDismiss={dismissRankingAlert}
              buildDirectWhatsappLink={buildDirectWhatsappLink}
              card={card}
              sectionTitle={sectionTitle}
              button={button}
              buttonSecondary={buttonSecondary}
              miniDanger={miniDanger}
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
              onReserveFromRanking={goToBookingFromRanking}
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
            onReserveFromChallenge={goToBookingFromRanking}
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
            onReserveFromChallenge={goToBookingFromRanking}
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

        {viewMode === 'FORUM' && (
          <ForumSection
            isAdmin={isAdmin}
          />
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
            bookingMessage={bookingMessage}
            availableTimeOptions={availableTimeOptions}
            suggestedTimes={suggestedTimes}
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
    </div>
  )
}
