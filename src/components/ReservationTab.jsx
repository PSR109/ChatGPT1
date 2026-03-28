import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  RESERVATION_KIND_OPTIONS,
  formatCurrency,
  getImmediateAvailability,
  summarizeBookings,
  validateBookingPayload,
  generateTimelineRows,
  minutesToTime,
  OPEN_MINUTES,
  CLOSE_MINUTES,
  normalizeBooking,
} from '../utils/bookingEngine';

const emptyForm = {
  id: null,
  client: '',
  phone: '',
  booking_date: new Date().toISOString().slice(0, 10),
  booking_time: '18:00',
  duration: 60,
  reservation_kind: 'standard-1',
  whatsapp_reminder: true,
  notes: '',
  total: 0,
};

const FIELD_CLASS = 'w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400';
const CHIP_BASE = 'rounded-xl border px-3 py-2 text-sm font-medium transition';
const CARD = 'rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-sm';

function calculateEstimate(kindId, duration) {
  const minutes = Number(duration) || 60;
  const rates = {
    standard: { q15: 9000, q30: 16000, h1: 28000 },
    pro: { q15: 10000, q30: 18000, h1: 32000 },
  };

  const configs = {
    'standard-1': { standard: 1, pro: 0 },
    'standard-2': { standard: 2, pro: 0 },
    'pro-1': { standard: 0, pro: 1 },
    'mixed-1-1': { standard: 1, pro: 1 },
    'all-3': { standard: 2, pro: 1 },
  };

  const cfg = configs[kindId] || configs['standard-1'];

  const calcUnit = (priceTable, totalMinutes) => {
    if (totalMinutes <= 15) return priceTable.q15;
    if (totalMinutes < 30) return priceTable.q15 + ((priceTable.h1 / 60) * (totalMinutes - 15));
    if (totalMinutes === 30) return priceTable.q30;
    if (totalMinutes < 60) return priceTable.q30 + ((priceTable.h1 / 60) * (totalMinutes - 30));
    return (priceTable.h1 / 60) * totalMinutes;
  };

  const total = (calcUnit(rates.standard, minutes) * cfg.standard) + (calcUnit(rates.pro, minutes) * cfg.pro);
  return Math.round(total);
}

function StatusBanner({ type = 'neutral', children }) {
  const variants = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    neutral: 'border-slate-700 bg-slate-800/70 text-slate-200',
  };

  return <div className={`rounded-xl border px-3 py-2 text-sm ${variants[type]}`}>{children}</div>;
}

function ReservationForm({ mode, form, setForm, bookings, onSubmit, onCancelEdit, saving }) {
  const availability = useMemo(
    () => getImmediateAvailability(form, bookings, form.id),
    [form, bookings]
  );

  const timelineRows = useMemo(
    () => generateTimelineRows(bookings, form.booking_date, form.booking_time),
    [bookings, form.booking_date, form.booking_time]
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      total: calculateEstimate(current.reservation_kind, current.duration),
    }));
  }, [setForm]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      total: calculateEstimate(current.reservation_kind, current.duration),
    }));
  }, [form.reservation_kind, form.duration, setForm]);

  const timeOptions = useMemo(() => {
    const options = [];
    for (let minute = OPEN_MINUTES; minute <= CLOSE_MINUTES - 15; minute += 15) {
      options.push(minutesToTime(minute));
    }
    return options;
  }, []);

  return (
    <div className={`${CARD} space-y-4`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{form.id ? 'Editar reserva' : 'Nueva reserva'}</h3>
          <p className="text-sm text-slate-400">Validación inmediata de horario, capacidad y conflicto.</p>
        </div>
        {form.id ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            Cancelar edición
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Cliente</label>
          <input className={FIELD_CLASS} value={form.client} onChange={(e) => setForm((s) => ({ ...s, client: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Teléfono / WhatsApp</label>
          <input className={FIELD_CLASS} value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Fecha</label>
          <input type="date" className={FIELD_CLASS} value={form.booking_date} onChange={(e) => setForm((s) => ({ ...s, booking_date: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Hora</label>
          <select className={FIELD_CLASS} value={form.booking_time} onChange={(e) => setForm((s) => ({ ...s, booking_time: e.target.value }))}>
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Duración (min)</label>
          <input type="number" min="15" step="15" className={FIELD_CLASS} value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: Number(e.target.value || 15) }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Total estimado</label>
          <div className={`${FIELD_CLASS} flex items-center`}>{formatCurrency(form.total)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-slate-300">Configuración de simuladores</div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {RESERVATION_KIND_OPTIONS.map((option) => {
            const active = form.reservation_kind === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setForm((s) => ({ ...s, reservation_kind: option.id }))}
                className={`${CHIP_BASE} ${active ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200' : 'border-white/10 bg-slate-950/50 text-slate-200 hover:bg-white/5'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatusBanner type={availability.conflicts.length ? 'error' : 'success'}>
          Estándar libres: <strong>{availability.standardFree}</strong>
        </StatusBanner>
        <StatusBanner type={availability.conflicts.length ? 'error' : 'success'}>
          Pro libres: <strong>{availability.proFree}</strong>
        </StatusBanner>
        <StatusBanner type="neutral">
          Vista horaria: 2h antes y 2h después del bloque elegido.
        </StatusBanner>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Notas internas</label>
        <textarea className={`${FIELD_CLASS} min-h-[90px]`} value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear reserva'}
        </button>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.whatsapp_reminder}
            onChange={(e) => setForm((s) => ({ ...s, whatsapp_reminder: e.target.checked }))}
          />
          Recordatorio WhatsApp
        </label>
      </div>

      <div className={`${CARD} bg-slate-950/40`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-white">Timeline</h4>
          <div className="text-xs text-slate-400">Solo visible para control operativo</div>
        </div>
        {timelineRows.length === 0 ? (
          <div className="text-sm text-slate-400">No hay reservas en esta ventana horaria.</div>
        ) : (
          <div className="space-y-2">
            {timelineRows.map((row) => (
              <div key={row.id} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between">
                <div className="font-medium text-white">{row.client}</div>
                <div className="text-slate-300">{row.range.startTime} - {row.range.endTime}</div>
                <div className="text-slate-400">E:{row.config.standard} | P:{row.config.pro}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mode !== 'admin' ? (
        <StatusBanner type="neutral">El usuario puede reservar, pero no ve la tabla completa de reservas.</StatusBanner>
      ) : null}
    </div>
  );
}

function ReservationAdminTable({ rows, onEdit, onDelete, deletingId }) {
  if (!rows.length) {
    return <div className={`${CARD} text-sm text-slate-400`}>No hay reservas registradas para esta fecha.</div>;
  }

  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950/70 text-slate-300">
            <tr>
              <th className="px-3 py-3 text-left font-medium">Hora</th>
              <th className="px-3 py-3 text-left font-medium">Cliente</th>
              <th className="px-3 py-3 text-left font-medium">Simuladores</th>
              <th className="px-3 py-3 text-left font-medium">Duración</th>
              <th className="px-3 py-3 text-left font-medium">Total</th>
              <th className="px-3 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10 text-slate-200">
                <td className="px-3 py-3">{row.booking_time}</td>
                <td className="px-3 py-3">{row.client}</td>
                <td className="px-3 py-3">E:{row.standard_simulators} | P:{row.pro_simulators}</td>
                <td className="px-3 py-3">{row.duration} min</td>
                <td className="px-3 py-3">{formatCurrency(row.total)}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onEdit(row)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">Editar</button>
                    <button type="button" onClick={() => onDelete(row.id)} disabled={deletingId === row.id} className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/10 disabled:opacity-60">{deletingId === row.id ? 'Eliminando...' : 'Eliminar'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationSummary({ rows }) {
  const summary = useMemo(() => summarizeBookings(rows), [rows]);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className={CARD}><div className="text-xs uppercase tracking-wide text-slate-400">Reservas</div><div className="mt-2 text-2xl font-semibold text-white">{summary.totalReservations}</div></div>
      <div className={CARD}><div className="text-xs uppercase tracking-wide text-slate-400">Ingresos</div><div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(summary.totalRevenue)}</div></div>
      <div className={CARD}><div className="text-xs uppercase tracking-wide text-slate-400">Uso estándar</div><div className="mt-2 text-2xl font-semibold text-white">{summary.standardMinutes} min</div></div>
      <div className={CARD}><div className="text-xs uppercase tracking-wide text-slate-400">Uso pro</div><div className="mt-2 text-2xl font-semibold text-white">{summary.proMinutes} min</div></div>
    </div>
  );
}

export default function ReservationTab({ mode = 'user' }) {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [banner, setBanner] = useState({ type: 'neutral', message: 'Listo para operar reservas.' });

  const filteredRows = useMemo(
    () => rows.filter((row) => row.booking_date === form.booking_date).sort((a, b) => a.booking_time.localeCompare(b.booking_time)),
    [rows, form.booking_date]
  );

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (error) {
      setBanner({ type: 'error', message: error.message });
      setLoading(false);
      return;
    }

    const normalized = (data || []).map((row) => {
      const item = normalizeBooking(row);
      return {
        ...row,
        booking_date: item.booking_date,
        booking_time: item.booking_time,
        duration: item.duration,
        standard_simulators: Number(row.standard_simulators ?? item.config.standard ?? 0),
        pro_simulators: Number(row.pro_simulators ?? item.config.pro ?? 0),
      };
    });

    setRows(normalized);
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm, booking_date: form.booking_date, total: calculateEstimate('standard-1', 60) });
  };

  const handleSubmit = async () => {
    setBanner({ type: 'neutral', message: 'Validando reserva...' });

    const estimate = calculateEstimate(form.reservation_kind, form.duration);
    const validation = validateBookingPayload({ ...form, total: estimate }, rows, form.id);
    if (!validation.valid) {
      setBanner({ type: 'error', message: validation.errors[0] });
      return;
    }

    const config = RESERVATION_KIND_OPTIONS.find((item) => item.id === form.reservation_kind);
    const payload = {
      client: form.client.trim(),
      phone: form.phone.trim(),
      booking_date: form.booking_date,
      booking_time: form.booking_time,
      duration: validation.duration,
      reservation_kind: form.reservation_kind,
      standard_simulators: config.standard,
      pro_simulators: config.pro,
      whatsapp_reminder: !!form.whatsapp_reminder,
      notes: form.notes?.trim() || null,
      total: estimate,
    };

    setSaving(true);

    const query = form.id
      ? supabase.from('bookings').update(payload).eq('id', form.id)
      : supabase.from('bookings').insert(payload);

    const { error } = await query;

    if (error) {
      setBanner({ type: 'error', message: error.message });
      setSaving(false);
      return;
    }

    await loadRows();
    setSaving(false);
    setBanner({ type: 'success', message: form.id ? 'Reserva actualizada correctamente.' : 'Reserva creada correctamente.' });
    resetForm();
  };

  const handleEdit = (row) => {
    const kind = row.reservation_kind || 'standard-1';
    setForm({
      id: row.id,
      client: row.client || '',
      phone: row.phone || '',
      booking_date: row.booking_date,
      booking_time: row.booking_time,
      duration: Number(row.duration || 60),
      reservation_kind: kind,
      whatsapp_reminder: !!row.whatsapp_reminder,
      notes: row.notes || '',
      total: Number(row.total || calculateEstimate(kind, row.duration || 60)),
    });
    setBanner({ type: 'neutral', message: `Editando reserva de ${row.client}.` });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      setBanner({ type: 'error', message: error.message });
      setDeletingId(null);
      return;
    }
    await loadRows();
    setDeletingId(null);
    setBanner({ type: 'success', message: 'Reserva eliminada correctamente.' });
    if (form.id === id) resetForm();
  };

  return (
    <section className="space-y-4">
      <ReservationSummary rows={filteredRows} />
      <StatusBanner type={banner.type}>{banner.message}</StatusBanner>
      <ReservationForm
        mode={mode}
        form={form}
        setForm={setForm}
        bookings={rows}
        onSubmit={handleSubmit}
        onCancelEdit={resetForm}
        saving={saving}
      />

      {mode === 'admin' ? (
        loading ? (
          <div className={CARD}>Cargando reservas...</div>
        ) : (
          <ReservationAdminTable rows={filteredRows} onEdit={handleEdit} onDelete={handleDelete} deletingId={deletingId} />
        )
      ) : null}
    </section>
  );
}
