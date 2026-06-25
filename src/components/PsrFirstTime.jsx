import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'
import Icon from './Icon'
import Reveal from './Reveal'

/**
 * PsrFirstTime — "Primera vez, así funciona": baja la barrera del primerizo
 * ("¿y si no sé / hago el ridículo?"). 4 pasos honestos + CTA WhatsApp.
 * Copy sin cambios. Composición elevada: stepper conectado con números en mono,
 * header editorial a la izquierda.
 */

const steps = [
  { n: '1', k: 'Reserva en 1 minuto', v: 'Por WhatsApp o con la reserva online. Eliges día, hora y cuánto rato quieres correr.' },
  { n: '2', k: 'Llegas y te dejamos listo', v: 'Te configuramos el simulador a tu nivel: auto, pista y ayudas. No necesitas saber nada antes.' },
  { n: '3', k: 'Corres a tu ritmo', v: 'Te explicamos lo básico en minutos. Las primeras vueltas son tranquilas y tú decides cuándo apretar.' },
  { n: '4', k: 'Tu tiempo queda en el ranking', v: 'Compara tu vuelta con el récord del local y vuelve cuando quieras a bajarlo.' },
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
  minHeight: 54,
  padding: '14px 22px',
  borderRadius: 'var(--r-md)',
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, var(--psr-green) 0%, var(--psr-green-2) 100%)',
  color: '#04210f',
  fontWeight: 900,
  fontSize: 16,
  lineHeight: 1.25,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  justifySelf: 'start',
  boxSizing: 'border-box',
  boxShadow: 'var(--sh-green)',
}

export default function PsrFirstTime() {
  const waLink = buildCommercialWhatsappLink('general', {
    details: 'Es mi primera vez en un simulador, quiero venir a probar.',
  })

  return (
    <Reveal as="section" style={section}>
      <style>{`
        .psr-ft-grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; position:relative; }
        /* rail conecta los centros reales: círculos centrados en su columna -> centros en 12.5%/37.5%/62.5%/87.5% */
        .psr-ft-grid::before {
          content:''; position:absolute; left:12.5%; right:12.5%; top:27px; height:2px;
          background: linear-gradient(90deg, var(--psr-border-blue), rgba(56,189,248,0.15));
        }
        @media (max-width: 860px) {
          .psr-ft-grid { grid-template-columns: 1fr; gap: 14px; }
          .psr-ft-grid::before { left:50%; transform:translateX(-50%); top:8%; bottom:8%; right:auto; width:2px; height:auto; background: linear-gradient(180deg, var(--psr-border-blue), rgba(56,189,248,0.12)); }
        }
      `}</style>

      <div style={{ display: 'grid', gap: 12 }}>
        <span style={kicker}><Icon name="flag" size={16} /> ¿Primera vez?</span>
        <h2 style={{ margin: 0, fontSize: 'var(--t-h2)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, color: 'var(--psr-ink)' }}>
          Así funciona — sin experiencia previa
        </h2>
        <p style={{ margin: 0, color: 'var(--psr-muted)', lineHeight: 1.6, maxWidth: 640, fontSize: 'var(--t-lead)' }}>
          La mayoría de quienes vienen nunca había corrido en un simulador. En 4 pasos estás en pista.
        </p>
      </div>

      <div className="psr-ft-grid">
        {steps.map((s) => (
          <div key={s.n} style={{ display: 'grid', gap: 10, alignContent: 'start', justifyItems: 'center', textAlign: 'center', position: 'relative' }}>
            <div
              className="psr-mono"
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--psr-surface-2), #0a1a2c)',
                border: '1px solid var(--psr-border-blue)',
                color: 'var(--psr-cyan)',
                fontWeight: 700,
                fontSize: 22,
                boxShadow: '0 8px 20px -8px rgba(41,129,243,0.5)',
              }}
            >
              {s.n}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: 'var(--psr-ink)', lineHeight: 1.2 }}>{s.k}</div>
            <div style={{ color: 'var(--psr-muted)', lineHeight: 1.5, fontSize: 14.5 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <a href={waLink} target="_blank" rel="noreferrer" style={ctaWhatsapp}>
        <Icon name="whatsapp" size={20} /> Reserva tu primera sesión por WhatsApp
      </a>
    </Reveal>
  )
}
