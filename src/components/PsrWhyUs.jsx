import { useEffect, useState } from 'react'
import { supabase } from '../db.js'
import { buildCommercialWhatsappLink, buildChallengeShareLink } from '../utils/whatsappHelper'
import Icon from './Icon'
import Reveal from './Reveal'

/**
 * PsrWhyUs — el DIFERENCIADOR (specs Fanatec) + precio visible + récord en vivo.
 * Convierte al visitante que duda "¿para qué voy si juego en casa?".
 * Foco: conversión, CTA WhatsApp. Copy/claims sin cambios (8/18Nm, 100kg, 240fps, 49").
 * Composición editorial (no todo centrado): header a la izquierda + grid de specs
 * con icono + galería con hover + tarjeta de récord con tiempo en mono.
 */

const specs = [
  { icon: 'wheel', k: 'Fanatec Direct Drive', v: 'Bases de 8 y 18 Nm — fuerza real, no de juguete.' },
  { icon: 'bolt', k: 'Freno de célula de carga', v: '100 kg de presión: frenas con la pierna, como en pista.' },
  { icon: 'monitor', k: '240 fps en 49"', v: 'Gráficas al máximo en pantalla ultrawide de 49 pulgadas.' },
  { icon: 'vr', k: 'VR + caja H y secuencial', v: 'Realidad virtual, freno de mano, volantes de rally y fórmula.' },
  { icon: 'gauge', k: 'Tu iRacing o el nuestro', v: 'Corre con tu cuenta (sube tu rating) o con la de PSR.' },
]

const gallery = [
  { src: '/media/g1.jpg', alt: 'Piloto corriendo en simulador PSR' },
  { src: '/media/g2.jpg', alt: 'Simulador profesional PSR Puerto Varas' },
  { src: '/media/g3.jpg', alt: 'Automovilismo real en Patagonia SimRacing' },
]

const section = {
  borderRadius: 'var(--r-xl)',
  padding: 'clamp(22px, 4vw, 40px)',
  background: 'linear-gradient(180deg, var(--psr-surface) 0%, var(--psr-surface-2) 100%)',
  border: '1px solid var(--psr-border-soft)',
  boxShadow: 'var(--sh-2)',
  width: '100%',
  boxSizing: 'border-box',
  display: 'grid',
  gap: 28,
}

const kicker = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--psr-cyan-ink)',
}

const ctaWhatsapp = {
  minHeight: 52,
  padding: '13px 20px',
  borderRadius: 'var(--r-md)',
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, var(--psr-green) 0%, var(--psr-green-2) 100%)',
  color: '#04210f',
  fontWeight: 900,
  fontSize: 15,
  lineHeight: 1.25,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
  width: '100%',
  boxSizing: 'border-box',
  boxShadow: 'var(--sh-green)',
}

function RecordTeaser() {
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

  if (!rec) return null
  const waLink = buildCommercialWhatsappLink('general')
  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(18px, 3vw, 26px)',
        background:
          'radial-gradient(120% 140% at 0% 0%, rgba(41,129,243,0.18) 0%, rgba(41,129,243,0) 60%), rgba(8,18,40,0.6)',
        border: '1px solid var(--psr-border-blue)',
        display: 'grid',
        gap: 14,
      }}
    >
      <div style={{ ...kicker, color: 'var(--psr-cyan)' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--psr-green)', boxShadow: '0 0 10px 2px rgba(34,197,94,0.7)', animation: 'psrpulse 1.6s infinite' }} />
        Récord del local · en vivo
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12 }}>
        <span className="psr-mono" style={{ fontSize: 'clamp(34px, 7vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
          {rec.time}
        </span>
        <span style={{ color: 'var(--psr-cyan-ink)', fontWeight: 700, fontSize: 16 }}>{rec.track}</span>
      </div>
      <div style={{ color: 'var(--psr-muted)', lineHeight: 1.55, maxWidth: 560 }}>
        Lo dejó <strong style={{ color: 'var(--psr-ink)' }}>{rec.player}</strong> en {rec.game}. ¿Le bajas el tiempo?
      </div>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
        <a href={waLink} target="_blank" rel="noreferrer" style={ctaWhatsapp}>
          <Icon name="whatsapp" size={19} /> Ven a romperlo
        </a>
        <a
          href={buildChallengeShareLink(rec)}
          target="_blank"
          rel="noreferrer"
          data-psr-share="record"
          className="psr-lift"
          style={{
            ...ctaWhatsapp,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--psr-border-blue)',
            color: 'var(--psr-cyan-ink)',
            boxShadow: 'none',
          }}
        >
          <Icon name="flag" size={18} /> Reta a un amigo
        </a>
      </div>
    </div>
  )
}

export default function PsrWhyUs() {
  return (
    <Reveal as="section" style={section}>
      <style>{`
        .psr-whyus-split { grid-template-columns: 1.05fr 0.95fr; align-items: stretch; }
        .psr-whyus-gallery { display:grid; grid-template-columns: 1.4fr 1fr; grid-template-rows: auto auto; gap: 12px; }
        .psr-whyus-gallery-big { grid-row: 1 / span 2; aspect-ratio: 3/4.4; }
        .psr-whyus-gallery-img { transition: transform .5s var(--ease-out); }
        .psr-whyus-shot:hover .psr-whyus-gallery-img { transform: scale(1.06); }
        @media (max-width: 900px) {
          .psr-whyus-split { grid-template-columns: 1fr; }
          .psr-whyus-header { grid-template-columns: 1fr !important; }
          .psr-whyus-gallery { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
          .psr-whyus-gallery-big { grid-row: auto; grid-column: 1 / -1; aspect-ratio: 16/10; }
        }
      `}</style>

      {/* Header editorial: izquierda dominante, precio a la derecha */}
      <div className="psr-whyus-header" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'end' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={kicker}><Icon name="shield" size={16} /> Por qué acá</span>
          <h2 style={{ margin: 0, fontSize: 'var(--t-h2)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, color: 'var(--psr-ink)' }}>
            Esto no se arma en tu pieza
          </h2>
          <p style={{ margin: 0, color: 'var(--psr-muted)', lineHeight: 1.6, maxWidth: 560, fontSize: 'var(--t-lead)' }}>
            Equipo profesional que te separa de jugar en casa. Ven a sentir la diferencia.
          </p>
        </div>
        <div
          style={{
            justifySelf: 'start',
            alignSelf: 'end',
            display: 'grid',
            gap: 9,
            padding: '14px 20px',
            borderRadius: 'var(--r-lg)',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(22,163,74,0.10))',
            border: '1px solid rgba(34,197,94,0.32)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(190,242,210,0.9)' }}>Desde</span>
            <span style={{ fontSize: 'clamp(26px,3.4vw,34px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>$9.000</span>
            <span style={{ fontSize: 12.5, color: 'rgba(220,245,228,0.85)', fontWeight: 600 }}>15 min · 1 piloto</span>
          </div>
          <div style={{ paddingTop: 8, borderTop: '1px solid rgba(190,242,210,0.18)' }}>
            <span style={{ fontSize: 12, color: 'rgba(220,245,228,0.9)', fontWeight: 600, lineHeight: 1.4 }}>
              Reserva online desde <strong style={{ color: '#fff', fontWeight: 800 }}>$16.000</strong> · 30 min
            </span>
          </div>
        </div>
      </div>

      {/* Split: galería + specs */}
      <div className="psr-whyus-split" style={{ display: 'grid', gap: 18 }}>
        {/* Galería vertical (foto grande + 2 chicas) — reflow a 2 cols en móvil vía .psr-whyus-gallery */}
        <div className="psr-whyus-gallery">
          <div className="psr-whyus-shot psr-whyus-gallery-big psr-lift" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--psr-border-soft)', background: 'var(--psr-panel)' }}>
            <img className="psr-whyus-gallery-img" src={gallery[1].src} alt={gallery[1].alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {[gallery[0], gallery[2]].map((g) => (
            <div key={g.src} className="psr-whyus-shot psr-lift" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--psr-border-soft)', aspectRatio: '1/1', background: 'var(--psr-panel)' }}>
              <img className="psr-whyus-gallery-img" src={g.src} alt={g.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}
        </div>

        {/* Specs como filas con icono */}
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          {specs.map((s) => (
            <div
              key={s.k}
              className="psr-lift"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 14,
                alignItems: 'start',
                borderRadius: 'var(--r-md)',
                padding: '14px 16px',
                background: 'var(--psr-panel)',
                border: '1px solid var(--psr-border-soft)',
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--psr-blue-soft)',
                  border: '1px solid var(--psr-border-blue)',
                  color: 'var(--psr-cyan)',
                }}
              >
                <Icon name={s.icon} size={22} />
              </span>
              <span style={{ display: 'grid', gap: 3 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--psr-ink)' }}>{s.k}</span>
                <span style={{ color: 'var(--psr-muted)', lineHeight: 1.45, fontSize: 14.5 }}>{s.v}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <RecordTeaser />
    </Reveal>
  )
}
