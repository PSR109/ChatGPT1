export default function SectionContentSpacing({ children }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'clamp(14px, 2.6vw, 20px)',
      }}
    >
      {children}
    </div>
  )
}
