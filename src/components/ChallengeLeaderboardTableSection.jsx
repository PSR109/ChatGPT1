import { buildCenteredTableStyles } from '../utils/tableStyles'
import ActionButtonsRow from './ActionButtonsRow'
import CenteredMessage from './CenteredMessage'

export default function ChallengeLeaderboardTableSection({
  leaderboard,
  isAdmin,
  onEditEntry,
  onDeleteEntry,
  line,
  tableWrap,
  table,
  th,
  td,
  buttonRowSmall,
  miniButton,
  miniDanger,
}) {
  const { thCenter, tdCenter } = buildCenteredTableStyles(th, td)

  if (leaderboard.length === 0) {
    return (
      <CenteredMessage
        text="Aún no hay tiempos registrados"
        line={line}
      />
    )
  }

  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={thCenter}>#</th>
            <th style={thCenter}>Piloto</th>
            <th style={thCenter}>Tiempo</th>
            <th style={thCenter}>Gap</th>
            {isAdmin ? <th style={thCenter}>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row) => (
            <tr key={row.id}>
              <td style={tdCenter}>{row.position}</td>
              <td style={tdCenter}>{row.player}</td>
              <td style={tdCenter}>{row.time}</td>
              <td style={tdCenter}>{row.gap}</td>
              {isAdmin ? (
                <td style={tdCenter}>
                  <ActionButtonsRow
                    onEdit={() => onEditEntry(row)}
                    onDelete={() => onDeleteEntry(row.id)}
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
