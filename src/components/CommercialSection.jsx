import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'
import PsrWhyUs from './PsrWhyUs'
import PsrFirstTime from './PsrFirstTime'
import Icon from './Icon'
import Reveal from './Reveal'

/**
 * CommercialSection — narrativa de marca del HOME (scroll, no pestaña escondida):
 * value-prop -> por qué acá -> primera vez -> opciones -> reseñas -> ubicación/horario
 * -> FAQ -> cierre. Composición editorial (no todo centrado), superficies premium,
 * iconos SVG, scroll-reveal. Conversión: CTA WhatsApp + "Reservar". Copy sin cambios.
 */

const MAPS_URL = 'https://maps.google.com/?cid=11500999935444627515'

const reviews = [
  { author: 'Tomás Chales de Beaulieu', text: 'Tremenda experiencia! Volveré más seguido!' },
  {
    author: 'Macarena Jara',
    text: 'Excelente experiencia. 100% recomendado para familias, amigos y amantes del rally y Fórmula 1. Si andan por la región de Los Lagos tienen que pasar a conocerlo.',
  },
  { author: 'Consuelo Encalada', text: 'Demasiado entretenido y buena atención, un panorama excelente para la familia.' },
  { author: 'Francisca Chereau', text: 'Nos gustó mucho la propuesta. Fuimos sin muchas expectativas y lo disfrutamos un montón.' },
  {
    author: 'Rodolfo Ardavan',
    text: 'Fui con mi hijo y lo disfrutamos mucho. Lo mejor es que nos ayudaron adaptando el juego para niños o adulto, lo que hace más entretenida la experiencia. Muy recomendado.',
  },
  { author: 'Evelyn Incostroza', text: 'Excelente servicio.' },
]

const trustPills = [
  { icon: 'pin', label: 'Puerto Varas' },
  { icon: 'check', label: 'Sin experiencia previa' },
  { icon: 'clock', label: 'Bloques de 30 min' },
  { icon: 'wheel', label: 'Hasta 3 simuladores' },
]

const segments = [
  {
    icon: 'users',
    eyebrow: 'Entretención y panorama',
    title: 'Una experiencia distinta para venir solo o acompañado',
    text: 'Si quieres hacer algo entretenido en Puerto Varas, aquí puedes venir a correr, comparar tiempos y pasarlo bien aunque sea tu primera vez.',
    highlights: [
      'Ideal para venir solo, con amigos, en pareja o en familia.',
      'No necesitas experiencia previa para disfrutarlo.',
      'Se entiende rápido y se disfruta desde la primera sesión.',
    ],
    button: 'Reservar ahora',
    action: 'reserve',
  },
  {
    icon: 'trophy',
    eyebrow: 'Eventos y grupos',
    title: 'Cumpleaños, celebraciones y salidas en grupo',
    text: 'El panorama distinto que todos recuerdan. Competencia, ranking en vivo y momentos para grabar.',
    highlights: [
      'Grupos de 6 a 30 personas · 1 a 2 horas.',
      'Hasta 3 simuladores rotando: corren en tandas de 3 y el resto compite por el récord del grupo.',
      'Sin experiencia previa — se entiende y se disfruta desde la primera vuelta.',
      'Cierre con podio: el ganador queda con su nombre en la tabla.',
    ],
    ficha: 'Formato flexible · Alto Varas 109, Puerto Varas · cotización por grupo según personas y duración.',
    button: 'Cotizar evento por WhatsApp',
    wa: 'evento',
  },
  {
    icon: 'building',
    eyebrow: 'Empresas',
    title: 'Team building con ranking en vivo',
    text: 'Una actividad de equipo distinta a las de siempre: competitiva, fácil de coordinar y muy compartible.',
    highlights: [
      'Equipos de 10 a 30 personas · 1 a 2 horas.',
      'Hasta 3 simuladores rotando en heats: mientras 3 corren, el resto compite en pantalla por el récord del equipo.',
      'Ideal para clima laboral, clientes o partners — funciona aunque nadie tenga experiencia.',
      'Cierre con podio y récord del equipo (trofeo simbólico, sin premio material).',
    ],
    ficha: 'Días L-V (ideal horario laboral) · cotización por grupo según personas y duración · boleta/factura disponible.',
    button: 'Cotizar empresa por WhatsApp',
    wa: 'empresa',
  },
  {
    icon: 'gauge',
    eyebrow: 'Práctica de manejo',
    title: 'Un espacio para practicar con más calma y ganar confianza',
    text: 'Pensado para quienes están aprendiendo a sacar la licencia o ya la tienen, pero todavía no se sienten seguros para salir a la calle.',
    highlights: [
      'Sirve para familiarizarte con volante, pedales y coordinación básica.',
      'Puedes venir a practicar solo o con alguien que te acompañe y te enseñe.',
      'Importante: no enseñamos a manejar.',
    ],
    button: 'Quiero practicar',
    action: 'aprender',
  },
]

const faqCards = [
  { title: '¿Hay edad mínima o máxima?', text: 'Es para todas las edades, mientras alcances los pedales y el volante para manejar con control.' },
  { title: '¿Sirve si es mi primera vez?', text: 'Sí. No necesitas experiencia previa para venir y disfrutarlo.' },
  { title: '¿Cómo reservo?', text: 'Puedes reservar directo desde la app o escribir por WhatsApp si necesitas coordinar algo especial.' },
  { title: '¿Sirve para grupos o empresas?', text: 'Sí. Puedes cotizar por WhatsApp y revisar una opción según tu caso.' },
  { title: '¿Sirve para practicar manejo?', text: 'Sí, pero no enseñamos a manejar. Puedes venir a practicar solo o con alguien que te acompañe.' },
]

const wrap = { margin: '0 auto', display: 'grid', gap: 'clamp(20px, 4vw, 40px)', width: '100%', maxWidth: 1120 }

const section = {
  borderRadius: 'var(--r-xl)',
  padding: 'clamp(22px, 4vw, 40px)',
  background: 'linear-gradient(180deg, var(--psr-surface) 0%, var(--psr-surface-2) 100%)',
  border: '1px solid var(--psr-border-soft)',
  boxShadow: 'var(--sh-2)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
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

const buttonPrimary = {
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
  boxSizing: 'border-box',
  boxShadow: 'var(--sh-green)',
}

const buttonGhost = {
  ...buttonPrimary,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--psr-border-blue)',
  color: 'var(--psr-cyan-ink)',
  boxShadow: 'none',
}

// Reserva (booking app) = azul de marca. Verde se reserva SOLO para conversión WhatsApp
// (1 por sección visible), para no diluir la jerarquía "verde = la acción" (DESIGN.md).
const buttonReserve = {
  ...buttonPrimary,
  background: 'linear-gradient(135deg, var(--psr-blue-2) 0%, var(--psr-blue) 100%)',
  color: '#fff',
  boxShadow: 'var(--sh-blue)',
}

function SectionHeader({ icon, eyebrow, title, text, align = 'left', display = false }) {
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: align === 'center' ? 'center' : 'start', textAlign: align, marginBottom: 24 }}>
      <span style={kicker}>{icon ? <Icon name={icon} size={16} /> : null}{eyebrow}</span>
      <h2 style={{ margin: 0, fontSize: display ? 'var(--t-display)' : 'var(--t-h2)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: display ? 1.0 : 1.08, color: 'var(--psr-ink)' }}>{title}</h2>
      {text ? (
        <p style={{ margin: 0, color: 'var(--psr-muted)', lineHeight: 1.6, maxWidth: 680, fontSize: 'var(--t-lead)' }}>{text}</p>
      ) : null}
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="psr-lift" style={{ borderRadius: 'var(--r-lg)', padding: 22, background: 'var(--psr-panel)', border: '1px solid var(--psr-border-soft)', display: 'grid', gap: 12, alignContent: 'start', minWidth: 0 }}>
      <div style={{ color: 'var(--psr-amber)', fontSize: 15, letterSpacing: 3 }} aria-label="5 de 5 estrellas">★★★★★</div>
      <div style={{ lineHeight: 1.6, fontSize: 16, color: 'var(--psr-ink)' }}>“{review.text}”</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
        <span style={{ width: 34, height: 34, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--psr-blue-soft)', border: '1px solid var(--psr-border-blue)', color: 'var(--psr-cyan-ink)', fontWeight: 800, fontSize: 14 }}>
          {review.author.charAt(0)}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--psr-muted)', fontSize: 14 }}>{review.author}</span>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details
      className="psr-faq"
      style={{ borderRadius: 'var(--r-md)', background: 'var(--psr-panel)', border: '1px solid var(--psr-border-soft)', padding: '4px 18px' }}
    >
      <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 0', fontWeight: 800, fontSize: 16, color: 'var(--psr-ink)' }}>
        <span>{q}</span>
        <span className="psr-faq-chev" style={{ color: 'var(--psr-cyan)', transition: 'transform .2s var(--ease-out)', flexShrink: 0, display: 'inline-flex' }}>
          <Icon name="arrow" size={18} />
        </span>
      </summary>
      <div style={{ color: 'var(--psr-muted)', lineHeight: 1.6, padding: '0 0 16px', fontSize: 15 }}>{a}</div>
    </details>
  )
}

export default function CommercialSection({ setActiveTab, onCommercialReserve }) {
  const goToReserve = () => {
    if (typeof onCommercialReserve === 'function') {
      onCommercialReserve({ segment: 'general' })
      return
    }
    if (typeof setActiveTab === 'function') setActiveTab('reservas')
  }

  const goToSegment = (segment) => {
    if (typeof onCommercialReserve === 'function') {
      onCommercialReserve({ segment })
      return
    }
    if (typeof setActiveTab === 'function') setActiveTab('reservas')
  }

  const handleAction = (action) => {
    if (action === 'reserve') {
      goToReserve()
      return
    }
    goToSegment(action)
  }

  return (
    <div style={wrap}>
      <style>{`
        .psr-segments { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
        .psr-reviews { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
        .psr-faq summary::-webkit-details-marker { display:none; }
        .psr-faq[open] .psr-faq-chev { transform: rotate(90deg); }
        .psr-loc-grid { display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; align-items:stretch; }
        @media (max-width: 900px) {
          .psr-segments, .psr-reviews { grid-template-columns: 1fr; }
          .psr-loc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* 1 · Value prop + trust + CTA */}
      <Reveal as="section" style={{ ...section, background: 'radial-gradient(120% 120% at 100% 0%, rgba(41,129,243,0.16) 0%, rgba(41,129,243,0) 55%), linear-gradient(180deg, var(--psr-surface) 0%, var(--psr-surface-2) 100%)' }}>
        <SectionHeader
          display
          icon="wheel"
          eyebrow="Patagonia SimRacing"
          title="Una experiencia distinta para correr, competir y pasarlo bien"
          text="Reserva fácil desde el teléfono y elige la opción que mejor te calce: venir por entretención, coordinar un grupo, cotizar para empresa o practicar para ganar confianza."
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
          {trustPills.map((p) => (
            <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 'var(--r-pill)', background: 'var(--psr-blue-soft)', border: '1px solid var(--psr-border-blue)', color: '#dcebff', fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: 'var(--psr-cyan)', display: 'inline-flex' }}><Icon name={p.icon} size={15} /></span>
              {p.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button onClick={goToReserve} style={{ ...buttonReserve, flex: '1 1 220px' }}>
            <Icon name="calendar" size={19} /> Reservar ahora
          </button>
          <a href={buildCommercialWhatsappLink('general')} target="_blank" rel="noreferrer" style={{ ...buttonGhost, flex: '1 1 220px' }}>
            <Icon name="whatsapp" size={19} /> Hablar por WhatsApp
          </a>
        </div>
      </Reveal>

      {/* 2 · Diferenciador */}
      <PsrWhyUs />

      {/* 3 · Primera vez */}
      <PsrFirstTime />

      {/* 4 · Opciones / segmentos */}
      <Reveal as="section" style={section}>
        <SectionHeader icon="flag" eyebrow="Para qué venir" title="Elige tu forma de correr" text="Cada visita se adapta a quién viene: una persona, un grupo que celebra, un equipo de trabajo o quien quiere practicar." />
        <div className="psr-segments">
          {segments.map((item, index) => (
            <div key={item.title} className="psr-lift" style={{ borderRadius: 'var(--r-lg)', padding: 24, background: 'var(--psr-panel)', border: '1px solid var(--psr-border-soft)', display: 'grid', gap: 16, alignContent: 'start', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--psr-blue-soft)', border: '1px solid var(--psr-border-blue)', color: 'var(--psr-cyan)', flexShrink: 0 }}>
                  <Icon name={item.icon} size={23} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--psr-cyan-ink)' }}>{item.eyebrow}</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 'clamp(19px,2.4vw,22px)', lineHeight: 1.18, color: 'var(--psr-ink)' }}>{item.title}</div>
              <div style={{ color: 'var(--psr-muted)', lineHeight: 1.55 }}>{item.text}</div>

              <div style={{ display: 'grid', gap: 9 }}>
                {item.highlights.map((h) => (
                  <div key={h} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'start', color: 'var(--psr-muted)', lineHeight: 1.5, fontSize: 14.5 }}>
                    <span style={{ color: 'var(--psr-green)', marginTop: 2, display: 'inline-flex' }}><Icon name="check" size={17} /></span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {item.ficha ? <div style={{ fontSize: 12.5, color: 'var(--psr-muted-2)', lineHeight: 1.45, borderTop: '1px solid var(--psr-hairline)', paddingTop: 12 }}>{item.ficha}</div> : null}

              {item.wa ? (
                <a href={buildCommercialWhatsappLink(item.wa)} target="_blank" rel="noreferrer" style={{ ...buttonGhost, justifyContent: 'space-between' }}>
                  {item.button} <Icon name="arrow" size={18} />
                </a>
              ) : (
                <button onClick={() => handleAction(item.action)} style={index === 0 ? { ...buttonReserve, justifyContent: 'space-between' } : { ...buttonGhost, justifyContent: 'space-between' }}>
                  {item.button} <Icon name="arrow" size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* 5 · Reseñas Google */}
      <Reveal as="section" style={section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 24 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <span style={kicker}><Icon name="star" size={16} /> Reseñas de Google</span>
            <h2 style={{ margin: 0, fontSize: 'var(--t-h2)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, color: 'var(--psr-ink)' }}>Lo que dicen quienes ya fueron</h2>
          </div>
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="psr-lift" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 'var(--r-md)', background: 'var(--psr-panel)', border: '1px solid var(--psr-border-soft)', textDecoration: 'none' }}>
            <span className="psr-mono" style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>5.0</span>
            <span style={{ display: 'grid', gap: 1 }}>
              <span style={{ color: 'var(--psr-amber)', fontSize: 13, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ color: 'var(--psr-muted)', fontSize: 12.5, fontWeight: 600 }}>Ver en Google →</span>
            </span>
          </a>
        </div>
        <div className="psr-reviews">
          {reviews.map((review) => <ReviewCard key={`${review.author}-${review.text}`} review={review} />)}
        </div>
      </Reveal>

      {/* 6 · Ubicación y horario */}
      <Reveal as="section" style={section}>
        <SectionHeader icon="pin" eyebrow="Dónde estamos" title="A pasos del centro de Puerto Varas" text="Indoor, todo-clima y con estacionamiento gratis. El panorama perfecto también para un día de lluvia." />
        <div className="psr-loc-grid">
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            {[
              { icon: 'pin', k: 'Dirección', v: 'Centro Comercial Alto Varas, Ruta V-505 Km 2.5, Local 109, Puerto Varas · camino a Alerce, a 20 min de Puerto Montt.' },
              { icon: 'clock', k: 'Horario', v: 'Lunes a sábado 10:30–20:00. Domingo solo con reserva previa por WhatsApp.' },
              { icon: 'check', k: 'Estacionamiento', v: 'Gratis. Pago en el local: efectivo, débito, crédito y NFC.' },
            ].map((row) => (
              <div key={row.k} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'start', borderRadius: 'var(--r-md)', padding: '16px 18px', background: 'var(--psr-panel)', border: '1px solid var(--psr-border-soft)' }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--psr-blue-soft)', border: '1px solid var(--psr-border-blue)', color: 'var(--psr-cyan)' }}>
                  <Icon name={row.icon} size={21} />
                </span>
                <span style={{ display: 'grid', gap: 3 }}>
                  <span style={{ fontWeight: 800, fontSize: 15.5, color: 'var(--psr-ink)' }}>{row.k}</span>
                  <span style={{ color: 'var(--psr-muted)', lineHeight: 1.5, fontSize: 14.5 }}>{row.v}</span>
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 2 }}>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" style={{ ...buttonGhost, flex: '1 1 200px' }}>
                <Icon name="pin" size={18} /> Cómo llegar
              </a>
              <a href={buildCommercialWhatsappLink('general')} target="_blank" rel="noreferrer" style={{ ...buttonPrimary, flex: '1 1 200px' }}>
                <Icon name="whatsapp" size={18} /> Reservar por WhatsApp
              </a>
            </div>
          </div>
          <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--psr-border-soft)', minHeight: 280, position: 'relative', background: 'var(--psr-panel)' }}>
            <img src="/media/g3.jpg" alt="Patagonia SimRacing en Puerto Varas" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <a href={MAPS_URL} target="_blank" rel="noreferrer" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 18, textDecoration: 'none', background: 'linear-gradient(180deg, rgba(5,11,28,0) 40%, rgba(5,11,28,0.85) 100%)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 16px', borderRadius: 'var(--r-pill)', background: 'rgba(5,11,28,0.75)', border: '1px solid var(--psr-border-blue)', color: '#fff', fontWeight: 800, fontSize: 14, backdropFilter: 'blur(6px)' }}>
                <Icon name="pin" size={17} style={{ color: 'var(--psr-cyan)' }} /> Abrir en Google Maps
              </span>
            </a>
          </div>
        </div>
      </Reveal>

      {/* 7 · FAQ */}
      <Reveal as="section" style={section}>
        <SectionHeader icon="shield" eyebrow="Preguntas frecuentes" title="Lo importante antes de reservar" text="Solo lo necesario para decidir rápido desde el teléfono." />
        <div style={{ display: 'grid', gap: 10 }}>
          {faqCards.map((item) => <FaqItem key={item.title} q={item.title} a={item.text} />)}
        </div>
      </Reveal>

      {/* 8 · Cierre */}
      <Reveal
        as="section"
        style={{ ...section, textAlign: 'center', background: 'radial-gradient(120% 140% at 50% 0%, rgba(41,129,243,0.2) 0%, rgba(41,129,243,0) 60%), linear-gradient(180deg, var(--psr-surface) 0%, var(--psr-surface-2) 100%)' }}
      >
        <div style={{ display: 'grid', gap: 14, justifyItems: 'center', maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--t-h2)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, color: 'var(--psr-ink)' }}>El sur llueve. Tú aceleras.</h2>
          <p style={{ margin: 0, color: 'var(--psr-muted)', lineHeight: 1.6, fontSize: 'var(--t-lead)' }}>
            Reserva tu vuelta en segundos. Respuesta directa, bloques desde 30 min y pago en el local.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%', marginTop: 4 }}>
            <button onClick={goToReserve} style={{ ...buttonReserve, flex: '1 1 220px', maxWidth: 320 }}>
              <Icon name="calendar" size={19} /> Reservar ahora
            </button>
            <a href={buildCommercialWhatsappLink('general')} target="_blank" rel="noreferrer" style={{ ...buttonGhost, flex: '1 1 220px', maxWidth: 320 }}>
              <Icon name="whatsapp" size={19} /> Escríbenos
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
