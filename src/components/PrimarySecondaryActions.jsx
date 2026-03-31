export default function PrimarySecondaryActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  showSecondary,
  disabled = false,
  buttonRow,
  button,
  buttonSecondary,
}) {
  return (
    <div
      style={{
        ...buttonRow,
        justifyContent: 'center',
        gap: 10,
        marginTop: 16,
      }}
    >
      <button
        onClick={onPrimary}
        disabled={disabled}
        style={{
          ...button,
          minWidth: 170,
          opacity: disabled ? 0.65 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {primaryLabel}
      </button>

      {showSecondary ? (
        <button
          onClick={onSecondary}
          disabled={disabled}
          style={{
            ...buttonSecondary,
            minWidth: 170,
            opacity: disabled ? 0.65 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  )
}
