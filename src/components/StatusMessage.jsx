export default function StatusMessage({ text, messageStyle }) {
  if (!text) return null

  const upper = String(text).toUpperCase()
  const isError = upper.includes('ERROR') || upper.includes('INVÁLIDO') || upper.includes('NO ')
  const isSuccess =
    upper.includes('CORRECTAMENTE') ||
    upper.includes('CREADO') ||
    upper.includes('ACTUALIZADO') ||
    upper.includes('REGISTRADO') ||
    upper.includes('ELIMINADO')

  const toneStyle = isError
    ? {
        border: '1px solid rgba(239,68,68,0.28)',
        background: 'rgba(239,68,68,0.10)',
      }
    : isSuccess
    ? {
        border: '1px solid rgba(34,197,94,0.28)',
        background: 'rgba(34,197,94,0.10)',
      }
    : {
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
      }

  return (
    <div
      style={{
        ...messageStyle,
        ...toneStyle,
        borderRadius: 12,
        padding: '12px 14px',
      }}
    >
      {text}
    </div>
  )
}
