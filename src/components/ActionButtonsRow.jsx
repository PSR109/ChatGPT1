export default function ActionButtonsRow({
  onEdit,
  onDelete,
  buttonRowSmall,
  miniButton,
  miniDanger,
}) {
  return (
    <div
      style={{
        ...buttonRowSmall,
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <button
        onClick={onEdit}
        style={{
          ...miniButton,
          minWidth: 92,
        }}
      >
        Editar
      </button>

      <button
        onClick={onDelete}
        style={{
          ...miniDanger,
          minWidth: 92,
        }}
      >
        Eliminar
      </button>
    </div>
  )
}
