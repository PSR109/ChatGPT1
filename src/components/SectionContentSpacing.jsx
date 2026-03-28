export default function SectionContentSpacing({ children }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 18,
      }}
    >
      {children}
    </div>
  )
}
