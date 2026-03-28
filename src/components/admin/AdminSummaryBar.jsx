import React from 'react';
import { formatCurrencyCLP } from '../../utils/formatters';

function SummaryCard({ title, value, helper }) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.72, marginBottom: 6, textAlign: 'center' }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>{value}</div>
      {helper ? <div style={{ fontSize: 12, opacity: 0.68, marginTop: 6, textAlign: 'center' }}>{helper}</div> : null}
    </div>
  );
}

export default function AdminSummaryBar({
  bookingCount = 0,
  todayRevenue = 0,
  activeWeeklyCount = 0,
  activeMonthlyCount = 0,
  pendingConflicts = 0,
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 10,
        width: '100%',
      }}
    >
      <SummaryCard title="Reservas" value={bookingCount} />
      <SummaryCard title="Ingresos" value={formatCurrencyCLP(todayRevenue)} />
      <SummaryCard title="Semanales activos" value={activeWeeklyCount} />
      <SummaryCard title="Mensuales activos" value={activeMonthlyCount} />
      <SummaryCard
        title="Conflictos" value={pendingConflicts}
        helper={pendingConflicts > 0 ? 'Revisar ahora' : 'Sin conflictos'}
      />
    </div>
  );
}
