/*
 * NO USAR COMO CAPA PRINCIPAL.
 * Este archivo queda solo como referencia heredada mientras no se haga
 * una limpieza controlada del ranking completo.
 */
/*
 * PSR RANKING MAP
 * HEREDADO / NO ACTIVO: este archivo solo depende de otras capas heredadas
 * y no está conectado al flujo principal actual. No tocar a ciegas.
 */
import GeneralRankingTableSection from './GeneralRankingTableSection'
import SectionContentSpacing from './SectionContentSpacing'

export default function GeneralRankingGroupSection({
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
  return (
    <SectionContentSpacing>
      <h3 style={{ margin: '0 0 12px', textAlign: 'center', fontSize: 18 }}>
        {section.game} — {section.track}
      </h3>

      <GeneralRankingTableSection
        section={section}
        isAdmin={isAdmin}
        startEditLapTime={startEditLapTime}
        deleteLapTime={deleteLapTime}
        tableWrap={tableWrap}
        table={table}
        th={th}
        td={td}
        buttonRowSmall={buttonRowSmall}
        miniButton={miniButton}
        miniDanger={miniDanger}
      />
    </SectionContentSpacing>
  )
}
