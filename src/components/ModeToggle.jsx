export default function ModeToggle({
  appMode,
  setAppMode,
  modeWrap,
  modeButton,
  modeButtonActive,
}) {
  return (
    <div style={modeWrap}>
      <button
        onClick={() => setAppMode('USER')}
        style={appMode === 'USER' ? modeButtonActive : modeButton}
      >
        Modo Usuario
      </button>
      <button
        onClick={() => setAppMode('ADMIN')}
        style={appMode === 'ADMIN' ? modeButtonActive : modeButton}
      >
        Modo Admin
      </button>
    </div>
  )
}
