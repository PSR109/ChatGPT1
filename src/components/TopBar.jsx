import React from 'react'
import {
  hero,
  modeButton,
  modeButtonActive,
  modeWrap,
  subtitle,
  tabs,
  title,
  MemoButton,
} from '../lib/psr.js'

const TAB_LIST = [
  ['GENERAL', 'Ranking General'],
  ['WEEKLY', 'Ranking Semanal'],
  ['MONTHLY', 'Ranking Mensual'],
  ['POINTS', 'Puntos'],
  ['BOOKINGS', 'Reservas'],
]

function TopBar({ appMode, setAppMode, viewMode, setViewMode }) {
  return (
    <>
      <header style={hero}>
        <h1 style={title}>PATAGONIA SIMRACING</h1>
        <p style={subtitle}>Liga oficial, desafíos, puntos y reservas</p>
      </header>

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

      <div style={tabs}>
        {TAB_LIST.map(([key, label]) => (
          <MemoButton
            key={key}
            active={viewMode === key}
            onClick={() => setViewMode(key)}
          >
            {label}
          </MemoButton>
        ))}
      </div>
    </>
  )
}

export default React.memo(TopBar)