export default function PrimarySecondaryActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  showSecondary,
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
        style={{
          ...button,
          minWidth: 170,
        }}
      >
        {primaryLabel}
      </button>

      {showSecondary ? (
        <button
          onClick={onSecondary}
          style={{
            ...buttonSecondary,
            minWidth: 170,
          }}
        >
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  )
}
