# PostHog — activación (5 min, Patricio)

PostHog mide **qué hace la gente en patagoniasimracing.cl**: embudo (visita → ve precios → clic WhatsApp), grabación de sesiones (session replay), mapas de calor. Cierra el hueco "no sé por qué se van sin escribir".

El código ya está integrado (`src/utils/tracking.js`). **Es inerte hasta que pongas la key** — sin `VITE_POSTHOG_KEY` no carga nada, no rompe nada. Mismo patrón que GA4/Meta/TikTok.

## Pasos

1. **Crear cuenta** en https://us.posthog.com/signup (gratis, sin tarjeta). Cloud US.
2. Al entrar, crea/usa el proyecto **"Patagonia SimRacing"**.
3. **Project settings → copia la "Project API Key"** (empieza con `phc_...`).
   - Esta key es PÚBLICA (va en el bundle del sitio, como el píxel de Meta/GA4). No es secreto.
4. **Vercel → proyecto de la web → Settings → Environment Variables**, agrega:
   - `VITE_POSTHOG_KEY` = `phc_...` (la key del paso 3)
   - (opcional) `VITE_POSTHOG_HOST` = `https://us.i.posthog.com` (ya es el default, solo si usas otra región)
   - Aplica a Production (y Preview si quieres probar antes).
5. **Redeploy** (Vercel → Deployments → Redeploy, o el merge de este branch lo gatilla).
6. **Session replay**: PostHog → Settings → "Session Replay" → activa "Record user sessions".
7. **Funnel**: PostHog → Funnels → nuevo:
   - Paso 1: `$pageview` (autocaptura)
   - Paso 2: evento `wa_contact` (clic a WhatsApp = conversión)
   - Eso te da el % real visita→WhatsApp y dónde se cae.

## Qué se mide solo (sin tocar más código)

- **Autocapture**: todos los clics, pageviews, scroll — sin instrumentar.
- **`wa_contact`** `{context}`: clic a cualquier link wa.me (hero, FAB, paquetes, motor de reserva — cubierto por el listener global). = conversión clave.
- **`share`** `{context}`: clic en "Reta a un amigo" (share viral, NO es contacto a PSR).

## Verificar que quedó andando

Tras redeploy con la key: abre la web, toca WhatsApp, y en PostHog → Activity / Events debería aparecer `wa_contact` en segundos. Si no aparece, revisa que `VITE_POSTHOG_KEY` esté en el env de Production y que hubo redeploy.

## Paso 8 — atribución por canal (UTM, sin tocar código)

PostHog autocaptura `utm_source/medium/campaign`. Para saber **qué red** trajo cada conversión, usa los links con UTM al pegar el sitio en cada perfil (IG/TikTok bio, botón web de GBP, campo Website de TripAdvisor). Links listos en **`UTM_LINKS.md`**. Luego en PostHog → Funnels → `$pageview` → `wa_contact`, segmenta por `utm_source` = % visita→WhatsApp por canal.

OJO: UTM solo sirve si el link apunta a la web. Bio que va directo a `wa.me` → esa conversión la cierra el **reel-code en el cobro SumUp**, no PostHog.
