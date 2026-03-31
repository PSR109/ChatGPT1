/**
 * LEGACY / NO ACTIVO EN EL FLUJO PRINCIPAL
 * La vista de puntos actual se resuelve desde PointsSection.jsx.
 * Este archivo queda como remanente heredado y no es el entry principal actual.
 */
import { buildCenteredTableStyles } from '../utils/tableStyles'
export default function PointsTableSection({ pointsLeaderboard, tableWrap, table, th, td }) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)
  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={thCenter}>#</th>
            <th style={thCenter}>Piloto</th>
            <th style={thCenter}>Puntos</th>
            <th style={thCenter}>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {pointsLeaderboard.map((row) => (
            <tr key={row.player}>
              <td style={tdCenter}>{row.position}</td>
              <td style={tdCenter}>{row.player}</td>
              <td style={tdCenter}>{row.points}</td>
              <td style={tdCenter}>{row.details.join(' | ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
