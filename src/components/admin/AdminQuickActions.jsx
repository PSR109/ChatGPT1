import React from 'react';

const baseButtonStyle = {
  minHeight: 42,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  cursor: 'pointer',
  fontWeight: 600,
};

export default function AdminQuickActions({
  onCreateWeekly,
  onCreateMonthly,
  onOpenBookings,
  onOpenPoints,
  onOpenRankings,
  disabled = false,
}) {
  const actions = [
    { key: 'weekly', label: 'Nuevo desafío semanal', onClick: onCreateWeekly },
    { key: 'monthly', label: 'Nuevo desafío mensual', onClick: onCreateMonthly },
    { key: 'bookings', label: 'Ir a reservas', onClick: onOpenBookings },
    { key: 'points', label: 'Ir a puntos', onClick: onOpenPoints },
    { key: 'rankings', label: 'Ir a rankings', onClick: onOpenRankings },
  ].filter((action) => typeof action.onClick === 'function');

  if (!actions.length) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
        width: '100%',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={action.onClick}
          disabled={disabled}
          style={{
            ...baseButtonStyle,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
