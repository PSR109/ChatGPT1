import React, { useEffect, useState } from 'react';

const baseButtonStyle = {
  minHeight: 46,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.04)',
  cursor: 'pointer',
  fontWeight: 700,
  color: '#ffffff',
  textAlign: 'center',
  width: '100%',
};

export default function AdminQuickActions({
  onCreateWeekly,
  onCreateMonthly,
  onOpenBookings,
  onOpenPoints,
  onOpenRankings,
  disabled = false,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

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
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
        width: '100%',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.key}
          type='button'
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
