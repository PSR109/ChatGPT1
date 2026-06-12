import { buildContextWhatsappLink } from '../utils/whatsappHelper'

/**
 * FAB WhatsApp global: 1-tap a conversión desde cualquier pestaña. Sticky sobre la
 * tab-nav inferior. Mensaje pre-cargado por contexto (Chile = WhatsApp-first).
 */
export default function PsrWhatsappFab({ context = 'general' }) {
  const href = buildContextWhatsappLink(context)
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Reservar por WhatsApp"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 92,
        zIndex: 60,
        minHeight: 56,
        padding: '0 18px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: '#fff',
        fontWeight: 900,
        fontSize: 15,
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 .9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.6 0 1Z"/>
      </svg>
      Reservar
    </a>
  )
}
