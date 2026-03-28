const NAME_KEYS = ['pilot', 'pilot_name', 'driver', 'driver_name', 'name', 'client', 'username'];
const GAME_KEYS = ['game', 'title'];
const CIRCUIT_KEYS = ['circuit', 'track', 'stage', 'etapa'];
const CAR_KEYS = ['car', 'vehicle', 'auto'];
const COUNTRY_KEYS = ['country', 'pais'];
const TIME_KEYS = ['time_ms', 'lap_time_ms', 'time', 'lap_time', 'best_time'];
const DATE_KEYS = ['created_at', 'inserted_at', 'date', 'booking_date'];

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return null;
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function timeToMs(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1000 ? value : Math.round(value * 1000);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);

  const parts = raw.split(':');
  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1].replace(',', '.'));
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2].replace(',', '.'));
    if (Number.isFinite(hours) && Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
    }
  }

  return null;
}

export function formatLapTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
}

export function formatGap(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  return `+${(ms / 1000).toFixed(3)}s`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function normalizeLapRow(row) {
  return {
    id: row.id,
    pilot: pick(row, NAME_KEYS),
    game: pick(row, GAME_KEYS) || 'Sin juego',
    circuit: pick(row, CIRCUIT_KEYS) || 'Sin circuito',
    car: pick(row, CAR_KEYS) || '—',
    country: pick(row, COUNTRY_KEYS) || '—',
    timeMs: timeToMs(pick(row, TIME_KEYS)),
    createdAt: pick(row, DATE_KEYS),
    raw: row,
  };
}

export function normalizePointRow(row) {
  const pilot = pick(row, NAME_KEYS);
  const total = Number(row.total_points ?? row.points ?? row.total ?? 0) || 0;
  return {
    id: row.id,
    pilot,
    total,
    ranking: Number(row.general_points ?? row.ranking_points ?? row.points_general ?? 0) || 0,
    challenges: Number(row.challenge_points ?? row.challenges_points ?? row.points_challenges ?? 0) || 0,
    bookings: Number(row.booking_points ?? row.reservation_points ?? row.points_bookings ?? 0) || 0,
    raw: row,
  };
}

export function filterRowsByPilot(rows, pilotName) {
  const target = normalizeText(pilotName);
  return rows.filter((row) => normalizeText(row.pilot).includes(target));
}

export function computePilotMetrics(laps, allLaps, pointRows) {
  const validLaps = laps.filter((lap) => Number.isFinite(lap.timeMs) && lap.timeMs > 0);
  const sortedByTime = [...validLaps].sort((a, b) => a.timeMs - b.timeMs);
  const sortedRecent = [...validLaps].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const byComboMap = new Map();
  for (const lap of validLaps) {
    const key = `${normalizeText(lap.game)}__${normalizeText(lap.circuit)}`;
    const existing = byComboMap.get(key);
    if (!existing || lap.timeMs < existing.timeMs) byComboMap.set(key, lap);
  }
  const bestCombos = [...byComboMap.values()].sort((a, b) => a.timeMs - b.timeMs);

  const games = new Set(validLaps.map((lap) => lap.game));
  const circuits = new Set(validLaps.map((lap) => lap.circuit));

  const personalBest = sortedByTime[0] || null;
  let globalPosition = null;
  let gapToLeader = null;

  if (personalBest) {
    const sameCombo = allLaps
      .filter((lap) => Number.isFinite(lap.timeMs) && normalizeText(lap.game) === normalizeText(personalBest.game) && normalizeText(lap.circuit) === normalizeText(personalBest.circuit))
      .sort((a, b) => a.timeMs - b.timeMs);

    const uniquePilots = [];
    const seen = new Set();
    for (const lap of sameCombo) {
      const pilotKey = normalizeText(lap.pilot);
      if (!pilotKey || seen.has(pilotKey)) continue;
      seen.add(pilotKey);
      uniquePilots.push(lap);
    }

    globalPosition = uniquePilots.findIndex((lap) => normalizeText(lap.pilot) === normalizeText(personalBest.pilot)) + 1 || null;
    if (uniquePilots[0]) gapToLeader = Math.max(0, personalBest.timeMs - uniquePilots[0].timeMs);
  }

  const points = pointRows[0] || { total: 0, ranking: 0, challenges: 0, bookings: 0 };

  return {
    totalLaps: validLaps.length,
    gamesCount: games.size,
    circuitsCount: circuits.size,
    personalBest,
    recentLaps: sortedRecent.slice(0, 8),
    bestCombos: bestCombos.slice(0, 10),
    globalPosition,
    gapToLeader,
    points,
  };
}

export function buildConsistencyFlags(metrics) {
  const flags = [];
  if (!metrics.totalLaps) flags.push({ type: 'neutral', text: 'El piloto no tiene tiempos válidos todavía.' });
  if (metrics.totalLaps > 0 && !metrics.points.total) flags.push({ type: 'warning', text: 'Tiene tiempos registrados pero sin puntos acumulados visibles.' });
  if (metrics.points.total > 0 && !metrics.totalLaps) flags.push({ type: 'warning', text: 'Tiene puntos pero no aparecen tiempos asociados.' });
  if (metrics.globalPosition === 1) flags.push({ type: 'success', text: 'Su mejor registro actual aparece como líder de su combinación principal.' });
  return flags;
}
