import React from 'react'

const wrapperStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: '#070707',
  color: '#ffffff',
}

const cardStyle = {
  width: '100%',
  maxWidth: '520px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '16px',
  padding: '20px',
  background: 'rgba(255,255,255,0.04)',
  boxSizing: 'border-box',
}

const titleStyle = {
  margin: 0,
  fontSize: '22px',
  fontWeight: 700,
}

const textStyle = {
  margin: '10px 0 0',
  lineHeight: 1.5,
  color: 'rgba(255,255,255,0.82)',
}

const buttonStyle = {
  marginTop: '16px',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#111111',
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={wrapperStyle}>
          <div style={cardStyle}>
            <h1 style={titleStyle}>La app encontró un error inesperado.</h1>
            <p style={textStyle}>Recarga la página. Si vuelve a pasar, revisa la consola y el último cambio aplicado.</p>
            <button type="button" style={buttonStyle} onClick={this.handleReload}>
              Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
