import { buildCommercialWhatsappLink } from '../utils/whatsappHelper'

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

const trustPills = [
  'Puerto Varas',
  'Sin experiencia previa',
  'Bloques de 30 min',
  'Hasta 3 simuladores',
]

const sections = [
  {
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
    eyebrow: 'Eventos y grupos',
    title: 'Una opción simple para cumpleaños, celebraciones y salidas en grupo',
    text: 'Si quieren hacer algo distinto y fácil de coordinar, esta opción funciona muy bien para grupos.',
    highlights: [
      'Sirve para cumpleaños, celebraciones y panoramas grupales.',
      'Se puede coordinar según cantidad de personas y tiempo disponible.',
      'La experiencia es fácil de entender incluso si van personas muy distintas entre sí.',
    ],
    button: 'Cotizar evento',
    action: 'evento',
  },
  {
    eyebrow: 'Empresas',
    title: 'Una actividad distinta para equipos de trabajo',
    text: 'Si buscan una experiencia más entretenida que una actividad típica, aquí pueden coordinar algo claro y fácil de organizar.',
    highlights: [
      'Buena opción para team building y actividades de equipo.',
      'Se puede conversar formato, duración y disponibilidad.',
      'Es una experiencia competitiva, entretenida y fácil de entender.',
    ],
    button: 'Cotizar empresa',
    action: 'empresa',
  },
  {
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
  {
    title: '¿Hay edad mínima o máxima?',
    text: 'Es para todas las edades, mientras alcances los pedales y el volante para manejar con control.',
  },

  {
    title: '¿Sirve si es mi primera vez?',
    text: 'Sí. No necesitas experiencia previa para venir y disfrutarlo.',
  },
  {
    title: '¿Cómo reservo?',
    text: 'Puedes reservar directo desde la app o escribir por WhatsApp si necesitas coordinar algo especial.',
  },
  {
    title: '¿Sirve para grupos o empresas?',
    text: 'Sí. Puedes cotizar por WhatsApp y revisar una opción según tu caso.',
  },
  {
    title: '¿Sirve para practicar manejo?',
    text: 'Sí, pero no enseñamos a manejar. Puedes venir a practicar solo o con alguien que te acompañe.',
  },
]

const wrap = {
  margin: '0 auto',
  display: 'grid',
  gap: 20,
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

const buttonPrimary = {
  minHeight: 52,
  padding: '0 18px',
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
  ...buttonPrimary,
  background: 'linear-gradient(135deg, rgba(59,130,246,0.24) 0%, rgba(37,99,235,0.18) 100%)',
  border: '1px solid rgba(96,165,250,0.28)',
}

const stickyCtaWrap = {
  display: 'grid',
  gap: 10,
  marginBottom: 18,
}

const trustRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
  marginBottom: 18,
}

const trustPillStyle = {
  padding: '8px 11px',
  borderRadius: 999,
  background: 'rgba(41,129,243,0.12)',
  border: '1px solid rgba(41,129,243,0.18)',
  color: '#DCEBFF',
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.2,
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
      <p
        style={{
          margin: 0,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.76)',
          lineHeight: 1.55,
          maxWidth: 760,
          justifySelf: 'center',
        }}
      >
        {text}
      </p>
    </div>
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
        minWidth: 0,
      }}
    >
      <div style={{ color: '#facc15', fontSize: 18, letterSpacing: 2, textAlign: 'center' }}>★★★★★</div>
      <div style={{ textAlign: 'center', lineHeight: 1.55, fontSize: 17 }}>“{review.text}”</div>
      <div style={{ textAlign: 'center', fontWeight: 800, color: 'rgba(255,255,255,0.82)' }}>{review.author}</div>
    </div>
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
        @media (max-width: 860px) {
          .psr-commercial-grid-4,
          .psr-commercial-grid-2,
          .psr-commercial-reviews,
          .psr-commercial-faq {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={{ ...section, background: 'linear-gradient(180deg, rgba(8,18,48,0.98) 0%, rgba(5,11,28,0.98) 100%)' }}>
        <div style={stickyCtaWrap}>
          <button onClick={goToReserve} style={buttonPrimary}>
            Reservar ahora
          </button>
          <a href={buildCommercialWhatsappLink('general')} target="_blank" rel="noreferrer" style={buttonSecondary}>
            Hablar por WhatsApp
          </a>
        </div>

        <SectionIntro
          eyebrow="Patagonia SimRacing"
          title="Una experiencia distinta para correr, competir y pasarlo bien"
          text="Reserva fácil desde el teléfono y elige la opción que mejor te calce: venir por entretención, coordinar un grupo, cotizar para empresa o practicar para ganar confianza."
        />

        <div style={trustRowStyle}>
          {trustPills.map((item) => (
            <span key={item} style={trustPillStyle}>{item}</span>
          ))}
        </div>
      </section>

      <section style={section}>
        <div className="psr-commercial-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          {sections.map((item, index) => (
            <div
              key={item.title}
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 14,
                minWidth: 0,
              }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#dbeafe', textAlign: 'center' }}>
                  {item.eyebrow}
                </div>
                <div style={{ fontWeight: 900, fontSize: 20, textAlign: 'center', lineHeight: 1.2 }}>{item.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {item.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.86)',
                      lineHeight: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              <button onClick={() => handleAction(item.action)} style={index === 0 ? buttonPrimary : buttonSecondary}>
                {item.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <SectionIntro
          eyebrow="Preguntas frecuentes"
          title="Lo importante antes de reservar"
          text="Solo lo necesario para decidir rápido desde el teléfono."
        />
        <div className="psr-commercial-faq" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          {faqCards.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 17, textAlign: 'center' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <SectionIntro
          eyebrow="Comentarios de Google"
          title="Lo que dicen quienes ya fueron"
          text="Opiniones reales para que veas rápido cómo se vive la experiencia."
        />
        <div className="psr-commercial-reviews" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {reviews.map((review) => <ReviewCard key={`${review.author}-${review.text}`} review={review} />)}
        </div>

        <div style={{ ...stickyCtaWrap, marginTop: 18, marginBottom: 0 }}>
          <button onClick={goToReserve} style={buttonPrimary}>
            Reservar ahora
          </button>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.68)', fontSize: 12, lineHeight: 1.45 }}>
            Si necesitas coordinar algo especial, escríbenos por WhatsApp.
          </div>
        </div>
      </section>
    </div>
  )
}
