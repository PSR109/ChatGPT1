/**
 * LEGACY / NO ACTIVO EN EL FLUJO PRINCIPAL
 * Archivo heredado del perfil de piloto.
 * No está conectado desde src/App.jsx ni desde la navegación principal actual.
 * No modificar como si fuera la capa principal.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  normalizeLapRow,
  normalizePointRow,
  filterRowsByPilot,
  computePilotMetrics,
  buildConsistencyFlags,
  formatLapTime,
  formatGap,
  formatDate,
} from '../utils/pilotProfileEngine';

const CARD = 'rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-sm';
const FIELD = 'w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400';

function Banner({ type = 'neutral', children }) {
  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    neutral: 'border-slate-700 bg-slate-800/70 text-slate-200',
  };
  return <div className={`rounded-xl border px-3 py-2 text-sm ${styles[type]}`}>{children}</div>;
}

function MetricCard({ label, value, hint }) {
  return (
    <div className={CARD}>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

function BestCombosTable({ rows }) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Mejores registros por combinación</h3>
        <div className="text-xs text-slate-400">Top interno del piloto</div>
      </div>
      {!rows.length ? (
        <div className="text-sm text-slate-400">Sin registros para mostrar.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-slate-300">
              <tr>
                <th className="px-3 py-3 text-left font-medium">Juego</th>
                <th className="px-3 py-3 text-left font-medium">Circuito</th>
                <th className="px-3 py-3 text-left font-medium">Auto</th>
                <th className="px-3 py-3 text-left font-medium">Tiempo</th>
                <th className="px-3 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.id}-${row.game}-${row.circuit}`} className="border-t border-white/10 text-slate-200">
                  <td className="px-3 py-3">{row.game}</td>
                  <td className="px-3 py-3">{row.circuit}</td>
                  <td className="px-3 py-3">{row.car}</td>
                  <td className="px-3 py-3 font-medium text-white">{formatLapTime(row.timeMs)}</td>
                  <td className="px-3 py-3 text-slate-400">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RecentLapsTable({ rows }) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Últimos tiempos</h3>
        <div className="text-xs text-slate-400">Más recientes primero</div>
      </div>
      {!rows.length ? (
        <div className="text-sm text-slate-400">Sin tiempos recientes.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-slate-300">
              <tr>
                <th className="px-3 py-3 text-left font-medium">Juego</th>
                <th className="px-3 py-3 text-left font-medium">Circuito</th>
                <th className="px-3 py-3 text-left font-medium">Tiempo</th>
                <th className="px-3 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.id}-${row.createdAt || 'recent'}`} className="border-t border-white/10 text-slate-200">
                  <td className="px-3 py-3">{row.game}</td>
                  <td className="px-3 py-3">{row.circuit}</td>
                  <td className="px-3 py-3 font-medium text-white">{formatLapTime(row.timeMs)}</td>
                  <td className="px-3 py-3 text-slate-400">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PilotProfileTab() {
  const [query, setQuery] = useState('');
  const [selectedPilot, setSelectedPilot] = useState('');
  const [lapRows, setLapRows] = useState([]);
  const [pointRows, setPointRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: 'neutral', message: 'Perfil listo para buscar piloto.' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [lapsRes, pointsRes] = await Promise.all([
        supabase.from('lap_times').select('*').order('created_at', { ascending: false }),
        supabase.from('points').select('*'),
      ]);

      if (lapsRes.error) {
        setBanner({ type: 'error', message: lapsRes.error.message });
        setLoading(false);
        return;
      }

      if (pointsRes.error) {
        setBanner({ type: 'warning', message: 'Se cargaron tiempos, pero no fue posible leer puntos.' });
      }

      const normalizedLaps = (lapsRes.data || []).map(normalizeLapRow).filter((row) => row.pilot);
      const normalizedPoints = (pointsRes.data || []).map(normalizePointRow).filter((row) => row.pilot);
      setLapRows(normalizedLaps);
      setPointRows(normalizedPoints);

      if (normalizedLaps.length) {
        const topPilot = normalizedLaps[0].pilot;
        setQuery(topPilot);
        setSelectedPilot(topPilot);
      }

      setLoading(false);
    };

    load();
  }, []);

  const pilotOptions = useMemo(() => {
    const unique = new Map();
    for (const row of lapRows) {
      const key = String(row.pilot || '').trim().toLowerCase();
      if (key && !unique.has(key)) unique.set(key, row.pilot);
    }
    return [...unique.values()].sort((a, b) => a.localeCompare(b, 'es'));
  }, [lapRows]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pilotOptions.slice(0, 8);
    return pilotOptions.filter((name) => name.toLowerCase().includes(q)).slice(0, 8);
  }, [pilotOptions, query]);

  const profileLaps = useMemo(() => filterRowsByPilot(lapRows, selectedPilot), [lapRows, selectedPilot]);
  const profilePoints = useMemo(() => filterRowsByPilot(pointRows, selectedPilot), [pointRows, selectedPilot]);
  const metrics = useMemo(() => computePilotMetrics(profileLaps, lapRows, profilePoints), [profileLaps, lapRows, profilePoints]);
  const flags = useMemo(() => buildConsistencyFlags(metrics), [metrics]);

  return (
    <section className="space-y-4">
      <div className={CARD}>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Perfil de piloto</h2>
              <p className="text-sm text-slate-400">Búsqueda rápida, métricas claras y consistencia con rankings y puntos.</p>
            </div>
            <div className="relative">
              <input
                className={FIELD}
                placeholder="Buscar piloto"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? (
                <div className="absolute z-10 mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-xl">
                  {filteredOptions.length ? (
                    filteredOptions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setSelectedPilot(name);
                          setQuery(name);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/5"
                      >
                        <span>{name}</span>
                        <span className="text-xs text-slate-500">ver perfil</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-400">No hay coincidencias.</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Piloto activo</div>
            <div className="mt-2 text-2xl font-semibold text-white">{selectedPilot || 'Sin selección'}</div>
            <div className="mt-2 text-sm text-slate-400">
              Mejor tiempo: {metrics.personalBest ? formatLapTime(metrics.personalBest.timeMs) : '—'}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Mejor combo: {metrics.personalBest ? `${metrics.personalBest.game} · ${metrics.personalBest.circuit}` : '—'}
            </div>
          </div>
        </div>
      </div>

      <Banner type={banner.type}>{banner.message}</Banner>
      {flags.map((flag) => <Banner key={flag.text} type={flag.type}>{flag.text}</Banner>)}

      {loading ? (
        <div className={CARD}>Cargando perfil...</div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Tiempos válidos" value={metrics.totalLaps} />
            <MetricCard label="Juegos" value={metrics.gamesCount} />
            <MetricCard label="Circuitos" value={metrics.circuitsCount} />
            <MetricCard label="Puntos" value={metrics.points.total || 0} />
            <MetricCard label="Posición" value={metrics.globalPosition || '—'} hint={metrics.personalBest ? `${metrics.personalBest.game} · ${metrics.personalBest.circuit}` : undefined} />
            <MetricCard label="Gap líder" value={formatGap(metrics.gapToLeader)} />
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <MetricCard label="Puntos ranking" value={metrics.points.ranking || 0} />
            <MetricCard label="Puntos desafíos" value={metrics.points.challenges || 0} />
            <MetricCard label="Puntos reservas" value={metrics.points.bookings || 0} />
          </div>

          <BestCombosTable rows={metrics.bestCombos} />
          <RecentLapsTable rows={metrics.recentLaps} />
        </>
      )}
    </section>
  );
}
