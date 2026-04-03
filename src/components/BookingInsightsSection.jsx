import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../db.js'

function getWeekdayLabel(dateString) {
  if (!dateString) return 'Sin fecha'
  const date = new Date(`${dateString}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return date.toLocaleDateString('es-CL', { weekday: 'long' })
}

function getAttemptStatus(row = {}) {
  return String(row?.attempt_status || row?.status || 'unknown').trim().toLowerCase()
}

function getAttemptReason(row = {}) {
  return String(row?.reason_code || row?.reason || '').trim().toLowerCase() || 'sin detalle'
}

function getAttemptSource(row = {}) {
  return String(row?.source || '').trim().toLowerCase() || 'sin origen'
}

function formatReasonLabel(reason = '') {
  const labels = {
    created: 'Creada',
    updated: 'Actualizada',
    local_conflict: 'Conflicto local',
    live_conflict: 'Conflicto en vivo',
    create_live_conflict: 'Conflicto al crear',
    update_live_conflict: 'Conflicto al editar',
    validation_error: 'Validación fallida',
    live_validation_error: 'Validación en vivo fallida',
    incomplete_required_fields: 'Formulario incompleto',
    create_error: 'Error al crear',
    update_error: 'Error al editar',
    stale_edit_snapshot: 'Edición desactualizada',
    create_revalidation_unavailable: 'Sin revalidación al crear',
    update_revalidation_unavailable: 'Sin revalidación al editar',
    live_validation_unavailable: 'Sin validación en vivo',
    update_missing_before_save: 'Reserva ya no existía',
    deleted: 'Eliminada',
    delete_cancelled: 'Eliminación cancelada',
    delete_error: 'Error al eliminar',
    delete_precheck_error: 'Error antes de eliminar',
    delete_missing_after_snapshot: 'Ya eliminada al confirmar',
    stale_delete_snapshot: 'Borrado desactualizado',
    rpc_unavailable: 'RPC segura no disponible',
    update_rollback_failed: 'Rollback fallido al editar',
    unexpected_create_error: 'Error inesperado al crear',
    unexpected_update_error: 'Error inesperado al editar',
    user_back: 'Volvió al paso anterior',
    user_cancel: 'Canceló reserva en curso',
    user_back_edit: 'Salió de edición con volver',
    user_cancel_edit: 'Canceló edición',
    user_abandoned: 'Abandonó flujo',
    user_cancelled: 'Canceló flujo',
    sin_detalle: 'Sin detalle',
  }

  return labels[reason] || reason.replaceAll('_', ' ')
}

function formatSourceLabel(source = '') {
  const labels = {
    booking_flow: 'Flujo de reservas',
    public_create: 'Reserva pública',
    public_draft: 'Borrador público',
    admin_create: 'Creación admin',
    admin_update: 'Edición admin',
    admin_delete: 'Borrado admin',
    sin_origen: 'Sin origen',
  }

  return labels[source] || source.replaceAll('_', ' ')
}

function formatStatusLabel(status = '') {
  const labels = {
    confirmed: 'Confirmadas',
    failed: 'Fallidas',
    abandoned: 'Abandonadas',
    unknown: 'Sin estado',
  }

  return labels[status] || status.replaceAll('_', ' ')
}

function buildGroupedCounts(rows = [], getter, formatter = (value) => value || 'Sin dato') {
  const counts = new Map()

  rows.forEach((row) => {
    const rawValue = getter(row)
    const key = formatter(rawValue)
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || String(a.label).localeCompare(String(b.label)))
}

function calculateRate(part, total) {
  if (!Number.isFinite(total) || total <= 0) return '0%'
  return `${Math.round((Number(part || 0) / total) * 100)}%`
}

function isDemandRow(row) {
  const source = getAttemptSource(row)
  return source === 'public_create' || source === 'public_draft'
}

function isCommercialDemandRow(row) {
  const kind = String(row?.reservation_kind || '').trim().toUpperCase()
  return kind === 'EVENTO' || kind === 'EMPRESA'
}

const cardStyle = {
  background: 'rgba(15, 23, 42, 0.92)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 16,
  padding: 16,
  marginTop: 16,
}

const sectionTitleStyle = {
  margin: '0 0 12px',
  fontSize: 18,
  color: '#ffffff',
}

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
  marginBottom: 12,
}

const statCardStyle = {
  background: 'rgba(30, 41, 59, 0.55)',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  borderRadius: 12,
  padding: 12,
  display: 'grid',
  gap: 4,
}

const statValueStyle = {
  color: '#fff',
  fontSize: 24,
  fontWeight: 900,
  lineHeight: 1,
}

const statLabelStyle = {
  color: '#94a3b8',
  fontSize: 12,
  fontWeight: 700,
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
}

const boxStyle = {
  background: 'rgba(30, 41, 59, 0.55)',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  borderRadius: 12,
  padding: 12,
}

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 0',
  borderBottom: '1px solid rgba(148, 163, 184, 0.10)',
  fontSize: 14,
  color: '#dbe4ff',
}

const helperStyle = {
  margin: '8px 0 0',
  fontSize: 13,
  color: '#94a3b8',
}

export default function BookingInsightsSection() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('booking_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (cancelled) return

      if (error) {
        setRows([])
        setError('No se pudo cargar booking_attempts.')
        setLoading(false)
        return
      }

      setRows(Array.isArray(data) ? data : [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const totalAttempts = rows.length
  const confirmedCount = useMemo(() => rows.filter((row) => getAttemptStatus(row) === 'confirmed').length, [rows])
  const failedCount = useMemo(() => rows.filter((row) => getAttemptStatus(row) === 'failed').length, [rows])
  const abandonedCount = useMemo(() => rows.filter((row) => getAttemptStatus(row) === 'abandoned').length, [rows])
  const publicDemandRows = useMemo(() => rows.filter((row) => isDemandRow(row)), [rows])
  const publicDemandCount = publicDemandRows.length
  const publicConfirmedCount = useMemo(() => publicDemandRows.filter((row) => getAttemptStatus(row) === 'confirmed').length, [publicDemandRows])
  const publicFailedCount = useMemo(() => publicDemandRows.filter((row) => getAttemptStatus(row) === 'failed').length, [publicDemandRows])
  const publicAbandonedCount = useMemo(() => publicDemandRows.filter((row) => getAttemptStatus(row) === 'abandoned').length, [publicDemandRows])
  const commercialLeadCount = useMemo(() => publicDemandRows.filter((row) => isCommercialDemandRow(row)).length, [publicDemandRows])
  const conversionRate = useMemo(() => calculateRate(publicConfirmedCount, publicDemandCount), [publicConfirmedCount, publicDemandCount])
  const frictionRate = useMemo(() => calculateRate(publicFailedCount + publicAbandonedCount, publicDemandCount), [publicFailedCount, publicAbandonedCount, publicDemandCount])

  const topHours = useMemo(
    () => buildGroupedCounts(rows.filter((row) => getAttemptStatus(row) === 'failed'), (row) => row?.booking_time).slice(0, 5),
    [rows]
  )

  const topDays = useMemo(
    () => buildGroupedCounts(rows.filter((row) => getAttemptStatus(row) === 'failed'), (row) => row?.booking_date, getWeekdayLabel).slice(0, 5),
    [rows]
  )

  const topReasons = useMemo(
    () => buildGroupedCounts(rows, getAttemptReason, (value) => formatReasonLabel(String(value || '').replaceAll(' ', '_'))).slice(0, 6),
    [rows]
  )

  const statusBreakdown = useMemo(
    () => buildGroupedCounts(rows, getAttemptStatus, formatStatusLabel).slice(0, 4),
    [rows]
  )

  const sourceBreakdown = useMemo(
    () => buildGroupedCounts(rows, getAttemptSource, (value) => formatSourceLabel(String(value || '').replaceAll(' ', '_'))).slice(0, 5),
    [rows]
  )

  const missingClientCount = useMemo(() => rows.filter((row) => !String(row?.client || '').trim()).length, [rows])
  const missingPhoneCount = useMemo(() => rows.filter((row) => !String(row?.phone || '').trim()).length, [rows])
  const missingSimulatorCount = useMemo(() => rows.filter((row) => Number(row?.simulators || 0) <= 0).length, [rows])

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitleStyle}>Demanda detectada</h3>

      {loading ? <div style={helperStyle}>Cargando datos de reservas...</div> : null}
      {!loading && error ? <div style={helperStyle}>{error}</div> : null}
      {!loading && !error && rows.length === 0 ? (
        <div style={helperStyle}>Todavía no hay datos en booking_attempts.</div>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <>
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{totalAttempts}</span>
              <span style={statLabelStyle}>Intentos totales</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{publicDemandCount}</span>
              <span style={statLabelStyle}>Demanda pública</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{conversionRate}</span>
              <span style={statLabelStyle}>Conversión pública</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{frictionRate}</span>
              <span style={statLabelStyle}>Fricción pública</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{confirmedCount}</span>
              <span style={statLabelStyle}>Confirmadas</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{failedCount}</span>
              <span style={statLabelStyle}>Fallidas</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{abandonedCount}</span>
              <span style={statLabelStyle}>Abandonadas</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{commercialLeadCount}</span>
              <span style={statLabelStyle}>Leads evento/empresa</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{missingClientCount}</span>
              <span style={statLabelStyle}>Sin cliente</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{missingPhoneCount}</span>
              <span style={statLabelStyle}>Sin WhatsApp</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{missingSimulatorCount}</span>
              <span style={statLabelStyle}>Sin simuladores</span>
            </div>
          </div>

          <div style={gridStyle}>
            <div style={boxStyle}>
              <strong style={{ color: '#fff' }}>Horarios con más conflicto</strong>
              <div style={{ marginTop: 8 }}>
                {topHours.map((item) => (
                  <div key={item.label} style={itemStyle}>
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={boxStyle}>
              <strong style={{ color: '#fff' }}>Días con más conflicto</strong>
              <div style={{ marginTop: 8 }}>
                {topDays.map((item) => (
                  <div key={item.label} style={itemStyle}>
                    <span style={{ textTransform: 'capitalize' }}>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={boxStyle}>
              <strong style={{ color: '#fff' }}>Motivos principales</strong>
              <div style={{ marginTop: 8 }}>
                {topReasons.map((item) => (
                  <div key={item.label} style={itemStyle}>
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={boxStyle}>
              <strong style={{ color: '#fff' }}>Estados de intentos</strong>
              <div style={{ marginTop: 8 }}>
                {statusBreakdown.map((item) => (
                  <div key={item.label} style={itemStyle}>
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={boxStyle}>
              <strong style={{ color: '#fff' }}>Origen de actividad</strong>
              <div style={{ marginTop: 8 }}>
                {sourceBreakdown.map((item) => (
                  <div key={item.label} style={itemStyle}>
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={helperStyle}>
            Base: últimos {rows.length} registros guardados en booking_attempts. Conversión pública = confirmadas / demanda pública. Fricción pública = fallidas + abandonadas / demanda pública.
          </div>
        </>
      ) : null}
    </div>
  )
}
