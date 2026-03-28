import SectionCard from './SectionCard'
import SectionContentSpacing from './SectionContentSpacing'
import AdminTextInput from './AdminTextInput'
import AdminSelect from './AdminSelect'
import PrimarySecondaryActions from './PrimarySecondaryActions'
import StatusMessage from './StatusMessage'

function SummaryBox({ label, value, strong = false }) {
  return (
    <div
      style={{
        border: strong ? '1px solid rgba(250, 204, 21, 0.28)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 12,
        textAlign: 'center',
        background: strong ? 'rgba(250, 204, 21, 0.08)' : 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value}</div>
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
  if (!isAdmin) return null

  const hasCoreData =
    Boolean(lapEditPlayer) ||
    Boolean(lapEditGame) ||
    Boolean(lapEditTrack) ||
    Boolean(lapEditCar) ||
    Boolean(lapEditTime)

  return (
    <SectionCard
      title="🛠️ Admin tiempos"
      card={card}
      sectionTitle={sectionTitle}
    >
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          marginBottom: 20,
        }}
      >
        <SummaryBox label="Modo" value={isEditingLapTime ? 'Edición' : 'Creación'} strong={isEditingLapTime} />
        <SummaryBox label="Piloto" value={lapEditPlayer || '-'} />
        <SummaryBox label="Juego" value={lapEditGame || '-'} />
        <SummaryBox label="Circuito / Etapa" value={lapEditTrack || '-'} />
      </div>

      <SectionContentSpacing>
        <div style={formGrid}>
          <AdminTextInput
            value={lapEditPlayer}
            onChange={(e) => setLapEditPlayer(normalizeText(e.target.value))}
            placeholder="PILOTO"
            style={input}
          />

          <AdminTextInput
            value={lapEditCountry}
            onChange={(e) => setLapEditCountry(normalizeText(e.target.value))}
            placeholder="PAÍS"
            style={input}
          />

          <AdminTextInput
            value={lapEditGame}
            onChange={(e) => setLapEditGame(normalizeText(e.target.value))}
            placeholder="JUEGO"
            style={input}
          />

          <AdminTextInput
            value={lapEditTrack}
            onChange={(e) => setLapEditTrack(normalizeText(e.target.value))}
            placeholder="CIRCUITO / ETAPA"
            style={input}
          />

          <AdminTextInput
            value={lapEditCar}
            onChange={(e) => setLapEditCar(normalizeText(e.target.value))}
            placeholder="AUTO"
            style={input}
          />

          <AdminTextInput
            value={lapEditTime}
            onChange={(e) => setLapEditTime(e.target.value)}
            placeholder="TIEMPO EJ: 1:28.500"
            style={input}
          />
        </div>
      </SectionContentSpacing>

      <div style={{ ...buttonRow, marginTop: 16 }}>
        <button onClick={createOrUpdateLapTime} style={button}>
          {isEditingLapTime ? 'Guardar cambios' : 'Crear tiempo'}
        </button>

        <button
          onClick={cancelEditLapTime}
          style={buttonSecondary}
        >
          {hasCoreData ? 'Limpiar formulario' : 'Cancelar'}
        </button>
      </div>

      <StatusMessage
        text={lapEditMessage || (isEditingLapTime ? 'Editando tiempo existente' : 'Panel listo para cargar nuevos tiempos')}
        messageStyle={messageStyle}
      />
    </SectionCard>
  )
}
