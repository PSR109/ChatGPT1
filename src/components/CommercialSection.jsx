import { useMemo, useState } from 'react'

const WHATSAPP_NUMBER = '56984630196'
const INSTAGRAM_URL = 'https://www.instagram.com/patagonia_simracing_pv/'
const EMAIL = 'contacto@patagoniasimracing.cl'

const credibilityStats = [
  { value: '3', label: 'simuladores listos' },
  { value: '2 + 1', label: 'estándar y pro' },
  { value: 'F1 · Rally · GT', label: 'categorías fuertes' },
  { value: 'Reserva fácil', label: 'desde el teléfono' },
]

const benefitCards = [
  {
    title: 'Fácil de disfrutar',
    text: 'Aunque sea tu primera vez, te ayudamos a empezar rápido y disfrutar desde el primer intento.',
  },
  {
    title: 'Te dan ganas de volver',
    text: 'No es solo venir una vez: están los tiempos, los rankings y esas ganas de volver a hacerlo mejor.',
  },
  {
    title: 'Funciona para distintos planes',
    text: 'Sirve como panorama, regalo, celebración, salida con amigos o actividad para empresas.',
  },
]

const decisionCards = [
  {
    title: 'Parejas',
    text: 'Panorama distinto, entretenido y fácil de disfrutar aunque uno no tenga experiencia.',
    accent: 'rgba(244,114,182,0.18)',
    cta: 'Plan para pareja',
    actionType: 'segment',
    segment: 'aprender',
    whatsappMessage: 'Hola, quiero reservar una experiencia para pareja en Patagonia SimRacing.',
  },
  {
    title: 'Familias',
    text: 'Ideal para compartir, competir y hacer algo distinto con adultos y niños.',
    accent: 'rgba(34,197,94,0.18)',
    cta: 'Plan familiar',
    actionType: 'segment',
    segment: 'aprender',
    whatsappMessage: 'Hola, quiero reservar una experiencia familiar en Patagonia SimRacing.',
  },
  {
    title: 'Grupos',
    text: 'Perfecto para venir con amigos, celebrar y meterle competencia al panorama.',
    accent: 'rgba(96,165,250,0.18)',
    cta: 'Plan para grupo',
    actionType: 'segment',
    segment: 'evento',
    whatsappMessage: 'Hola, quiero cotizar una experiencia para grupo en Patagonia SimRacing.',
  },
  {
    title: 'Empresas',
    text: 'Team building distinto, competitivo y mucho más memorable que una actividad típica.',
    accent: 'rgba(250,204,21,0.18)',
    cta: 'Plan empresa',
    actionType: 'segment',
    segment: 'empresa',
    whatsappMessage: 'Hola, quiero cotizar una actividad para empresa en Patagonia SimRacing.',
  },
]

const offerCards = [
  {
    title: 'Personas / parejas / familias',
    text: 'Para venir solo, en pareja, con amigos o familia. Fácil de entender y entretenido desde el primer intento.',
    points: ['No necesitas experiencia', 'Ideal para probar algo distinto', 'Reserva fácil desde el teléfono'],
    cta: 'Reservar sesión',
    segment: 'aprender',
    message: 'Hola, quiero reservar una sesión en Patagonia SimRacing.',
  },
  {
    title: 'Empresas',
    text: 'Actividad distinta, competitiva y memorable para equipos, marcas o clientes.',
    points: ['Dinámica competitiva real', 'Formato adaptable al grupo', 'Cotización directa por WhatsApp'],
    cta: 'Cotizar empresa',
    segment: 'empresa',
    message: 'Hola, quiero cotizar una actividad para empresas en Patagonia SimRacing.',
  },
  {
    title: 'Eventos / celebraciones',
    text: 'Cumpleaños, grupos, activaciones y experiencias que se sienten más especiales que un panorama común.',
    points: ['Para grupos y celebraciones', 'Experiencia distinta y memorable', 'Se puede adaptar al tipo de evento'],
    cta: 'Cotizar evento',
    segment: 'evento',
    message: 'Hola, quiero cotizar un evento en Patagonia SimRacing.',
  },
]

const howItWorks = [
  {
    step: '1',
    title: 'Elige tu opción',
    text: 'Reserva una sesión o pide una cotización si es para empresa o evento.',
  },
  {
    step: '2',
    title: 'Te guiamos rápido',
    text: 'Si es tu primera vez, se adapta al nivel de la persona. No necesitas saber antes.',
  },
  {
    step: '3',
    title: 'Corres y quieres volver',
    text: 'La mezcla entre experiencia, competencia y ranking hace que no se sienta como algo de una sola vez.',
  },
]

const retentionSteps = [
  {
    title: 'Reservas fácil',
    text: 'Eliges tu opción y cierras rápido desde el teléfono.',
  },
  {
    title: 'Corres y comparas',
    text: 'La experiencia no termina al manejar: empiezas a mirar tiempos y retos.',
  },
  {
    title: 'Vuelves por mejorar',
    text: 'Ranking, desafíos y comunidad empujan a repetir la experiencia.',
  },
]

const faqCards = [
  {
    title: '¿Sirve si nunca he manejado simracing?',
    text: 'Sí. Está pensado para que cualquier persona pueda entenderlo rápido y disfrutarlo.',
  },
  {
    title: '¿Es solo para quienes ya saben de autos o simracing?',
    text: 'No. También funciona muy bien como panorama distinto, regalo, salida en pareja, familia o actividad grupal.',
  },
  {
    title: '¿Se puede hacer algo especial para grupos o empresas?',
    text: 'Sí. Si necesitas algo para un grupo, celebración o empresa, se puede conversar y adaptar.',
  },
]

const reviews = [
  {
    author: 'Tomás Chales de Beaulieu',
    text: 'Tremenda experiencia! Volveré más seguido!',
  },
  {
    author: 'Macarena Jara',
    text: 'Excelente experiencia. 100% recomendado para familias, amigos y amantes del rally y Fórmula 1. Si andan por la región de Los Lagos tienen que pasar a conocerlo.',
  },
  {
    author: 'Consuelo Encalada',
    text: 'Demasiado entretenido y buena atención, un panorama excelente para la familia.',
  },
  {
    author: 'Francisca Chereau',
    text: 'Nos gustó mucho la propuesta. Fuimos sin muchas expectativas y lo disfrutamos un montón.',
  },
  {
    author: 'Rodolfo Ardavan',
    text: 'Fui con mi hijo y lo disfrutamos mucho. Lo mejor es que nos ayudaron adaptando el juego para niños o adulto, lo que hace más entretenida la experiencia. Muy recomendado.',
  },
  {
    author: 'Evelyn Incostroza',
    text: 'Excelente servicio.',
  },
]

const wrap = {
  margin: '0 auto',
  display: 'grid',
  gap: 22,
  width: '100%',
  maxWidth: '1120px',
}

const section = {
  borderRadius: 24,
  padding: 20,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
}

const hero = {
  borderRadius: 28,
  padding: '26px 20px 20px',
  background: 'linear-gradient(180deg, rgba(8,18,48,0.98) 0%, rgba(5,11,28,0.98) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
}

const buttonPrimary = {
  minHeight: 54,
  padding: '0 20px',
  borderRadius: 16,
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  color: '#fff',
  fontWeight: 900,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  boxSizing: 'border-box',
}

const buttonSecondary = {
  minHeight: 54,
  padding: '0 20px',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  fontWeight: 900,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  boxSizing: 'border-box',
}

const iconOnlyButtonBase = {
  minHeight: 50,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '0 16px',
  color: '#fff',
  fontWeight: 800,
  minWidth: 0,
  boxSizing: 'border-box',
}

const contactCardBase = {
  minHeight: 116,
  borderRadius: 18,
  padding: '16px 18px',
  textDecoration: 'none',
  display: 'grid',
  placeItems: 'center',
  gap: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  boxSizing: 'border-box',
  minWidth: 0,
  maxWidth: '100%',
}

function buildWhatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function WhatsAppIcon({ size = 34 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path fill="#25D366" d="M16 3C8.82 3 3 8.82 3 16c0 2.31.61 4.56 1.77 6.54L3 29l6.67-1.73A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3Z" />
      <path fill="#fff" d="M23.03 18.96c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.3-.77.96-.94 1.15-.17.2-.35.22-.65.08-.3-.15-1.28-.47-2.43-1.48-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.47.13-.62.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.49-.5-.66-.5h-.57c-.2 0-.52.08-.8.38-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.2 3.08c.15.2 2.1 3.2 5.08 4.49.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  )
}

function InstagramIcon({ size = 34 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="igGradientCommercialV2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="45%" stopColor="#dd2a7b" />
          <stop offset="100%" stopColor="#515bd4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="24" height="24" rx="7" fill="url(#igGradientCommercialV2)" />
      <circle cx="16" cy="16" r="5.4" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="23" cy="9.2" r="1.5" fill="#fff" />
    </svg>
  )
}

function MailIcon({ size = 34 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect x="4" y="7" width="24" height="18" rx="4" fill="#60a5fa" />
      <path d="M7 11.2 16 17l9-5.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ContactIconButton({ href, icon, label, accent, compact = false }) {
  return (
    <a
      className="psr-commercial-contact-card"
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      style={{
        ...iconOnlyButtonBase,
        minHeight: compact ? 46 : 50,
        background: accent,
        fontSize: compact ? 14 : 15,
      }}
      aria-label={label}
      title={label}
    >
      {icon}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </a>
  )
}

function ContactCard({ href, label, detail, icon, accent = 'rgba(255,255,255,0.04)' }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      style={{
        ...contactCardBase,
        background: accent,
        color: '#fff',
      }}
    >
      {icon}
      <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1, textAlign: 'center' }}>{label}</div>
      <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 1.35, textAlign: 'center', wordBreak: 'break-word' }}>{detail}</div>
    </a>
  )
}

function ReviewCard({ review }) {
  return (
    <div
      className="psr-commercial-review-card"
      style={{
        borderRadius: 18,
        padding: 18,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'grid',
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ color: '#facc15', fontSize: 18, letterSpacing: 2, textAlign: 'center' }}>★★★★★</div>
      <div style={{ textAlign: 'center', lineHeight: 1.55, fontSize: 17 }}>“{review.text}”</div>
      <div style={{ textAlign: 'center', fontWeight: 800, color: 'rgba(255,255,255,0.82)' }}>{review.author}</div>
    </div>
  )
}

function StatCard({ item }) {
  return (
    <div
      className="psr-commercial-review-card psr-commercial-stat-card"
      style={{
        borderRadius: 18,
        padding: '16px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'grid',
        gap: 6,
        textAlign: 'center',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', wordBreak: 'break-word' }}>{item.value}</div>
      <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
    </div>
  )
}

function DecisionCard({ item, onAction }) {
  return (
    <div
      className="psr-commercial-decision-card"
      style={{
        borderRadius: 20,
        padding: 18,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'grid',
        gap: 12,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 30,
            padding: '0 12px',
            borderRadius: 999,
            background: item.accent,
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            justifySelf: 'center',
          }}
        >
          {item.title}
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, textAlign: 'center' }}>{item.title}</div>
        <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <button onClick={() => onAction(item)} style={buttonPrimary}>{item.cta}</button>
        <ContactIconButton
          href={buildWhatsappLink(item.whatsappMessage)}
          icon={<WhatsAppIcon size={20} />}
          label="WhatsApp directo"
          compact
          accent="rgba(255,255,255,0.04)"
        />
      </div>
    </div>
  )
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
      <div
        style={{
          justifySelf: 'center',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 32,
          padding: '0 14px',
          borderRadius: 999,
          background: 'rgba(59,130,246,0.14)',
          border: '1px solid rgba(96,165,250,0.24)',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#dbeafe',
          textAlign: 'center',
          maxWidth: '100%',
        }}
      >
        {eyebrow}
      </div>
      <h3 style={{ margin: 0, fontSize: 24, textAlign: 'center', lineHeight: 1.15 }}>{title}</h3>
      <p style={{ margin: 0, textAlign: 'center', color: 'rgba(255,255,255,0.76)', lineHeight: 1.55, maxWidth: 760, justifySelf: 'center' }}>{text}</p>
    </div>
  )
}

function BulletPoint({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '16px minmax(0, 1fr)', gap: 10, alignItems: 'start' }}>
      <div style={{ width: 16, height: 16, borderRadius: 999, background: 'rgba(34,197,94,0.16)', border: '1px solid rgba(34,197,94,0.22)', marginTop: 2, display: 'grid', placeItems: 'center', color: '#86efac', fontSize: 10, fontWeight: 900 }}>✓</div>
      <div style={{ color: 'rgba(255,255,255,0.86)', lineHeight: 1.45, fontSize: 14 }}>{children}</div>
    </div>
  )
}

export default function CommercialSection({ setActiveTab, onCommercialReserve }) {
  const [showMoreReviews, setShowMoreReviews] = useState(false)
  const visibleReviews = useMemo(() => reviews.slice(0, 3), [])
  const extraReviews = useMemo(() => reviews.slice(3), [])

  const reserveNow = () => {
    if (typeof onCommercialReserve === 'function') {
      onCommercialReserve({ segment: 'aprender' })
      return
    }
    if (typeof setActiveTab === 'function') setActiveTab('reservas')
  }

  const goToSegment = (segment) => {
    if (segment === 'aprender') {
      reserveNow()
      return
    }

    if (typeof onCommercialReserve === 'function') {
      onCommercialReserve({ segment })
      return
    }

    if (typeof setActiveTab === 'function') setActiveTab('reservas')
  }

  const handleDecisionAction = (item) => {
    if (item.actionType === 'segment' && item.segment) {
      goToSegment(item.segment)
      return
    }
    reserveNow()
  }

  return (
    <div style={wrap}>
      <style>{`
        @media (max-width: 860px) {
          .psr-commercial-hero-grid,
          .psr-commercial-offers,
          .psr-commercial-reviews,
          .psr-commercial-contact-grid,
          .psr-commercial-how,
          .psr-commercial-benefits,
          .psr-commercial-faq,
          .psr-commercial-stats,
          .psr-commercial-main-actions,
          .psr-commercial-side-actions,
          .psr-commercial-decision-grid,
          .psr-commercial-retention-grid {
            grid-template-columns: 1fr !important;
          }

          .psr-commercial-hero-copy,
          .psr-commercial-hero-panel {
            padding: 0 !important;
          }

          .psr-commercial-hero-grid {
            gap: 16px !important;
          }
        }

        @media (max-width: 560px) {
          .psr-commercial-section-card {
            padding: 18px !important;
            border-radius: 20px !important;
          }

          .psr-commercial-hero {
            padding: 22px 16px 18px !important;
            border-radius: 24px !important;
          }

          .psr-commercial-offer-card,
          .psr-commercial-value-card,
          .psr-commercial-step-card,
          .psr-commercial-faq-card,
          .psr-commercial-review-card,
          .psr-commercial-contact-card,
          .psr-commercial-stat-card,
          .psr-commercial-decision-card,
          .psr-commercial-retention-card {
            border-radius: 18px !important;
          }
        }
      `}</style>

      <section className="psr-commercial-hero" style={{ ...hero, boxShadow: '0 26px 60px rgba(2,6,23,0.34)' }}>
        <div className="psr-commercial-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.9fr)', gap: 18, alignItems: 'stretch' }}>
          <div className="psr-commercial-hero-copy" style={{ display: 'grid', gap: 14, minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 34,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(59,130,246,0.14)',
                border: '1px solid rgba(96,165,250,0.30)',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#dbeafe',
                justifySelf: 'start',
                maxWidth: '100%',
              }}
            >
              PSR para ti
            </div>

            <h2 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.03, maxWidth: 720 }}>
              Una experiencia distinta, entretenida y fácil de reservar
            </h2>

            <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.6, maxWidth: 760 }}>
              Ideal para venir solo, en pareja, con amigos, en familia o para organizar una actividad distinta con tu empresa o grupo.
            </p>

            <div className="psr-commercial-main-actions" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 12 }}>
              <button onClick={reserveNow} style={buttonPrimary}>Reservar ahora</button>
              <ContactIconButton
                href={buildWhatsappLink('Hola, quiero reservar o cotizar en Patagonia SimRacing.')}
                icon={<WhatsAppIcon size={22} />}
                label="Cotizar por WhatsApp"
                accent="linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(22,163,74,0.12) 100%)"
              />
            </div>

            <div className="psr-commercial-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
              {credibilityStats.map((item) => <StatCard key={item.label} item={item} />)}
            </div>
          </div>

          <div
            className="psr-commercial-hero-panel"
            style={{
              minWidth: 0,
              borderRadius: 22,
              padding: 18,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'grid',
              gap: 14,
              alignContent: 'start',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd' }}>
              Elige tu experiencia
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
              Elige la experiencia que más te acomode
            </div>
            <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
              Todo está ordenado para que encuentres rápido si quieres venir por entretención, celebrar algo o cotizar para tu empresa.
            </div>
            <div className="psr-commercial-side-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <ContactIconButton
                href={INSTAGRAM_URL}
                icon={<InstagramIcon size={20} />}
                label="Ver Instagram"
                accent="linear-gradient(135deg, rgba(245,133,41,0.16) 0%, rgba(221,42,123,0.12) 50%, rgba(81,91,212,0.12) 100%)"
              />
              <ContactIconButton
                href={`mailto:${EMAIL}`}
                icon={<MailIcon size={20} />}
                label="Enviar correo"
                accent="linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.14) 100%)"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="psr-commercial-section-card" style={{ ...section, background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)' }}>
        <SectionIntro eyebrow="Elige tu experiencia" title="¿Qué experiencia estás buscando?" text="Elige la opción que más se parezca a tu plan y avanza por el camino correcto sin enredos." />
        <div className="psr-commercial-decision-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          {decisionCards.map((item) => (
            <DecisionCard key={item.title} item={item} onAction={handleDecisionAction} />
          ))}
        </div>
      </section>

      <section className="psr-commercial-section-card" style={{ ...section, background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)' }}>
        <SectionIntro eyebrow="Por qué gusta tanto" title="Por qué tantas personas disfrutan PSR" text="Es fácil de entender, entretenido desde el primer minuto y dan ganas reales de volver." />
        <div className="psr-commercial-benefits" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {benefitCards.map((item) => (
            <div
              key={item.title}
              className="psr-commercial-value-card"
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18, textAlign: 'center' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="psr-commercial-section-card" style={{ ...section, background: 'linear-gradient(180deg, rgba(8,18,48,0.64) 0%, rgba(255,255,255,0.03) 100%)' }}>
        <SectionIntro eyebrow="Tus opciones" title="Elige tu opción" text="Si vienes a correr por entretención, organizar un evento o cotizar para tu empresa, aquí encuentras la opción correcta." />
        <div className="psr-commercial-offers" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {offerCards.map((item) => (
            <div
              key={item.title}
              className="psr-commercial-offer-card"
              style={{
                borderRadius: 22,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 14,
                minWidth: 0,
              }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontWeight: 900, fontSize: 21, textAlign: 'center' }}>{item.title}</div>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{item.text}</div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {item.points.map((point) => (
                  <div
                    key={point}
                    style={{
                      minHeight: 40,
                      borderRadius: 14,
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <BulletPoint>{point}</BulletPoint>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <button onClick={() => goToSegment(item.segment)} style={buttonPrimary}>{item.cta}</button>
                <ContactIconButton
                  href={buildWhatsappLink(item.message)}
                  icon={<WhatsAppIcon size={20} />}
                  label="WhatsApp directo"
                  compact
                  accent="rgba(255,255,255,0.04)"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="psr-commercial-section-card" style={section}>
        <SectionIntro eyebrow="Para seguir volviendo" title="No es una experiencia para una sola vez" text="Muchos vienen una vez y después quieren volver para mejorar tiempos, probar otros autos o competir con más gente." />
        <div className="psr-commercial-retention-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {retentionSteps.map((item, index) => (
            <div
              key={item.title}
              className="psr-commercial-retention-card"
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  background: 'rgba(59,130,246,0.16)',
                  border: '1px solid rgba(96,165,250,0.22)',
                  justifySelf: 'center',
                }}
              >
                {index + 1}
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, textAlign: 'center' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="psr-commercial-section-card" style={section}>
        <SectionIntro eyebrow="Así de simple" title="Cómo funciona" text="Reservar o cotizar es simple, rápido y pensado para hacerlo cómodo desde el teléfono." />
        <div className="psr-commercial-how" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {howItWorks.map((item) => (
            <div
              key={item.step}
              className="psr-commercial-step-card"
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  background: 'rgba(34,197,94,0.16)',
                  border: '1px solid rgba(34,197,94,0.22)',
                  justifySelf: 'center',
                }}
              >
                {item.step}
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, textAlign: 'center' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="psr-commercial-section-card" style={section}>
        <SectionIntro eyebrow="Opiniones reales" title="Lo que dice la gente" text="Opiniones reales de personas que ya vinieron a vivir la experiencia." />

        <div className="psr-commercial-reviews" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {visibleReviews.map((review) => (
            <ReviewCard key={review.author} review={review} />
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <button onClick={() => setShowMoreReviews((value) => !value)} style={buttonSecondary}>
            {showMoreReviews ? 'Ver menos' : 'Ver más reseñas'}
          </button>
        </div>

        {showMoreReviews && (
          <div className="psr-commercial-reviews" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginTop: 14 }}>
            {extraReviews.map((review) => (
              <ReviewCard key={review.author} review={review} />
            ))}
          </div>
        )}
      </section>

      <section className="psr-commercial-section-card" style={section}>
        <SectionIntro eyebrow="Preguntas frecuentes" title="Preguntas rápidas" text="Respuestas claras para que sepas rápido si esto es para ti, tu familia, tu grupo o tu empresa." />
        <div className="psr-commercial-faq" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {faqCards.map((item) => (
            <div
              key={item.title}
              className="psr-commercial-faq-card"
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 17, textAlign: 'center' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="psr-commercial-section-card psr-commercial-cta"
        style={{
          ...section,
          background: 'linear-gradient(180deg, rgba(4,22,68,0.95) 0%, rgba(4,11,30,0.96) 100%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 34,
            padding: '0 14px',
            borderRadius: 999,
            background: 'rgba(34,197,94,0.14)',
            border: '1px solid rgba(34,197,94,0.22)',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#dcfce7',
            maxWidth: '100%',
          }}
        >
          Reserva o cotiza hoy
        </div>
        <h3 style={{ margin: '14px 0 10px', fontSize: 'clamp(28px, 4vw, 44px)' }}>Haz tu reserva o cotiza aquí</h3>
        <p style={{ margin: '0 auto 18px', maxWidth: 760, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, fontSize: 17 }}>
          Reserva tu sesión, cotiza por WhatsApp o mira Instagram para ver cómo se vive la experiencia en PSR.
        </p>

        <div className="psr-commercial-contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <ContactCard
            href={buildWhatsappLink('Hola, quiero reservar o cotizar en Patagonia SimRacing.')}
            label="WhatsApp"
            detail="Reserva o cotiza directo"
            icon={<WhatsAppIcon />}
            accent="linear-gradient(135deg, rgba(34,197,94,0.22) 0%, rgba(22,163,74,0.18) 100%)"
          />
          <ContactCard
            href={INSTAGRAM_URL}
            label="Instagram"
            detail="Mira la experiencia real"
            icon={<InstagramIcon />}
            accent="linear-gradient(135deg, rgba(245,133,41,0.18) 0%, rgba(221,42,123,0.16) 50%, rgba(81,91,212,0.16) 100%)"
          />
          <ContactCard
            href={`mailto:${EMAIL}`}
            label="Correo"
            detail={EMAIL}
            icon={<MailIcon />}
            accent="linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.14) 100%)"
          />
        </div>
      </section>
    </div>
  )
}
