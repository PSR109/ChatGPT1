/**
 * LEGACY / NO ACTIVO EN EL FLUJO PRINCIPAL
 * Hook heredado no conectado al flujo principal actual.
 * La carga de datos vigente está resuelta directamente en App.jsx y capas activas.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../db.js'
import {
  buildChallengeLeaderboard,
  formatGap,
  getGameOrderIndex,
  getBookingAvailability,
  normalizeText,
} from "../lib/psr"

export function usePSRData() {
  const [lapTimes, setLapTimes] = useState([])
  const [weeklyChallenge, setWeeklyChallenge] = useState(null)
  const [monthlyChallenge, setMonthlyChallenge] = useState(null)
  const [weeklyEntries, setWeeklyEntries] = useState([])
  const [monthlyEntries, setMonthlyEntries] = useState([])
  const [bookings, setBookings] = useState([])

  const loadLapTimes = useCallback(async () => {
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
  }, [])

  const loadChallengeEntries = useCallback(async (type, challengeId, setter) => {
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
  }, [])

  const loadWeeklyChallenge = useCallback(async () => {
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
  }, [loadChallengeEntries])

  const loadMonthlyChallenge = useCallback(async () => {
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
  }, [loadChallengeEntries])

  const loadBookings = useCallback(async () => {
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
  }, [])

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadLapTimes(),
      loadWeeklyChallenge(),
      loadMonthlyChallenge(),
      loadBookings(),
    ])
  }, [loadLapTimes, loadWeeklyChallenge, loadMonthlyChallenge, loadBookings])

  useEffect(() => {
    loadAll()
  }, [loadAll])

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

  const weeklyLeaderboard = useMemo(() => buildChallengeLeaderboard(weeklyEntries), [weeklyEntries])
  const monthlyLeaderboard = useMemo(() => buildChallengeLeaderboard(monthlyEntries), [monthlyEntries])

  const pointsLeaderboard = useMemo(() => {
    const scoreboard = {}

    function add(player, pts, reason) {
      const p = normalizeText(player)
      if (!p) return
      if (!scoreboard[p]) scoreboard[p] = { player: p, points: 0, details: [] }
      scoreboard[p].points += pts
      scoreboard[p].details.push(reason)
    }

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

    return Object.values(scoreboard)
      .sort((a, b) => b.points - a.points || a.player.localeCompare(b.player))
      .map((e, i) => ({ ...e, position: i + 1 }))
  }, [weeklyEntries, monthlyEntries, weeklyLeaderboard, monthlyLeaderboard])

  const pointsMap = useMemo(() => {
    const map = {}
    pointsLeaderboard.forEach((row) => {
      map[row.player] = row.points
    })
    return map
  }, [pointsLeaderboard])

  const getGeneralSections = useCallback((generalGame, generalTrack, generalSearch) => {
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
        byGameTrack[groupKey] = { game: row.game, track: row.track, rows: [] }
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
            points: pointsMap[row.player] || 0,
          })),
        }
      })
  }, [normalizedLapTimes, pointsMap])

  const generalGames = useMemo(() => {
    const unique = [...new Set(normalizedLapTimes.map((x) => x.game).filter(Boolean))]
    return ['TODOS', ...unique.sort((a, b) => getGameOrderIndex(a) - getGameOrderIndex(b) || a.localeCompare(b))]
  }, [normalizedLapTimes])

  const getGeneralTracks = useCallback((generalGame) => {
    const base =
      generalGame === 'TODOS'
        ? normalizedLapTimes
        : normalizedLapTimes.filter((x) => x.game === generalGame)

    const unique = [...new Set(base.map((x) => x.track).filter(Boolean))]
    return ['TODOS', ...unique.sort((a, b) => a.localeCompare(b))]
  }, [normalizedLapTimes])

  const getAvailability = useCallback((bookingDate, bookingConfig, bookingDuration, editingBookingId) => {
    return getBookingAvailability(bookings, bookingDate, bookingConfig, bookingDuration, editingBookingId)
  }, [bookings])

  return {
    lapTimes,
    weeklyChallenge,
    monthlyChallenge,
    weeklyEntries,
    monthlyEntries,
    bookings,
    weeklyLeaderboard,
    monthlyLeaderboard,
    pointsLeaderboard,
    generalGames,
    getGeneralTracks,
    getGeneralSections,
    getAvailability,
    loadLapTimes,
    loadWeeklyChallenge,
    loadMonthlyChallenge,
    loadBookings,
    setWeeklyEntries,
    setMonthlyEntries,
  }
}