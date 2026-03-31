export default function ActionButtonsRow({
  onEdit,
  onDelete,
  buttonRowSmall,
  miniButton,
  miniDanger,
  disabled = false,
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
        disabled={disabled}
        style={{
          ...miniButton,
          minWidth: 92,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Editar
      </button>

      <button
        onClick={onDelete}
        disabled={disabled}
        style={{
          ...miniDanger,
          minWidth: 92,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Eliminar
      </button>
    </div>
  )
}
