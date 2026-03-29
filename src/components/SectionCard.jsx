import { colors } from '../styles/appStyles'

export default function SectionCard({ title, children, card, sectionTitle }) {
  return (
    <section
      style={{
        ...card,
        position: 'relative',
      }}
    >
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 3,
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
        }}
      />

      <div
        style={{
          display: 'grid',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '7px 12px',
            margin: '0 auto',
            borderRadius: 999,
            background: colors.accentSoft,
            border: '1px solid rgba(41,129,243,0.18)',
            color: '#dbeaff',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Sección PSR
        </div>

        <div
          style={{
            ...sectionTitle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 0,
          }}
        >
          {title}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>{children}</div>
    </section>
  )
}
