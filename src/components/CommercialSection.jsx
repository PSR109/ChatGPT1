import { useMemo, useState } from 'react'

const WHATSAPP_NUMBER = '56984630196'
const INSTAGRAM_URL = 'https://www.instagram.com/patagonia_simracing_pv/'
const EMAIL = 'contacto@patagoniasimracing.cl'

const quickCards = [
  {
    title: 'Simuladores',
    text: '3 puestos disponibles: 2 estándar y 1 pro.',
    message: 'Hola, quiero más información sobre los simuladores de Patagonia SimRacing.',
  },
  {
    title: 'Experiencia',
    text: 'Sirve para competir, practicar o regalar una experiencia distinta.',
    message: 'Hola, quiero más información sobre la experiencia de Patagonia SimRacing.',
  },
  {
    title: 'Juegos',
    text: 'F1, rally, GT y otras categorías para distintos gustos.',
    message: 'Hola, quiero saber qué juegos hay disponibles en Patagonia SimRacing.',
  },
  {
    title: 'Desafío',
    text: 'Ranking en vivo, tiempos y ganas de volver a mejorar.',
    message: 'Hola, quiero más información sobre el ranking y los desafíos de Patagonia SimRacing.',
  },
]

const offerCards = [
  {
    title: 'Venir a correr',
    text: 'Reserva una sesión y corre por gusto, por desafío o por pasar un buen rato.',
    cta: 'Reservar ahora',
    segment: 'aprender',
    message: 'Hola, quiero reservar una sesión para venir a correr a Patagonia SimRacing.',
  },
  {
    title: 'Empresas',
    text: 'Team building, competencias internas y una actividad distinta para equipos.',
    cta: 'Cotizar experiencia',
    segment: 'empresa',
    message: 'Hola, quiero cotizar una actividad para empresas en Patagonia SimRacing.',
  },
  {
    title: 'Eventos',
    text: 'Cumpleaños, celebraciones, activaciones y grupos que quieran algo diferente.',
    cta: 'Consultar evento',
    segment: 'evento',
    message: 'Hola, quiero cotizar un evento en Patagonia SimRacing.',
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
  maxWidth: 1120,
  margin: '0 auto',
  display: 'grid',
  gap: 22,
}

const section = {
  borderRadius: 24,
  padding: 20,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const hero = {
  borderRadius: 24,
  padding: '28px 22px',
  background: 'linear-gradient(180deg, rgba(10,18,44,0.98) 0%, rgba(6,12,30,0.98) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  textAlign: 'center',
}

const grid4 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
}

const grid3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
}

const buttonPrimary = {
  minHeight: 52,
  padding: '0 20px',
  borderRadius: 14,
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  color: '#fff',
  fontWeight: 800,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const buttonSecondary = {
  minHeight: 52,
  padding: '0 20px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  fontWeight: 800,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const iconOnlyButtonBase = {
  minHeight: 52,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '0 18px',
  color: '#fff',
  fontWeight: 800,
}

const contactCardBase = {
  minHeight: 112,
  borderRadius: 18,
  padding: '16px 18px',
  textDecoration: 'none',
  display: 'grid',
  placeItems: 'center',
  gap: 8,
  border: '1px solid rgba(255,255,255,0.1)',
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
        <linearGradient id="igGradientCommercial" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="45%" stopColor="#dd2a7b" />
          <stop offset="100%" stopColor="#515bd4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="24" height="24" rx="7" fill="url(#igGradientCommercial)" />
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
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      style={{
        ...iconOnlyButtonBase,
        minHeight: compact ? 46 : 52,
        background: accent,
        fontSize: compact ? 14 : 15,
      }}
      aria-label={label}
      title={label}
    >
      {icon}
      <span>{label}</span>
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
      <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 1.35, textAlign: 'center' }}>{detail}</div>
    </a>
  )
}

function ReviewCard({ review }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 18,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ color: '#facc15', fontSize: 18, letterSpacing: 2, textAlign: 'center' }}>★★★★★</div>
      <div style={{ textAlign: 'center', lineHeight: 1.55, fontSize: 17 }}>“{review.text}”</div>
      <div style={{ textAlign: 'center', fontWeight: 800, color: 'rgba(255,255,255,0.82)' }}>{review.author}</div>
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

  return (
    <div style={wrap}>
      <style>{`
        @media (max-width: 860px) {
          .psr-commercial-actions,
          .psr-commercial-footer,
          .psr-commercial-offers,
          .psr-commercial-reviews,
          .psr-commercial-contact-grid,
          .psr-commercial-top-icons {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={hero}>
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
          }}
        >
          PSR para todos
        </div>

        <h2 style={{ margin: '14px auto 10px', fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.05, maxWidth: 860 }}>
          Simracing real, simple de entender y listo para reservar
        </h2>
        <p style={{ margin: '0 auto', maxWidth: 820, color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.55 }}>
          Ven a correr, mejorar, competir o vivir una experiencia distinta en Patagonia SimRacing. Solo elige tu opción y avanza.
        </p>

        <div className="psr-commercial-actions" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 12, marginTop: 18 }}>
          <button onClick={reserveNow} style={buttonPrimary}>Reservar ahora</button>
          <div className="psr-commercial-top-icons" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <ContactIconButton
              href={buildWhatsappLink('Hola, quiero cotizar una experiencia en Patagonia SimRacing.')}
              icon={<WhatsAppIcon size={22} />}
              label="WhatsApp"
              accent="linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(22,163,74,0.12) 100%)"
            />
            <ContactIconButton
              href={INSTAGRAM_URL}
              icon={<InstagramIcon size={22} />}
              label="Instagram"
              accent="linear-gradient(135deg, rgba(245,133,41,0.16) 0%, rgba(221,42,123,0.12) 50%, rgba(81,91,212,0.12) 100%)"
            />
          </div>
        </div>
      </section>

      <section style={section}>
        <h3 style={{ margin: '0 0 14px', fontSize: 22, textAlign: 'center' }}>Qué hay en PSR</h3>
        <div style={grid4}>
          {quickCards.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 18,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                textAlign: 'center',
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 17 }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>{item.text}</div>
              <ContactIconButton
                href={buildWhatsappLink(item.message)}
                icon={<WhatsAppIcon size={20} />}
                label="Consultar"
                compact
                accent="rgba(255,255,255,0.04)"
              />
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <h3 style={{ margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>Qué ofrecemos</h3>
        <p style={{ margin: '0 0 16px', textAlign: 'center', color: 'rgba(255,255,255,0.76)', lineHeight: 1.5 }}>
          Opciones claras para clientes actuales y potenciales, sin vueltas.
        </p>
        <div className="psr-commercial-offers" style={grid3}>
          {offerCards.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 20, textAlign: 'center' }}>{item.title}</div>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{item.text}</div>
              <button onClick={() => goToSegment(item.segment)} style={buttonPrimary}>{item.cta}</button>
              <ContactIconButton
                href={buildWhatsappLink(item.message)}
                icon={<WhatsAppIcon size={20} />}
                label="WhatsApp directo"
                compact
                accent="rgba(255,255,255,0.04)"
              />
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <h3 style={{ margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>Lo que dice la gente</h3>
        <p style={{ margin: '0 0 16px', textAlign: 'center', color: 'rgba(255,255,255,0.76)', lineHeight: 1.5 }}>
          Reseñas reales de Google. Eso vende mejor que cualquier texto inventado.
        </p>

        <div className="psr-commercial-reviews" style={grid3}>
          {visibleReviews.map((review) => (
            <ReviewCard key={review.author} review={review} />
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <button onClick={() => setShowMoreReviews((value) => !value)} style={{ ...buttonSecondary, width: '100%' }}>
            {showMoreReviews ? 'Ver menos' : 'Ver más reseñas'}
          </button>
        </div>

        {showMoreReviews && (
          <div className="psr-commercial-reviews" style={{ ...grid3, marginTop: 14 }}>
            {extraReviews.map((review) => (
              <ReviewCard key={review.author} review={review} />
            ))}
          </div>
        )}
      </section>

      <section style={section}>
        <h3 style={{ margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>Ver más</h3>
        <p style={{ margin: '0 0 16px', textAlign: 'center', color: 'rgba(255,255,255,0.76)', lineHeight: 1.5 }}>
          Si alguien necesita entenderlo mejor antes de reservar, acá está la versión corta y clara.
        </p>

        <div style={grid3}>
          <div style={{ borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>Para volver</div>
            <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>
              Vuelves para bajar tiempos, probar otra categoría, competir con otros o traer a alguien más.
            </div>
          </div>
          <div style={{ borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>Si es tu primera vez</div>
            <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>
              No necesitas experiencia previa. Se adapta al nivel de cada persona y se entiende rápido.
            </div>
          </div>
          <div style={{ borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>Para cerrar ahora</div>
            <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>
              Reserva una sesión, cotiza por WhatsApp o revisa Instagram para ver mejor la experiencia real.
            </div>
          </div>
        </div>
      </section>

      <section
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
          }}
        >
          Reserva o cotiza hoy
        </div>
        <h3 style={{ margin: '14px 0 10px', fontSize: 'clamp(28px, 4vw, 44px)' }}>Simple, directo y listo para cerrar</h3>
        <p style={{ margin: '0 auto 18px', maxWidth: 760, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, fontSize: 17 }}>
          Reserva una sesión, pide una cotización por WhatsApp o revisa Instagram para ver mejor la experiencia. La idea es que avancen ahora, no después.
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
