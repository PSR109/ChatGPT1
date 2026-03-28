import AdminTextInput from './AdminTextInput'

export default function LapTimeEditorFieldsSection({
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
  normalizeText,
  formGrid,
  input,
}) {
  return (
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
        placeholder="TIEMPO (1:28.500)"
        style={input}
      />
    </div>
  )
}
