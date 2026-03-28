import AdminTextInput from './AdminTextInput'
import AdminSelect from './AdminSelect'

export default function GeneralRankingFiltersSection({
  selectedGame,
  setSelectedGame,
  selectedTrack,
  setSelectedTrack,
  selectedPilot,
  setSelectedPilot,
  generalGames,
  generalTracks,
  formGrid,
  input,
}) {
  return (
    <div style={formGrid}>
      <AdminSelect value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} style={input}>
        {generalGames.map((game) => (
          <option key={game} value={game}>{game}</option>
        ))}
      </AdminSelect>

      <AdminSelect value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)} style={input}>
        {generalTracks.map((track) => (
          <option key={track} value={track}>{track}</option>
        ))}
      </AdminSelect>

      <AdminTextInput
        value={selectedPilot}
        onChange={(e) => setSelectedPilot(e.target.value)}
        placeholder="FILTRAR PILOTO"
        style={input}
      />
    </div>
  )
}
