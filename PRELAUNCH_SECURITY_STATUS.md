# Prelaunch Security Status

Estado operativo del endurecimiento aplicado antes del lanzamiento de Patagonia SimRacing.

## Alcance ya resuelto

- `bookings` ya no se lee públicamente.
- La reserva pública usa `booking_availability`.
- Admin sigue leyendo, editando y eliminando `bookings` completos.
- `commercial_leads` quedó sin `select/update/delete` público.
- `points` quedó sin escritura pública.
- `lap_times` quedó con `select` público y escritura solo admin autenticado.
- `challenge_entries` quedó con `select` público y escritura solo admin autenticado.
- `weekly_challenges` quedó con `select` público y escritura solo admin autenticado.
- `monthly_challenges` quedó con `select` público y escritura solo admin autenticado.
- RPCs sensibles dejaron de estar expuestas a `public/anon`:
  - `psr_update_booking_safe`
  - `psr_delete_booking_safe`
  - `delete_weekly_challenge_safe`
  - `delete_monthly_challenge_safe`
  - `upsert_weekly_entry_safe`
  - `upsert_monthly_entry_safe`
- `psr_is_admin()` quedó ejecutable solo por `authenticated`.
- `booking_attempts` quedó con `insert` público controlado y `select` solo admin autenticado.

## Cambios de frontend ya aplicados

- Separación entre disponibilidad pública y reservas admin:
  - [App.jsx](C:/Users/patri/Desktop/patagonia-simracing/src/App.jsx)
  - [bookingPersistence.js](C:/Users/patri/Desktop/patagonia-simracing/src/utils/bookingPersistence.js)
- Vista SQL preparada para disponibilidad pública:
  - [booking_availability.sql](C:/Users/patri/Desktop/patagonia-simracing/supabase/booking_availability.sql)
- Snapshot SQL del hardening aplicado en Supabase:
  - [prelaunch_hardening.sql](C:/Users/patri/Desktop/patagonia-simracing/supabase/prelaunch_hardening.sql)
- Ajuste base responsive para mobile:
  - [index.css](C:/Users/patri/Desktop/patagonia-simracing/src/index.css)
  - [appStyles.js](C:/Users/patri/Desktop/patagonia-simracing/src/styles/appStyles.js)
  - [MainTabsNav.jsx](C:/Users/patri/Desktop/patagonia-simracing/src/components/MainTabsNav.jsx)

## Decisiones funcionales importantes

- En modo público, `Puntos` ya no suma puntos por reservas.
- En modo público, `Perfil piloto` ya no usa historial de reservas.
- En admin, ambas vistas siguen usando `bookings` completos.
- La reserva pública mantiene fallback a `bookings` solo si `booking_availability` no existe, pero la operación segura esperada es con la vista activa.

## Pendientes reales

- Versionar en SQL todas las políticas y grants que hoy ya quedaron corregidos directamente en Supabase.
- Revisar si `Puntos` y `Perfil piloto` públicos necesitan una identidad pública separada para volver a mostrar actividad sin exponer nombres reales desde reservas.
- Rotar credenciales de Supabase si el `.env` trackeado llegó a existir en un remoto o en historial compartido.
- Reducir tamaño del bundle principal si se quiere optimizar carga móvil.
- Confirmar que Vercel mantiene configuradas `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Production y Preview.

## Checklist post-deploy

1. Abrir la app pública en teléfono.
2. Confirmar que la pantalla abre ajustada al viewport sin necesidad de zoom manual.
3. Entrar a `Reservas` y verificar horarios disponibles.
4. Crear una reserva pública.
5. Confirmar que la reserva no rompe `Puntos` ni `Perfil piloto` públicos.
6. Entrar como admin.
7. Verificar que la nueva reserva aparece en tabla de reservas.
8. Editar una reserva.
9. Eliminar una reserva.
10. Crear, editar y borrar un tiempo en ranking general.
11. Crear, editar y borrar tiempos semanales y mensuales.
12. Crear y borrar un desafío semanal.
13. Crear y borrar un desafío mensual.
14. Abrir `BookingInsightsSection` en admin y confirmar que sigue cargando.

## Verificaciones locales ya pasadas

- `npm run lint`
- `npm run build`

La build sigue mostrando advertencia por chunk grande, pero no error de compilación.
