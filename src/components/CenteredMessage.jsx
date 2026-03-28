export default function CenteredMessage({ text, line }) {
  if (!text) return null

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '18px 14px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        marginBottom: 18,
      }}
    >
      <div style={{ fontSize: 15, opacity: 0.9 }}>{text}</div>
      <div style={{ ...line, marginTop: 14 }} />
    </div>
  )
}
