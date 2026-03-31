import { useEffect, useState } from 'react'
import SectionCard from './SectionCard'
import SectionContentSpacing from './SectionContentSpacing'
import AdminTextInput from './AdminTextInput'
import StatusMessage from './StatusMessage'
import { normalizeTextInput } from '../utils/psrUtils'

function SummaryBox({ label, value, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250, 204, 21, 0.30)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 14,
        textAlign: 'center',
        background: strong
          ? 'linear-gradient(180deg, rgba(250, 204, 21, 0.14), rgba(250, 204, 21, 0.06))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
        boxShadow: strong ? '0 14px 24px rgba(250, 204, 21, 0.08)' : 'none',
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.72, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6, wordBreak: 'break-word' }}>{value}</div>
    </div>
  )
}

export default function LapTimeEditorSection({
  isAdmin,
  lapEditId,
  lapEditPlayer,
  setLapEditPlayer,
  lapEditCountry,
  setLapEditCountry,
  lapEditGame,
  setLapEditGame,
  lapEditTrack,
  setLapEditTrack,
  lapEditCar,
  setLapEditCar,
  lapEditTime,
  setLapEditTime,
  lapEditMessage,
  createOrUpdateLapTime,
  isEditingLapTime,
  cancelEditLapTime,
  normalizeText,
  card,
  sectionTitle,
  formGrid,
  input,
  buttonRow,
  button,
  buttonSecondary,
  messageStyle,
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  if (!isAdmin) return null

  const hasCoreData =
    Boolean(lapEditPlayer) ||
    Boolean(lapEditGame) ||
    Boolean(lapEditTrack) ||
    Boolean(lapEditCar) ||
    Boolean(lapEditTime)

  return (
    <SectionCard title='🛠️ Gestión de tiempos' card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          border: '1px solid rgba(59,130,246,0.20)',
          borderRadius: 20,
          padding: isMobile ? 14 : 18,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(34,197,94,0.10))',
          textAlign: 'center',
          marginBottom: 18,
          boxShadow: '0 16px 34px rgba(8,15,35,0.24)',
        }}
      >
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900 }}>Carga rápida de tiempos</div>
        <div style={{ marginTop: 8, opacity: 0.82, maxWidth: 780, marginInline: 'auto', lineHeight: 1.45 }}>
          Carga o corrige registros sin salir de la vista principal. Pensado para hacerlo rápido desde teléfono, tablet o PC.
        </div>

        <div
          style={{
            display: 'grid',
            gap: 10,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            marginTop: 14,
          }}
        >
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.72 }}>Modo</div>
            <div style={{ marginTop: 5, fontWeight: 800 }}>{isEditingLapTime ? 'Corrección rápida' : 'Carga rápida'}</div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.72 }}>Uso ideal</div>
            <div style={{ marginTop: 5, fontWeight: 800 }}>Teléfono, tablet o PC</div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.72 }}>Objetivo</div>
            <div style={{ marginTop: 5, fontWeight: 800 }}>Registrar sin fricción</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(150px, 1fr))',
          marginBottom: 20,
        }}
      >
        <SummaryBox label='Modo' value={isEditingLapTime ? 'Edición' : 'Creación'} strong={isEditingLapTime} />
        <SummaryBox label='Registro' value={lapEditId ? `#${lapEditId}` : 'Nuevo'} />
        <SummaryBox label='Piloto' value={lapEditPlayer || '-'} />
        <SummaryBox label='Juego' value={lapEditGame || '-'} />
        <SummaryBox label='Circuito / Etapa' value={lapEditTrack || '-'} />
      </div>

      <SectionContentSpacing>
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: isMobile ? 12 : 14,
            background: 'rgba(255,255,255,0.03)',
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.66 }}>Checklist</div>
          <div style={{ marginTop: 6, fontWeight: 700, lineHeight: 1.45 }}>
            Completa piloto, juego, circuito, auto y tiempo para guardar sin dudas.
          </div>
        </div>

        <div style={{ ...formGrid, gridTemplateColumns: isMobile ? '1fr' : formGrid.gridTemplateColumns }}>
          <AdminTextInput
            value={lapEditPlayer}
            onChange={(e) => setLapEditPlayer(normalizeTextInput(e.target.value))}
            placeholder='PILOTO'
            style={input}
          />

          <AdminTextInput
            value={lapEditCountry}
            onChange={(e) => setLapEditCountry(normalizeTextInput(e.target.value))}
            placeholder='PAÍS'
            style={input}
          />

          <AdminTextInput
            value={lapEditGame}
            onChange={(e) => setLapEditGame(normalizeTextInput(e.target.value))}
            placeholder='JUEGO'
            style={input}
          />

          <AdminTextInput
            value={lapEditTrack}
            onChange={(e) => setLapEditTrack(normalizeTextInput(e.target.value))}
            placeholder='CIRCUITO / ETAPA'
            style={input}
          />

          <AdminTextInput
            value={lapEditCar}
            onChange={(e) => setLapEditCar(normalizeTextInput(e.target.value))}
            placeholder='AUTO'
            style={input}
          />

          <AdminTextInput
            value={lapEditTime}
            onChange={(e) => setLapEditTime(e.target.value)}
            placeholder='TIEMPO EJ: 1:28.500'
            style={input}
          />
        </div>
      </SectionContentSpacing>

      <div
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: isMobile ? 12 : 14,
          background: 'rgba(255,255,255,0.03)',
          marginTop: 18,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 13, opacity: 0.76 }}>
          {isEditingLapTime ? 'Revisa los cambios y guarda' : 'Carga el registro y guárdalo al toque'}
        </div>
        <div style={{ ...buttonRow, marginTop: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={createOrUpdateLapTime} style={button}>
          {isEditingLapTime ? 'Guardar cambios' : 'Crear tiempo'}
        </button>

        <button onClick={cancelEditLapTime} style={buttonSecondary}>
          {hasCoreData ? 'Limpiar formulario' : 'Cancelar'}
        </button>
        </div>
      </div>

      <StatusMessage
        text={lapEditMessage || (isEditingLapTime ? 'Editando tiempo existente' : 'Panel listo para cargar nuevos tiempos')}
        messageStyle={messageStyle}
      />
    </SectionCard>
  )
}
