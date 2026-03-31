/**
 * LEGACY / HEREDADO
 * No usar este archivo como capa principal sin validar primero App.jsx.
 */
/*
 * PSR RANKING MAP
 * HEREDADO / NO ACTIVO: este archivo no está importado por src/App.jsx
 * ni por el flujo principal actual. No tocar a ciegas.
 */
import React, { useMemo } from 'react'
import {
  buttonRowSmall,
  card,
  formGrid,
  input,
  line,
  miniButton,
  miniDanger,
  sectionTitle,
  table,
  tableWrap,
  td,
  th,
} from '../lib/psr.js'

function RankingGeneral({
  isAdmin,
  generalGame,
  setGeneralGame,
  generalTrack,
  setGeneralTrack,
  generalSearch,
  setGeneralSearch,
  generalGames,
  generalTracks,
  groupedGeneralSections,
  startEditLapTime,
  deleteLapTime,
}) {
  const headerRow = useMemo(() => (
    <tr>
      <th style={th}>#</th>
      <th style={th}>Piloto</th>
      <th style={th}>País</th>
      <th style={th}>Auto</th>
      <th style={th}>Tiempo</th>
      <th style={th}>Gap</th>
      <th style={th}>Pts</th>
      {isAdmin && <th style={th}>Acciones</th>}
    </tr>
  ), [isAdmin])

  return (
    <>
      <div style={card}>
        <h2 style={sectionTitle}>🏁 Ranking General</h2>

        <div style={formGrid}>
          <select value={generalGame} onChange={(e) => setGeneralGame(e.target.value)} style={input}>
            {generalGames.map((game) => (
              <option key={game} value={game}>{game}</option>
            ))}
          </select>

          <select value={generalTrack} onChange={(e) => setGeneralTrack(e.target.value)} style={input}>
            {generalTracks.map((track) => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>

          <input
            value={generalSearch}
            onChange={(e) => setGeneralSearch(e.target.value)}
            placeholder="Buscar piloto"
            style={input}
          />
        </div>
      </div>

      {groupedGeneralSections.length === 0 ? (
        <div style={card}>
          <p style={line}>No hay registros para mostrar</p>
        </div>
      ) : (
        groupedGeneralSections.map((section) => (
          <div key={`${section.game}-${section.track}`} style={card}>
            <h3 style={sectionTitle}>{section.game} | {section.track}</h3>

            <div style={tableWrap}>
              <table style={table}>
                <thead>{headerRow}</thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.id}>
                      <td style={td}>{row.position}</td>
                      <td style={td}>{row.player}</td>
                      <td style={td}>{row.country}</td>
                      <td style={td}>{row.car}</td>
                      <td style={td}>{row.time}</td>
                      <td style={td}>{row.gap}</td>
                      <td style={td}>{row.points}</td>
                      {isAdmin && (
                        <td style={td}>
                          <div style={buttonRowSmall}>
                            <button onClick={() => startEditLapTime(row)} style={miniButton}>Editar</button>
                            <button onClick={() => deleteLapTime(row.id)} style={miniDanger}>Eliminar</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </>
  )
}

export default React.memo(RankingGeneral)