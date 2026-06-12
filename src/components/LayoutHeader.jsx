import { useEffect, useState } from 'react'
import { supabase } from '../db.js'
import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'

/**
 * Hero comercial: imagen REAL de acción + slogan + diferenciador + marcador de
 * récord EN VIVO (Supabase) + CTA WhatsApp primario. Ataca el "agujero de los 3
 * segundos": el que llega de un reel ve acción + gancho + un solo tap a reservar.
 */
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
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundImage: 'url(/media/hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 38%',
        padding: 22,
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(5,11,28,0.45) 0%, rgba(5,11,28,0.78) 62%, rgba(5,11,28,0.96) 100%)',
        }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#1f6feb', zIndex: 2 }} />

      {rec ? (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 13px',
            borderRadius: 999,
            background: 'rgba(5,11,28,0.66)',
            border: '1px solid rgba(96,165,250,0.35)',
            marginBottom: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 999, background: '#22c55e', boxShadow: '0 0 0 0 rgba(34,197,94,0.7)', animation: 'psrpulse 1.6s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', color: '#dbeafe' }}>
            RÉCORD EN VIVO · {rec.time} · {rec.track} · ¿le bajas?
          </span>
        </div>
      ) : null}

      <h1 style={{ position: 'relative', zIndex: 2, margin: 0, fontSize: 34, lineHeight: 1.08, fontWeight: 900, letterSpacing: '-0.01em' }}>
        Patagonia SimRacing
      </h1>
      <div style={{ position: 'relative', zIndex: 2, marginTop: 6, fontSize: 22, fontWeight: 900, color: '#7cc4ff', lineHeight: 1.15 }}>
        El sur llueve. Tú aceleras.
      </div>
      <p style={{ position: 'relative', zIndex: 2, margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.86)', lineHeight: 1.5, maxWidth: 620 }}>
        Simulador de carreras pro en Puerto Varas — esto no se arma en tu pieza.
      </p>

      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: 16,
          minHeight: 54,
          padding: '12px 18px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: '#fff',
          fontWeight: 900,
          fontSize: 16,
          lineHeight: 1.25,
          textAlign: 'center',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxSizing: 'border-box',
        }}
      >
        Reserva tu vuelta por WhatsApp
      </a>

      <style>{`@keyframes psrpulse {0%{box-shadow:0 0 0 0 rgba(34,197,94,0.6)}70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}} @media (prefers-reduced-motion: reduce){.psr-hero-video{display:none}}`}</style>

      {appMode === 'ADMIN' ? (
        <button
          type="button"
          onClick={onAdminBadgeClick}
          style={{
            marginTop: 12,
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
  )
}
