import { buildCenteredTableStyles } from '../utils/tableStyles'
import ActionButtonsRow from './ActionButtonsRow'

export default function GeneralRankingTableSection({
  section,
  isAdmin,
  startEditLapTime,
  deleteLapTime,
  tableWrap,
  table,
  th,
  td,
  buttonRowSmall,
  miniButton,
  miniDanger,
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={thCenter}>#</th>
            <th style={thCenter}>Piloto</th>
            <th style={thCenter}>País</th>
            <th style={thCenter}>Circuito / Etapa</th>
            <th style={thCenter}>Auto</th>
            <th style={thCenter}>Tiempo</th>
            <th style={thCenter}>Gap</th>
            {isAdmin ? <th style={thCenter}>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {section.entries.map((row) => (
            <tr key={row.id}>
              <td style={tdCenter}>{row.position}</td>
              <td style={tdCenter}>{row.player}</td>
              <td style={tdCenter}>{row.country}</td>
              <td style={tdCenter}>{row.track}</td>
              <td style={tdCenter}>{row.car}</td>
              <td style={tdCenter}>{row.time}</td>
              <td style={tdCenter}>{row.gap}</td>
              {isAdmin ? (
                <td style={tdCenter}>
                  <ActionButtonsRow
                    onEdit={() => startEditLapTime(row)}
                    onDelete={() => deleteLapTime(row.id)}
                    buttonRowSmall={buttonRowSmall}
                    miniButton={miniButton}
                    miniDanger={miniDanger}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
