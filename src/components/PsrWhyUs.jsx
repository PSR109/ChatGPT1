import { useEffect, useState } from 'react'
import { supabase } from '../db.js'
import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'

/**
 * PsrWhyUs — el DIFERENCIADOR (specs Fanatec) + precio visible + teaser del récord
 * actual. Convierte al visitante que duda "¿para qué voy si juego en casa?".
 * Foco: conversión. CTA WhatsApp. Claims aprobados (8/18Nm, 100kg, 240fps, 49").
 */

const specs = [
  { k: 'Fanatec Direct Drive', v: 'Bases de 8 y 18 Nm — fuerza real, no de juguete.' },
  { k: 'Freno de célula de carga', v: '100 kg de presión: frenas con la pierna, como en pista.' },
  { k: '240 fps en 49"', v: 'Gráficas al máximo en pantalla ultrawide de 49 pulgadas.' },
  { k: 'VR + caja H y secuencial', v: 'Realidad virtual, freno de mano, volantes de rally y fórmula.' },
  { k: 'Tu iRacing o el nuestro', v: 'Corre con tu cuenta (sube tu rating) o con la de PSR.' },
]

const section = {
  borderRadius: 24,
  padding: 20,
  background: 'linear-gradient(180deg, rgba(8,18,48,0.98) 0%, rgba(5,11,28,0.98) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  width: '100%',
  boxSizing: 'border-box',
  display: 'grid',
  gap: 16,
}

const priceBadge = {
  justifySelf: 'center',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 40,
  padding: '0 18px',
  borderRadius: 999,
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  color: '#fff',
  fontWeight: 900,
  fontSize: 15,
}

const ctaWhatsapp = {
  minHeight: 52,
  padding: '12px 18px',
  borderRadius: 16,
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  color: '#fff',
  fontWeight: 900,
  fontSize: 15,
  lineHeight: 1.25,
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  boxSizing: 'border-box',
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
        borderRadius: 18,
        padding: 16,
        background: 'rgba(41,129,243,0.10)',
        border: '1px solid rgba(96,165,250,0.28)',
        display: 'grid',
        gap: 10,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#dbeafe' }}>
        🏁 Récord del local ahora
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.15 }}>
        {rec.time} <span style={{ color: '#7cc4ff' }}>· {rec.track}</span>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
        Lo dejó {rec.player} en {rec.game}. ¿Le bajas el tiempo?
      </div>
      <a href={waLink} target="_blank" rel="noreferrer" style={ctaWhatsapp}>
        Ven a romperlo — reserva por WhatsApp
      </a>
    </div>
  )
}

export default function PsrWhyUs() {
  return (
    <section style={section}>
      <style>{`
        @media (max-width: 860px) {
          .psr-whyus-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ display: 'grid', gap: 8, textAlign: 'center' }}>
        <div
          style={{
            justifySelf: 'center',
            minHeight: 32,
            padding: '0 14px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            background: 'rgba(59,130,246,0.14)',
            border: '1px solid rgba(96,165,250,0.24)',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#dbeafe',
          }}
        >
          Por qué acá
        </div>
        <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.15 }}>Esto no se arma en tu pieza</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.76)', lineHeight: 1.55, maxWidth: 760, justifySelf: 'center' }}>
          Equipo profesional que te separa de jugar en casa. Ven a sentir la diferencia.
        </p>
        <span style={priceBadge}>Sesiones desde $16.000 (30 min · 1 piloto)</span>
      </div>

      <div className="psr-whyus-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {['/media/g1.jpg', '/media/g2.jpg', '/media/g3.jpg'].map((src, i) => (
          <div key={src} style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4', background: 'rgba(255,255,255,0.04)' }}>
            <img
              src={src}
              alt={['Piloto corriendo en simulador PSR', 'Simulador profesional PSR Puerto Varas', 'Automovilismo real en Patagonia SimRacing'][i]}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>

      <div className="psr-whyus-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {specs.map((s) => (
          <div
            key={s.k}
            style={{
              borderRadius: 16,
              padding: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'grid',
              gap: 4,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16, color: '#7cc4ff' }}>🔵 {s.k}</div>
            <div style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.45 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <RecordTeaser />
    </section>
  )
}
