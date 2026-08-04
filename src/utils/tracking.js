/**
 * Capa de medición + remarketing. Carga Meta Pixel, TikTok Pixel y GA4 SOLO si
 * sus IDs están en las env (VITE_*) — sin IDs es no-op (no rompe nada). Dispara
 * el evento "Contact" en CADA clic a un link wa.me (listener global, cubre hero,
 * FAB, paquetes, motor sin tocar cada componente). Base para audiencias,
 * lookalikes y medir reel/ad -> reserva.
 *
 * IDs por defecto (medición LIVE 2026-06-12): GA4 propiedad "Patagonia SimRacing"
 * (cuenta a162931288) + Meta dataset "PSR Web Patagonia SimRacing" (business
 * 622521433632301). Son IDs de medición PÚBLICOS (van en el bundle de cualquier
 * sitio con píxel) — no son secretos. Una env VITE_* en Vercel los sobreescribe.
 * TikTok: píxel "PSR Web Patagonia SimRacing" (ads account 7501378064899719169).
 */

const META_ID = import.meta.env.VITE_META_PIXEL_ID || '1736361921055510'
const TIKTOK_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID || 'D8M6HEJC77U235SQNT20'
const GA4_ID = import.meta.env.VITE_GA4_ID || 'G-DG56H908WW'
// PostHog: product/web analytics + session replay + heatmaps + funnels.
// Project API Key PÚBLICA (va en el bundle como el píxel de Meta/GA4) — no es
// secreto. Default = key del proyecto "Patagonia SimRacing" (PSR109). Una env
// VITE_POSTHOG_KEY en Vercel la sobreescribe (rotación/override).
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_wZ3HyC8sWsQFiCNTetWJniU724XtRyfDQ5n2qXFVsSdZ'
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

function loadMetaPixel(id) {
  if (window.fbq) return
   
  ;(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []
    t = b.createElement(e); t.async = !0; t.src = v
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
   
  window.fbq('init', id)
  window.fbq('track', 'PageView')
}

function loadTikTokPixel(id) {
  if (window.ttq) return
   
  ;(function (w, d, t) {
    w.TiktokAnalyticsObject = t
    var ttq = (w[t] = w[t] || [])
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']
    ttq.setAndDefer = function (e, n) { e[n] = function () { e.push([n].concat(Array.prototype.slice.call(arguments, 0))) } }
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i])
    ttq.instance = function (e) { for (var n = ttq._i[e] || [], i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(n, ttq.methods[i]); return n }
    ttq.load = function (e, n) {
      var r = 'https://analytics.tiktok.com/i18n/pixel/events.js'
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date()
      ttq._o = ttq._o || {}; ttq._o[e] = n || {}
      var o = d.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = r + '?sdkid=' + e + '&lib=' + t
      var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a)
    }
    ttq.load(id); ttq.page()
  })(window, document, 'ttq')
   
}

function loadGA4(id) {
  if (window.gtag) return
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', id)
}

// Stub oficial de PostHog (de-minificado): encola llamadas hasta que array.js
// carga, luego inyecta el script async desde el CDN de assets. autocapture +
// pageviews salen sin instrumentar nada; session replay se activa con el toggle
// "Record user sessions" en el panel de PostHog. Sin key, nunca se llama (no-op).
function loadPostHog(key, host) {
  if (window.posthog && window.posthog.__SV) return
  const ph = (window.posthog = window.posthog || [])
  ph._i = []
  ph.init = function (token, cfg, name) {
    function stub(target, method) {
      const parts = method.split('.')
      let t = target
      let m = method
      if (parts.length === 2) { t = target[parts[0]]; m = parts[1] }
      t[m] = function () { t.push([m].concat(Array.prototype.slice.call(arguments, 0))) }
    }
    const el = document.createElement('script')
    el.type = 'text/javascript'
    el.crossOrigin = 'anonymous'
    el.async = true
    el.src = cfg.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js'
    const first = document.getElementsByTagName('script')[0]
    first.parentNode.insertBefore(el, first)
    let u = ph
    if (name !== undefined) u = ph[name] = []
    else name = 'posthog'
    u.people = u.people || []
    u.toString = function (x) {
      let s = 'posthog'
      if (name !== 'posthog') s += '.' + name
      if (!x) s += ' (stub)'
      return s
    }
    u.people.toString = function () { return u.toString(1) + '.people (stub)' }
    const methods = 'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags identify setPersonProperties group resetGroups reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording captureException opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing debug'.split(' ')
    for (let i = 0; i < methods.length; i++) stub(u, methods[i])
    ph._i.push([token, cfg, name])
  }
  ph.__SV = 1
  ph.init(key, { api_host: host, person_profiles: 'identified_only' })
}

/** Evento de conversión clave: el usuario hace clic para escribir por WhatsApp. */
export function trackContact(context = 'whatsapp') {
  try { if (window.fbq) window.fbq('track', 'Contact', { context }) } catch { /* no-op */ }
  try { if (window.ttq) window.ttq.track('Contact', { context }) } catch { /* no-op */ }
  try { if (window.gtag) window.gtag('event', 'contact', { method: 'whatsapp', context }) } catch { /* no-op */ }
  try { if (window.posthog) window.posthog.capture('wa_contact', { context }) } catch { /* no-op */ }
}

/**
 * Clic hacia la TIENDA digital (configuracion.patagoniasimracing.cl).
 *
 * NO es un Contact: nadie escribió por WhatsApp ni reservó. Es la salida del
 * embudo del simcenter hacia el único checkout vivo del portafolio, y es el
 * paso que hoy no se medía en ninguna parte — la tienda ve la visita en su
 * propio Cloudflare Web Analytics, pero acá no quedaba registro de CUÁNTA gente
 * y desde QUÉ emplazamiento se va a comprar. Sin este evento no se puede
 * comparar si convierte más el bloque del home o la landing /simracers.
 */
export function trackStoreClick(context = 'store') {
  try { if (window.fbq) window.fbq('trackCustom', 'StoreClick', { context }) } catch { /* no-op */ }
  try { if (window.ttq) window.ttq.track('ClickButton', { context }) } catch { /* no-op */ }
  try { if (window.gtag) window.gtag('event', 'store_click', { context }) } catch { /* no-op */ }
  try { if (window.posthog) window.posthog.capture('store_click', { context }) } catch { /* no-op */ }
}

/** Share viral (ej. "Reta a un amigo"): NO es un Contact a PSR — evento aparte. */
export function trackShare(context = 'record') {
  try { if (window.fbq) window.fbq('trackCustom', 'Share', { context }) } catch { /* no-op */ }
  try { if (window.ttq) window.ttq.track('Share', { context }) } catch { /* no-op */ }
  try { if (window.gtag) window.gtag('event', 'share', { method: 'whatsapp', content_type: context }) } catch { /* no-op */ }
  try { if (window.posthog) window.posthog.capture('share', { context }) } catch { /* no-op */ }
}

let _inited = false
export function initTracking() {
  if (_inited) return
  _inited = true
  if (META_ID) loadMetaPixel(META_ID)
  if (TIKTOK_ID) loadTikTokPixel(TIKTOK_ID)
  if (GA4_ID) loadGA4(GA4_ID)
  if (POSTHOG_KEY) loadPostHog(POSTHOG_KEY, POSTHOG_HOST)

  // Listener global: cualquier clic en un link wa.me -> evento Contact.
  // Excepción: links marcados data-psr-share (share a un amigo) -> evento Share.
  // Y cualquier clic hacia la tienda -> evento StoreClick, con el emplazamiento
  // que declare data-psr-store. Global a propósito, igual que wa.me: así un
  // enlace nuevo a la tienda nace medido sin que nadie se acuerde de
  // instrumentarlo (que es exactamente por qué los dos que existían no medían
  // nada).
  document.addEventListener(
    'click',
    (ev) => {
      const target = ev.target
      if (!target || !target.closest) return

      const store = target.closest('a[href*="configuracion.patagoniasimracing.cl"]')
      if (store) {
        trackStoreClick((store.dataset && store.dataset.psrStore) || 'store_link')
        return
      }

      const a = target.closest('a[href*="wa.me"]')
      if (!a) return
      if (a.dataset && a.dataset.psrShare) trackShare(a.dataset.psrShare)
      else trackContact('wa_link')
    },
    { capture: true },
  )
}
