import { useEffect, useState } from 'react'
import { supabase } from '../db.js'
import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'

/**
 * Hero comercial: video REAL de acción + slogan dominante + diferenciadores +
 * marcador de récord EN VIVO (Supabase) + CTA WhatsApp primario. Ataca el
 * "agujero de los 3 segundos": el que llega de un reel ve acción + gancho +
 * un solo tap a reservar. Mobile-first (clamp), entrada animada (reduce-motion
 * safe), 0 dependencias externas: estilos inline + un bloque <style>.
 */
const SPECS = ['Fanatec Direct Drive', '3 simuladores', 'Todo clima', 'Sin experiencia previa']

export default function LayoutHeader({ appMode, onAdminBadgeClick }) {
  const [rec, setRec] = useState(null)

  useEffect(() => {
    let alive = true
    supabase
      .from('lap_times')
      .select('player,game,track,time')
      .order('time_ms', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (alive && data) setRec(data) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const wa = buildCommercialWhatsappLink('general')

  return (
    <div
      className="psr-hero"
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        minHeight: 'min(560px, 86vh)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: '#050b1c',
        backgroundImage: 'url(/media/hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 38%',
        padding: 'clamp(20px, 6vw, 40px)',
        isolation: 'isolate',
      }}
    >
      {/* Video de acción en loop mudo (mobile-friendly). Poster = hero.jpg.
          Se oculta con prefers-reduced-motion -> queda la foto de fondo. */}
      <video
        className="psr-hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="/media/hero.jpg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 38%',
          zIndex: 0,
        }}
      >
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay cinemático: oscurece de arriba->abajo para legibilidad del texto */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(5,11,28,0.30) 0%, rgba(5,11,28,0.55) 46%, rgba(5,11,28,0.88) 78%, rgba(5,11,28,0.98) 100%)',
        }}
      />
      {/* Tinte de marca lateral (azul) + viñeta para profundidad */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(120% 80% at 12% 100%, rgba(31,111,235,0.28) 0%, rgba(31,111,235,0) 55%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Speed-lines: franjas diagonales que cruzan en loop (motorsport). reduce-motion las congela */}
      <div className="psr-hero-speed" aria-hidden="true" />

      {/* Barra de marca superior (azul -> cyan) */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 5, zIndex: 2,
          background: 'linear-gradient(90deg, #1f6feb 0%, #38bdf8 50%, #1f6feb 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
        {/* Eyebrow: ubicación + categoría */}
        <div className="psr-hero-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, animationDelay: '0.02s' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#38bdf8', boxShadow: '0 0 10px 2px rgba(56,189,248,0.8)' }} />
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9fc6ff' }}>
            Puerto Varas · SimRacing Pro
          </span>
        </div>

        {/* Récord en vivo (cuando hay data) */}
        {rec ? (
          <div
            className="psr-hero-in"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 13px', borderRadius: 999,
              background: 'rgba(5,11,28,0.6)', border: '1px solid rgba(96,165,250,0.4)',
              backdropFilter: 'blur(4px)', fontVariantNumeric: 'tabular-nums', animationDelay: '0.08s',
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 999, background: '#22c55e', animation: 'psrpulse 1.6s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.04em', color: '#dbeafe' }}>
              RÉCORD EN VIVO · {rec.time} · {rec.track} · ¿le bajas?
            </span>
          </div>
        ) : null}

        {/* Slogan dominante. h1 mantiene la marca para SEO; el gancho emocional manda visualmente. */}
        <h1 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.02 }}>
          <span className="psr-hero-in" style={{ display: 'block', fontSize: 'clamp(13px, 3.4vw, 16px)', fontWeight: 800, letterSpacing: '0.04em', color: 'rgba(219,234,254,0.92)', marginBottom: 6, animationDelay: '0.10s' }}>
            Patagonia SimRacing
          </span>
          <span className="psr-hero-in" style={{ display: 'block', fontSize: 'clamp(38px, 11vw, 76px)', color: '#fff', animationDelay: '0.14s' }}>
            El sur llueve.
          </span>
          <span className="psr-hero-in psr-hero-accent" style={{ display: 'block', fontSize: 'clamp(38px, 11vw, 76px)', animationDelay: '0.20s' }}>
            Tú aceleras.
          </span>
        </h1>

        <p className="psr-hero-in" style={{ margin: 0, fontSize: 'clamp(15px, 2.3vw, 18px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.5, maxWidth: 600, animationDelay: '0.26s' }}>
          Simuladores de carrera profesionales con Fanatec Direct Drive. Esto no se arma en tu pieza.
        </p>

        {/* Strip de diferenciadores */}
        <div className="psr-hero-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, animationDelay: '0.30s' }}>
          {SPECS.map((s) => (
            <span
              key={s}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                background: 'rgba(31,111,235,0.14)', border: '1px solid rgba(96,165,250,0.32)',
                color: '#dbeafe', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.01em',
              }}
            >
              <span style={{ color: '#38bdf8', fontWeight: 900 }}>›</span>{s}
            </span>
          ))}
        </div>

        {/* CTA primario WhatsApp + microcopy de confianza */}
        <div className="psr-hero-in" style={{ width: '100%', maxWidth: 420, marginTop: 4, animationDelay: '0.36s' }}>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="psr-hero-cta"
            style={{
              minHeight: 56,
              padding: '14px 22px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 17,
              lineHeight: 1.2,
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxSizing: 'border-box',
              width: '100%',
              boxShadow: '0 10px 30px -8px rgba(34,197,94,0.55)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2a9.9 9.9 0 0 0-8.48 14.96L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm5.8 14.2c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11a16 16 0 0 1-1.65-.61 12.9 12.9 0 0 1-4.95-4.38c-.37-.5-.97-1.45-.97-2.77 0-1.31.69-1.96.93-2.23.24-.27.53-.34.7-.34l.5.01c.16.01.38-.06.59.45.24.58.8 2 .87 2.14.07.14.12.31.02.5-.1.18-.15.3-.29.46-.14.16-.3.36-.43.49-.14.13-.29.28-.13.55.16.27.72 1.18 1.54 1.91 1.06.95 1.95 1.24 2.22 1.38.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.59-.13.24.09 1.5.71 1.76.84.27.13.45.2.51.31.07.11.07.63-.17 1.31Z" />
            </svg>
            Reserva tu vuelta por WhatsApp
          </a>
          <div style={{ marginTop: 9, fontSize: 12.5, color: 'rgba(219,234,254,0.78)', fontWeight: 700, letterSpacing: '0.02em' }}>
            Respuesta directa · Bloques desde 30 min · Pago en el local
          </div>
        </div>

        {appMode === 'ADMIN' ? (
          <button
            type="button"
            onClick={onAdminBadgeClick}
            style={{
              marginTop: 4,
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.06)',
              color: '#dbeafe',
              fontWeight: 700,
              fontSize: 12,
              cursor: onAdminBadgeClick ? 'pointer' : 'default',
              alignSelf: 'flex-start',
            }}
          >
            Gestión activa
          </button>
        ) : null}
      </div>

      <style>{`
        @keyframes psrpulse {0%{box-shadow:0 0 0 0 rgba(34,197,94,0.6)}70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
        @keyframes psrfade {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes psrspeed {0%{background-position:0 0,0 0}100%{background-position:600px 0,-600px 0}}
        .psr-hero-in{opacity:0;animation:psrfade 0.6s cubic-bezier(.2,.7,.2,1) forwards}
        .psr-hero-accent{color:#38bdf8;text-shadow:0 0 30px rgba(56,189,248,0.45)}
        .psr-hero-cta{transition:transform .15s ease, box-shadow .15s ease}
        .psr-hero-cta:hover{transform:translateY(-2px);box-shadow:0 16px 38px -8px rgba(34,197,94,0.7)}
        .psr-hero-speed{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.5;
          background-image:
            repeating-linear-gradient(115deg, rgba(56,189,248,0) 0 38px, rgba(56,189,248,0.10) 38px 40px),
            repeating-linear-gradient(115deg, rgba(255,255,255,0) 0 90px, rgba(255,255,255,0.05) 90px 92px);
          background-size:600px 100%,600px 100%;
          animation:psrspeed 6s linear infinite;
          -webkit-mask-image:linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%);
          mask-image:linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)}
        @media (prefers-reduced-motion: reduce){
          .psr-hero-video{display:none}
          .psr-hero-in{opacity:1;animation:none}
          .psr-hero-speed{animation:none}
        }
      `}</style>
    </div>
  )
}
