export default function SectionCard({ title, children, card, sectionTitle }) {
  return (
    <section
      style={{
        ...card,
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          ...sectionTitle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 18,
        }}
      >
        {title}
      </div>

      {children}
    </section>
  )
}
