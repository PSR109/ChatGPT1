/**
 * Capa de medición + remarketing. Carga Meta Pixel, TikTok Pixel y GA4 SOLO si
 * sus IDs están en las env (VITE_*) — sin IDs es no-op (no rompe nada). Dispara
 * el evento "Contact" en CADA clic a un link wa.me (listener global, cubre hero,
 * FAB, paquetes, motor sin tocar cada componente). Base para audiencias,
 * lookalikes y medir reel/ad -> reserva.
 *
 * Para activar: en Vercel (Project Settings -> Environment Variables) define
 *   VITE_META_PIXEL_ID, VITE_TIKTOK_PIXEL_ID, VITE_GA4_ID
 * y redeploy. Vercel Analytics (trafico basico) ya corre vía <Analytics/>.
 */

const META_ID = import.meta.env.VITE_META_PIXEL_ID
const TIKTOK_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID
const GA4_ID = import.meta.env.VITE_GA4_ID

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

/** Evento de conversión clave: el usuario hace clic para escribir por WhatsApp. */
export function trackContact(context = 'whatsapp') {
  try { if (window.fbq) window.fbq('track', 'Contact', { context }) } catch { /* no-op */ }
  try { if (window.ttq) window.ttq.track('Contact', { context }) } catch { /* no-op */ }
  try { if (window.gtag) window.gtag('event', 'contact', { method: 'whatsapp', context }) } catch { /* no-op */ }
}

let _inited = false
export function initTracking() {
  if (_inited) return
  _inited = true
  if (META_ID) loadMetaPixel(META_ID)
  if (TIKTOK_ID) loadTikTokPixel(TIKTOK_ID)
  if (GA4_ID) loadGA4(GA4_ID)

  // Listener global: cualquier clic en un link wa.me -> evento Contact.
  document.addEventListener(
    'click',
    (ev) => {
      const a = ev.target && ev.target.closest && ev.target.closest('a[href*="wa.me"]')
      if (a) trackContact('wa_link')
    },
    { capture: true },
  )
}
