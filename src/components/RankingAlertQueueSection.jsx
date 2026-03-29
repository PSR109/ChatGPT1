import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import StatusMessage from './StatusMessage'

function typeLabel(type) {
  if (type === 'weekly') return 'Semanal'
  if (type === 'monthly') return 'Mensual'
  return 'General'
}

function statusTone(status) {
  if (status === 'SENT') return 'rgba(34,197,94,0.18)'
  if (status === 'DISMISSED') return 'rgba(239,68,68,0.18)'
  return 'rgba(59,130,246,0.14)'
}

export default function RankingAlertQueueSection({
  isAdmin,
  rankingAlertEvents,
  rankingAlertMessage,
  onOpenWhatsapp,
  onMarkAsSent,
  onDismiss,
  card,
  sectionTitle,
  miniButton,
  miniDanger,
  buttonSecondary,
  messageStyle,
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const pendingEvents = useMemo(() => (rankingAlertEvents || []).filter((item) => item.status === 'PENDING'), [rankingAlertEvents])
  const recentResolved = useMemo(() => (rankingAlertEvents || []).filter((item) => item.status !== 'PENDING').slice(0, 6), [rankingAlertEvents])

  if (!isAdmin) return null

  return (
    <SectionCard title='📲 Cola de alertas ranking' card={card} sectionTitle={sectionTitle}>
      <div
        style={{
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 18,
          padding: isMobile ? 14 : 18,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(14,44,64,0.24))',
          marginBottom: 18,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: isMobile ? 19 : 22, fontWeight: 900 }}>Alertas listas para revancha</div>
        <div style={{ marginTop: 8, opacity: 0.82, lineHeight: 1.45 }}>
          Revisa a quién superaron, abre el mensaje listo en WhatsApp y marca el estado para no duplicar envíos.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          marginBottom: 18,
        }}
      >
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pendientes</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{pendingEvents.length}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Últimas cerradas</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{recentResolved.length}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cobertura</div>
          <div style={{ fontSize: 17, fontWeight: 900, marginTop: 9 }}>General · Semanal · Mensual</div>
        </div>
      </div>

      {pendingEvents.length === 0 ? (
        <div style={{ border: '1px dashed rgba(255,255,255,0.18)', borderRadius: 16, padding: 18, textAlign: 'center', opacity: 0.84 }}>
          No hay alertas pendientes por ahora.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pendingEvents.map((eventItem) => (
            <div
              key={eventItem.id}
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                padding: isMobile ? 14 : 16,
                background: statusTone(eventItem.status),
                boxShadow: '0 14px 28px rgba(5,10,25,0.18)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.76, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{typeLabel(eventItem.ranking_type)}</div>
                  <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, marginTop: 4 }}>{eventItem.context_label}</div>
                </div>
                <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>PENDIENTE</div>
              </div>

              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', marginTop: 14 }}>
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Piloto avisado</div>
                  <div style={{ marginTop: 6, fontWeight: 900 }}>{eventItem.displaced_player}</div>
                  <div style={{ marginTop: 6, opacity: 0.82 }}>Tiempo anterior: {eventItem.previous_time}</div>
                </div>
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nuevo líder</div>
                  <div style={{ marginTop: 6, fontWeight: 900 }}>{eventItem.challenger_player}</div>
                  <div style={{ marginTop: 6, opacity: 0.82 }}>Nuevo tiempo: {eventItem.new_time}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.035)', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                {eventItem.message_preview}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <button onClick={() => onOpenWhatsapp(eventItem)} style={miniButton}>Abrir WhatsApp</button>
                <button onClick={() => onMarkAsSent(eventItem.id)} style={buttonSecondary}>Marcar enviada</button>
                <button onClick={() => onDismiss(eventItem.id)} style={miniDanger}>Descartar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recentResolved.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Últimas alertas cerradas</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {recentResolved.map((eventItem) => (
              <div key={eventItem.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800 }}>{typeLabel(eventItem.ranking_type)} · {eventItem.context_label}</div>
                  <div style={{ opacity: 0.78 }}>{eventItem.status === 'SENT' ? 'Enviada' : 'Descartada'}</div>
                </div>
                <div style={{ marginTop: 6, opacity: 0.82 }}>Aviso para {eventItem.displaced_player} por tiempo de {eventItem.challenger_player}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <StatusMessage text={rankingAlertMessage || 'Panel listo para revisar alertas de ranking'} messageStyle={messageStyle} />
    </SectionCard>
  )
}
