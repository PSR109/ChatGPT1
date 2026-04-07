const colors = {
  primary: '#0E2C40',
  accent: '#2981F3',
  accentAlt: '#5AA2FF',
  accentSoft: 'rgba(41, 129, 243, 0.14)',
  pageBg: '#061018',
  pageBgDeep: '#081521',
  pageGlow: 'rgba(41, 129, 243, 0.16)',
  cardBg: 'rgba(10, 23, 34, 0.96)',
  cardBgSoft: 'rgba(13, 31, 46, 0.94)',
  cardAlt: 'rgba(255,255,255,0.04)',
  textMain: '#F5FAFF',
  textMuted: '#AEC3D6',
  textSoft: '#87A0B4',
  border: 'rgba(140, 174, 201, 0.14)',
  borderStrong: 'rgba(41, 129, 243, 0.28)',
  shadow: '0 18px 44px rgba(0, 0, 0, 0.34)',
  shadowStrong: '0 16px 34px rgba(41, 129, 243, 0.22)',
}

export { colors }

export const page = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top, rgba(41, 129, 243, 0.16), transparent 28%), radial-gradient(circle at 85% 12%, rgba(14, 44, 64, 0.34), transparent 24%), linear-gradient(180deg, #061018 0%, #081521 100%)',
  color: colors.textMain,
  padding: 'clamp(14px, 3vw, 24px) clamp(10px, 3vw, 12px) 132px',
  fontFamily: 'Inter, Arial, sans-serif',
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
}

export const container = {
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
  minWidth: 0,
}

export const hero = {
  marginBottom: 22,
  textAlign: 'center',
  padding: '4px 0 2px',
}

export const title = {
  margin: 0,
  fontSize: 'clamp(30px, 5vw, 42px)',
  fontWeight: 900,
  letterSpacing: '-0.03em',
  lineHeight: 1.02,
  textAlign: 'center',
  color: colors.textMain,
}

export const subtitle = {
  margin: '10px auto 0',
  color: colors.textMuted,
  textAlign: 'center',
  maxWidth: 760,
  fontSize: 'clamp(14px, 2.3vw, 17px)',
  lineHeight: 1.45,
}

export const modeWrap = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginBottom: 0,
  justifyContent: 'center',
}

export const modeButton = {
  border: `1px solid ${colors.border}`,
  background: 'rgba(255,255,255,0.04)',
  color: colors.textMain,
  padding: '12px 16px',
  borderRadius: 999,
  cursor: 'pointer',
  fontWeight: 800,
  letterSpacing: '0.01em',
  backdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
}

export const modeButtonActive = {
  ...modeButton,
  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
  borderColor: 'rgba(255,255,255,0.14)',
  color: '#ffffff',
  boxShadow: colors.shadowStrong,
}

export const tabs = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 22,
  justifyContent: 'center',
}

export const tab = {
  border: `1px solid ${colors.border}`,
  background: 'rgba(255,255,255,0.04)',
  color: colors.textMain,
  padding: '11px 15px',
  borderRadius: 16,
  cursor: 'pointer',
  fontWeight: 700,
  backdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
}

export const tabActive = {
  ...tab,
  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
  borderColor: 'rgba(255,255,255,0.18)',
  color: '#ffffff',
  boxShadow: colors.shadowStrong,
}

export const card = {
  background: `linear-gradient(180deg, ${colors.cardBg} 0%, ${colors.cardBgSoft} 100%)`,
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 24,
  padding: 'clamp(14px, 3.4vw, 20px)',
  marginBottom: 18,
  boxShadow: colors.shadow,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
  backdropFilter: 'blur(12px)',
}

export const sectionTitle = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 'clamp(20px, 3.2vw, 24px)',
  lineHeight: 1.15,
  textAlign: 'center',
  fontWeight: 900,
  letterSpacing: '-0.02em',
  color: colors.textMain,
}

export const line = {
  margin: '8px 0',
  height: 1,
  border: 'none',
  background: 'linear-gradient(90deg, transparent, rgba(174,195,214,0.26), transparent)',
}

export const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
  gap: 12,
  marginBottom: 14,
}

export const input = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 16,
  border: `1px solid ${colors.border}`,
  background: 'rgba(255,255,255,0.05)',
  color: colors.textMain,
  boxSizing: 'border-box',
  outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
}

export const buttonRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 12,
}

export const buttonRowSmall = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}

export const button = {
  border: 'none',
  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentAlt})`,
  color: '#ffffff',
  padding: '12px 16px',
  borderRadius: 16,
  cursor: 'pointer',
  fontWeight: 800,
  boxShadow: colors.shadowStrong,
}

export const buttonSecondary = {
  border: `1px solid ${colors.border}`,
  background: 'rgba(255,255,255,0.04)',
  color: colors.textMain,
  padding: '11px 16px',
  borderRadius: 16,
  cursor: 'pointer',
  fontWeight: 700,
}

export const miniButton = {
  border: 'none',
  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentAlt})`,
  color: '#fff',
  padding: '7px 11px',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 800,
}

export const miniDanger = {
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
  color: '#fff',
  padding: '7px 11px',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 800,
}

export const messageStyle = {
  marginTop: 12,
  color: colors.textMuted,
  fontWeight: 700,
  textAlign: 'center',
}

export const checkboxRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  margin: '10px 0',
}

export const tableWrap = {
  width: '100%',
  overflowX: 'auto',
  borderRadius: 18,
  border: `1px solid ${colors.border}`,
  background: 'rgba(255,255,255,0.03)',
}

export const table = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 640,
}

export const th = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid rgba(174,195,214,0.10)',
  color: colors.textSoft,
  fontSize: 12,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  background: 'rgba(255,255,255,0.03)',
}

export const td = {
  padding: '12px 10px',
  borderBottom: '1px solid rgba(174,195,214,0.08)',
  fontSize: 14,
  color: colors.textMain,
}
