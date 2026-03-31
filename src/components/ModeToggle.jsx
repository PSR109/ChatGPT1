/**
 * LEGACY / NO ACTIVO EN EL FLUJO PRINCIPAL
 * El modo cliente/admin actual se controla desde src/App.jsx y la navegación vigente.
 * Este componente queda como remanente heredado y no debe tomarse como fuente actual.
 */
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
        Clientes
      </button>
      <button
        onClick={() => setAppMode('ADMIN')}
        style={appMode === 'ADMIN' ? modeButtonActive : modeButton}
      >
        Gestión
      </button>
    </div>
  )
}
