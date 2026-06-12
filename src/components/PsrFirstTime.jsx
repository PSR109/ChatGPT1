import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'

/**
 * PsrFirstTime — "Primera vez, así funciona": baja la barrera de entrada del
 * visitante que nunca ha corrido en simulador (objeción #1 del primerizo:
 * "¿y si no sé / hago el ridículo?"). 4 pasos honestos + CTA WhatsApp.
 */

const steps = [
  {
    n: '1',
    k: 'Reserva en 1 minuto',
    v: 'Por WhatsApp o con la reserva online. Eliges día, hora y cuánto rato quieres correr.',
  },
  {
    n: '2',
    k: 'Llegas y te dejamos listo',
    v: 'Te configuramos el simulador a tu nivel: auto, pista y ayudas. No necesitas saber nada antes.',
  },
  {
    n: '3',
    k: 'Corres a tu ritmo',
    v: 'Te explicamos lo básico en minutos. Las primeras vueltas son tranquilas y tú decides cuándo apretar.',
  },
  {
    n: '4',
    k: 'Tu tiempo queda en el ranking',
    v: 'Compara tu vuelta con el récord del local y vuelve cuando quieras a bajarlo.',
  },
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

export default function PsrFirstTime() {
  const waLink = buildCommercialWhatsappLink('general', {
    details: 'Es mi primera vez en un simulador, quiero venir a probar.',
  })

  return (
    <section style={section}>
      <style>{`
        @media (max-width: 860px) {
          .psr-firsttime-grid { grid-template-columns: 1fr !important; }
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
          ¿Primera vez?
        </div>
        <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.15 }}>Así funciona — sin experiencia previa</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.76)', lineHeight: 1.55, maxWidth: 760, justifySelf: 'center' }}>
          La mayoría de quienes vienen nunca había corrido en un simulador. En 4 pasos estás en pista.
        </p>
      </div>

      <div className="psr-firsttime-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {steps.map((s) => (
          <div
            key={s.n}
            style={{
              borderRadius: 16,
              padding: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'grid',
              gap: 6,
              alignContent: 'start',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(59,130,246,0.18)',
                border: '1px solid rgba(96,165,250,0.3)',
                color: '#dbeafe',
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              {s.n}
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#7cc4ff' }}>{s.k}</div>
            <div style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.45 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <a href={waLink} target="_blank" rel="noreferrer" style={ctaWhatsapp}>
        Reserva tu primera sesión por WhatsApp
      </a>
    </section>
  )
}
