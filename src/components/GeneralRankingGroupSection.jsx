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
