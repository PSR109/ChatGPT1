const configWrapperStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: '#070707',
  color: '#ffffff',
}

const configCardStyle = {
  width: '100%',
  maxWidth: '560px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '16px',
  padding: '20px',
  background: 'rgba(255,255,255,0.04)',
  boxSizing: 'border-box',
}

export default function MissingConfigScreen({ message = '' }) {
  return (
    <div style={configWrapperStyle}>
      <div style={configCardStyle}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Falta configuración para conectar Supabase.</h1>
        <p style={{ margin: '10px 0 0', lineHeight: 1.5, color: 'rgba(255,255,255,0.82)' }}>
          {message}
        </p>
      </div>
    </div>
  )
}
