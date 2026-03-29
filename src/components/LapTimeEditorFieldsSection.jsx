import AdminTextInput from './AdminTextInput'
import { normalizeTextInput } from '../utils/psrUtils'

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
        onChange={(e) => setLapEditPlayer(normalizeTextInput(e.target.value))}
        placeholder="PILOTO"
        style={input}
      />
      <AdminTextInput
        value={lapEditCountry}
        onChange={(e) => setLapEditCountry(normalizeTextInput(e.target.value))}
        placeholder="PAÍS"
        style={input}
      />
      <AdminTextInput
        value={lapEditGame}
        onChange={(e) => setLapEditGame(normalizeTextInput(e.target.value))}
        placeholder="JUEGO"
        style={input}
      />
      <AdminTextInput
        value={lapEditTrack}
        onChange={(e) => setLapEditTrack(normalizeTextInput(e.target.value))}
        placeholder="CIRCUITO / ETAPA"
        style={input}
      />
      <AdminTextInput
        value={lapEditCar}
        onChange={(e) => setLapEditCar(normalizeTextInput(e.target.value))}
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
