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

const explainers = [
  {
    title: 'Qué es PSR',
    text: 'Patagonia SimRacing es una experiencia de simulación de carreras en Puerto Varas pensada para que cualquier persona la disfrute, incluso si nunca ha probado simracing antes.',
  },
  {
    title: 'Cómo se vive',
    text: 'Vienes, corres, comparas tiempos y disfrutas una experiencia más inmersiva que un panorama común.',
  },
  {
    title: 'Para quién sirve',
    text: 'Funciona para personas, parejas, familias, amigos, grupos, celebraciones y también para empresas.',
  },
]

const optionCards = [
  {
    title: 'Reservar experiencia',
    text: 'La opción más directa si quieres venir a correr y asegurar tu horario rápido.',
    action: 'reserve',
    button: 'Ir a reservas',
  },
  {
    title: 'Grupo o evento',
    text: 'Ideal si quieres cotizar cumpleaños, grupos o una actividad especial.',
    action: 'evento',
    button: 'Cotizar grupo o evento',
  },
  {
    title: 'Empresa',
    text: 'Para team building, activaciones o experiencias distintas para equipos.',
    action: 'empresa',
    button: 'Cotizar empresa',
  },
]

const whyPeopleLove = [
  'No necesitas experiencia para pasarlo bien desde la primera sesión.',
  'La mezcla entre simulación, competencia y tiempos hace que den ganas de volver.',
  'Sirve como panorama distinto para venir solo, con amigos, familia o pareja.',
  'También funciona muy bien para grupos, celebraciones y empresas.',
]

const faqCards = [
  {
    title: '¿Sirve si nunca he manejado simracing?',
    text: 'Sí. Está pensado para que cualquier persona lo entienda rápido y lo disfrute.',
  },
  {
    title: '¿Es solo para quienes saben de autos o simracing?',
    text: 'No. También funciona muy bien como panorama, regalo, salida distinta o actividad grupal.',
  },
  {
    title: '¿Se puede hacer algo especial para grupos o empresas?',
    text: 'Sí. Se puede conversar el formato, la duración y la disponibilidad según el caso.',
  },
  {
    title: '¿Dónde está ubicado?',
    text: 'PSR está en Puerto Varas y la idea es que reserves fácil y llegues directo a correr.',
  },
  {
    title: '¿Cómo reservo o cotizo?',
    text: 'Puedes reservar desde la app o escribir por WhatsApp si necesitas un formato especial.',
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
      onCommercialReserve({ segment: 'aprender' })
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

  const handleOptionClick = (action) => {
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
          .psr-commercial-grid-3,
          .psr-commercial-grid-2,
          .psr-commercial-reviews,
          .psr-commercial-faq {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={{ ...section, background: 'linear-gradient(180deg, rgba(8,18,48,0.98) 0%, rgba(5,11,28,0.98) 100%)' }}>
        <SectionIntro
          eyebrow="Qué es PSR"
          title="Entiende rápido de qué se trata"
          text="PSR es una experiencia de simulación de carreras pensada para que cualquier persona pueda disfrutarla, reservar fácil y volver por mejorar sus tiempos."
        />
        <div className="psr-commercial-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {explainers.map((item) => (
            <div
              key={item.title}
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

      <section style={section}>
        <SectionIntro
          eyebrow="Elige tu opción"
          title="Toma el camino correcto sin vueltas"
          text="Si quieres venir a correr, reserva. Si es para grupo, evento o empresa, cotiza directo y avanzas más rápido."
        />
        <div className="psr-commercial-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {optionCards.map((item, index) => (
            <div
              key={item.title}
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
              <div style={{ fontWeight: 900, fontSize: 20, textAlign: 'center' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, textAlign: 'center' }}>{item.text}</div>
              <button onClick={() => handleOptionClick(item.action)} style={index === 0 ? buttonPrimary : buttonSecondary}>
                {item.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <SectionIntro
          eyebrow="Por qué tantas personas disfrutan de PSR"
          title="La experiencia es fácil de entender y dan ganas de repetir"
          text="Eso hace que funcione bien tanto para primera vez como para quienes vuelven buscando mejorar tiempos o compartirlo con otros."
        />
        <div className="psr-commercial-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          {whyPeopleLove.map((item) => (
            <div
              key={item}
              style={{
                borderRadius: 18,
                padding: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.86)',
                lineHeight: 1.55,
                textAlign: 'center',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <SectionIntro
          eyebrow="Preguntas frecuentes"
          title="Lo importante antes de reservar o cotizar"
          text="Solo lo necesario para entender rápido si PSR te calza y cómo avanzar."
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
          title="Lo que ya dicen quienes fueron"
          text="Prueba social real para entender rápido por qué la gente lo recomienda y vuelve."
        />
        <div className="psr-commercial-reviews" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {reviews.map((review) => <ReviewCard key={`${review.author}-${review.text}`} review={review} />)}
        </div>
      </section>
    </div>
  )
}
