export const APP_TABS = [
  { key: 'ranking-general', label: 'Ranking general' },
  { key: 'ranking-semanal', label: 'Ranking semanal' },
  { key: 'ranking-mensual', label: 'Ranking mensual' },
  { key: 'puntos', label: 'Puntos' },
  { key: 'reservas', label: 'Reservas' },
];

export const SIDE_TABS = [{ key: 'perfil-piloto', label: 'Perfil de piloto' }];

export const STATUS_TEXT = {
  loading: 'Cargando…',
  empty: 'Sin datos',
  error: 'Ocurrió un error',
  success: 'Guardado correctamente',
  conflict: 'Existe un conflicto con otra reserva',
};

export const BOOKING_TEXT = {
  title: 'Reservas',
  create: 'Crear reserva',
  update: 'Guardar cambios',
  delete: 'Eliminar',
  noRows: 'No hay reservas para mostrar',
  summaryRevenue: 'Ingresos',
  summaryBookings: 'Reservas',
  summarySimulators: 'Uso de simuladores',
};

export const ADMIN_TEXT = {
  title: 'Panel admin',
  quickActions: 'Acciones rápidas',
  recentActivity: 'Actividad reciente',
  criticalControls: 'Controles críticos',
  noActivity: 'Sin actividad reciente',
};

export const PILOT_PROFILE_TEXT = {
  title: 'Perfil de piloto',
  searchPlaceholder: 'Buscar piloto',
  bestLap: 'Mejor tiempo',
  bestCombo: 'Mejor combinación',
  rankingPosition: 'Posición',
  totalPoints: 'Puntos',
  totalLaps: 'Tiempos registrados',
};

export const normalizeLabel = (value) => {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
};
