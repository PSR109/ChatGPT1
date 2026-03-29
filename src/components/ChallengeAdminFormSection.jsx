import AdminTextInput from './AdminTextInput'
import PrimarySecondaryActions from './PrimarySecondaryActions'
import { normalizeTextInput } from '../utils/psrUtils'

export default function ChallengeAdminFormSection({
  label,
  editingEntryId,
  playerValue,
  setPlayerValue,
  timeValue,
  setTimeValue,
  onSubmit,
  onCancelEdit,
  normalizeText,
  formGrid,
  input,
  buttonRow,
  button,
  buttonSecondary,
}) {
  return (
    <>
      <div style={{ ...formGrid, marginTop: 14 }}>
        <AdminTextInput
          value={playerValue}
          onChange={(e) => setPlayerValue(normalizeTextInput(e.target.value))}
          placeholder="PILOTO"
          style={input}
        />
        <AdminTextInput
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          placeholder="TIEMPO (1:28.500)"
          style={input}
        />
      </div>

      <PrimarySecondaryActions
        primaryLabel={editingEntryId ? `Guardar ${label.toLowerCase()}` : `Agregar ${label.toLowerCase()}`}
        onPrimary={onSubmit}
        secondaryLabel="Cancelar"
        onSecondary={onCancelEdit}
        showSecondary={Boolean(editingEntryId)}
        buttonRow={buttonRow}
        button={button}
        buttonSecondary={buttonSecondary}
      />
    </>
  )
}
