export const formatCurrencyCLP = (value) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (value) => {
  if (!value) return '—';

  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export const formatGap = (milliseconds) => {
  const numeric = Number(milliseconds);
  if (!Number.isFinite(numeric) || numeric <= 0) return '—';
  return `+${(numeric / 1000).toFixed(3)}s`;
};

export const safeText = (value, fallback = '—') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};
