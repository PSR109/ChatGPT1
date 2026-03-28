import React from 'react'
import { button, buttonRow, buttonSecondary, card, formGrid, input, messageStyle, sectionTitle } from '../lib/psr.js'

function AdminLapEditor({
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
  saveLapTimeEdit,
  cancelEditLapTime,
  normalizeText,
}) {
  if (!isAdmin || !lapEditId) return null

  return (
    <div style={card}>
      <h2 style={sectionTitle}>✏️ Editar tiempo general</h2>

      <div style={formGrid}>
        <input value={lapEditPlayer} onChange={(e) => setLapEditPlayer(normalizeText(e.target.value))} placeholder="PILOTO" style={input} />
        <input value={lapEditCountry} onChange={(e) => setLapEditCountry(normalizeText(e.target.value))} placeholder="PAÍS" style={input} />
        <input value={lapEditGame} onChange={(e) => setLapEditGame(normalizeText(e.target.value))} placeholder="JUEGO" style={input} />
        <input value={lapEditTrack} onChange={(e) => setLapEditTrack(normalizeText(e.target.value))} placeholder="CIRCUITO / ETAPA" style={input} />
        <input value={lapEditCar} onChange={(e) => setLapEditCar(normalizeText(e.target.value))} placeholder="AUTO" style={input} />
        <input value={lapEditTime} onChange={(e) => setLapEditTime(e.target.value)} placeholder="TIEMPO (1:28.500)" style={input} />
      </div>

      <div style={buttonRow}>
        <button onClick={saveLapTimeEdit} style={button}>Guardar</button>
        <button onClick={cancelEditLapTime} style={buttonSecondary}>Cancelar</button>
      </div>

      {lapEditMessage ? <p style={messageStyle}>{lapEditMessage}</p> : null}
    </div>
  )
}

export default React.memo(AdminLapEditor)