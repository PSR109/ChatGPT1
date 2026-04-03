import { getCommercialBookingPrefill as getEngineCommercialBookingPrefill } from './bookingEngine.js'

const PSR_PHONE = '+56984630196'
const PSR_CONTACT_EMAIL = 'contacto@patagoniasimracing.cl'

export const PSR_WHATSAPP_NUMBER = String(PSR_PHONE).replace(/\D/g, '')
export const PSR_EMAIL = PSR_CONTACT_EMAIL

function buildMessage(lines = []) {
  return lines
    .map((line) => String(line ?? '').trim())
    .filter(Boolean)
    .join('\n')
}

export function buildWhatsAppLink(type, options = {}) {
  const text = buildWhatsAppCopyText(type, options)
  return buildBookingWhatsappLink(text)
}

export function buildCommercialWhatsappLink(type, options = {}) {
  return buildWhatsAppLink(type, options)
}

export function buildWhatsAppCopyText(type, options = {}) {
  const { name = '', details = '' } = options

  const safeName = String(name || '').trim()
  const safeDetails = String(details || '').trim()
  const opener = safeName
    ? `Hola, soy ${safeName} y quiero información de Patagonia SimRacing.`
    : 'Hola, quiero información de Patagonia SimRacing.'

  const copyMap = {
    aprender: buildMessage([
      opener,
      '',
      'Quiero reservar una sesión para venir a correr, aprender o practicar.',
      '¿Qué horario cercano me recomiendan y qué configuración me conviene para partir?',
      safeDetails,
    ]),
    pareja: buildMessage([
      opener,
      '',
      'Quiero cotizar una experiencia para pareja en Patagonia SimRacing.',
      'Busco un panorama entretenido y fácil de disfrutar aunque no tengamos experiencia.',
      '¿Qué opción recomiendan y qué horarios tienen?',
      safeDetails,
    ]),
    familia: buildMessage([
      opener,
      '',
      'Quiero cotizar una experiencia familiar en Patagonia SimRacing.',
      'La idea es ir en un formato fácil de disfrutar para distintos niveles.',
      '¿Qué opción recomiendan y qué horarios tienen disponibles?',
      safeDetails,
    ]),
    grupo: buildMessage([
      opener,
      '',
      'Quiero cotizar una experiencia para grupo en Patagonia SimRacing.',
      'Busco algo entretenido, competitivo y simple de organizar.',
      '¿Qué formato recomiendan para grupos y qué horarios tienen?',
      safeDetails,
    ]),
    empresa: buildMessage([
      opener,
      '',
      'Quiero cotizar una actividad para empresa o team building en Patagonia SimRacing.',
      'Busco una opción distinta, competitiva y fácil de coordinar para el equipo.',
      '¿Qué formato recomiendan, para cuántas personas funciona mejor y qué disponibilidad tienen?',
      safeDetails,
    ]),
    evento: buildMessage([
      opener,
      '',
      'Quiero cotizar un evento o cumpleaños en Patagonia SimRacing.',
      'Busco una experiencia especial para grupo y quiero ver formatos, duración y horarios recomendados.',
      safeDetails,
    ]),
    activacion: buildMessage([
      opener,
      '',
      'Quiero cotizar una activación de marca con Patagonia SimRacing.',
      'Busco una propuesta comercial distinta y quiero revisar formatos posibles.',
      safeDetails,
    ]),
    general: buildMessage([
      opener,
      '',
      'Quiero reservar o cotizar una experiencia en Patagonia SimRacing.',
      '¿Qué horarios y opciones recomiendan hoy?',
      safeDetails,
    ]),
    cotizacion_general: buildMessage([
      opener,
      '',
      'Quiero cotizar una experiencia en Patagonia SimRacing.',
      '¿Qué formatos, horarios y valores recomiendan según el tipo de visita?',
      safeDetails,
    ]),
  }

  return copyMap[type] || copyMap.general
}

export function buildCommercialBookingPrefill(type) {
  return getEngineCommercialBookingPrefill(type)
}

export function buildBookingWhatsappMessage({
  client,
  phone,
  date,
  time,
  kind,
  configLabel,
  duration,
  total,
  whatsappReminder,
}) {
  const kindLabelMap = {
    LOCAL: 'Aprender / practicar',
    EMPRESA: 'Empresas / team building',
    EVENTO: 'Eventos / cumpleaños',
  }

  const rows = [
    'Hola, quiero confirmar esta reserva en Patagonia SimRacing:',
    '',
    `Tipo: ${kindLabelMap[kind] || kind || '-'}`,
    `Cliente: ${client || '-'}`,
    `Teléfono: ${phone || '-'}`,
    `Fecha: ${date || '-'}`,
    `Hora: ${time || '-'}`,
    `Configuración: ${configLabel || '-'}`,
    `Duración: ${duration || '-'} min`,
    `Total estimado: $${Number(total || 0).toLocaleString('es-CL')}`,
    `Recordatorio WhatsApp: ${whatsappReminder ? 'Sí' : 'No'}`,
  ]

  return rows.join('\n')
}

export function buildBookingFollowupWhatsappMessage({
  client,
  phone,
  date,
  time,
  kind,
  configLabel,
  duration,
  total,
}) {
  const kindLabelMap = {
    LOCAL: 'Reserva',
    EMPRESA: 'Actividad empresa',
    EVENTO: 'Evento',
  }

  return [
    'Hola, acabo de enviar una solicitud desde la app de Patagonia SimRacing.',
    '',
    'Les comparto el resumen para confirmar más rápido:',
    '',
    `Tipo: ${kindLabelMap[kind] || kind || '-'}`,
    `Nombre: ${client || '-'}`,
    `Teléfono: ${phone || '-'}`,
    `Fecha: ${date || '-'}`,
    `Hora: ${time || '-'}`,
    `Configuración: ${configLabel || '-'}`,
    `Duración: ${duration || '-'} min`,
    `Total estimado: $${Number(total || 0).toLocaleString('es-CL')}`,
    '',
    '¿Sigue disponible este horario?',
    'Si no, ¿qué alternativa cercana me recomiendan?',
  ].join('\n')
}

export function buildBookingWhatsappLink(text) {
  return `https://wa.me/${PSR_WHATSAPP_NUMBER}?text=${encodeURIComponent(text || '')}`
}

export function buildBookingFollowupWhatsappLink(bookingSummary) {
  return buildBookingWhatsappLink(buildBookingFollowupWhatsappMessage(bookingSummary || {}))
}

export function buildDirectWhatsappLink(phone, text) {
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text || '')}`
}


export function buildBusinessEmailSubject({ kind } = {}) {
  if (kind === 'EMPRESA') return 'Cotización empresa - Patagonia SimRacing'
  if (kind === 'EVENTO') return 'Cotización evento - Patagonia SimRacing'
  return 'Consulta comercial - Patagonia SimRacing'
}

export function buildBusinessEmailBody({
  client,
  phone,
  date,
  time,
  kind,
  configLabel,
  duration,
} = {}) {
  const kindLabelMap = {
    EMPRESA: 'Empresa',
    EVENTO: 'Evento',
  }

  return [
    'Hola,',
    '',
    'Quiero cotizar una experiencia en Patagonia SimRacing y les comparto lo que necesito:',
    '',
    `Tipo: ${kindLabelMap[kind] || kind || '-'}`,
    `Nombre: ${client || '-'}`,
    `WhatsApp: ${phone || '-'}`,
    `Fecha estimada: ${date || '-'}`,
    `Hora estimada: ${time || '-'}`,
    `Configuración de simuladores: ${configLabel || '-'}`,
    `Duración estimada: ${duration || '-'} min`,
    '',
    'Detalles o requerimientos:',
    '-',
    '',
    'Quedo atento/a.',
  ].join('\n')
}

export function buildBusinessEmailLink(options = {}) {
  const subject = encodeURIComponent(buildBusinessEmailSubject(options))
  const body = encodeURIComponent(buildBusinessEmailBody(options))
  return `mailto:${PSR_EMAIL}?subject=${subject}&body=${body}`
}

function getRankingTypeCopy(rankingType) {
  if (rankingType === 'weekly' || rankingType === 'WEEKLY') {
    return {
      headline: 'Te quitaron el liderato semanal en PSR.',
      contextLabel: 'Desafío semanal',
      urgency: 'El semanal se mueve rápido y cada intento cuenta.',
      closing: '¿Quieres tu revancha esta semana?',
    }
  }

  if (rankingType === 'monthly' || rankingType === 'MONTHLY') {
    return {
      headline: 'Perdiste el liderato mensual en PSR.',
      contextLabel: 'Desafío mensual',
      urgency: 'Aún estás a tiempo de recuperar tu lugar en el ranking del mes.',
      closing: '¿Quieres volver por el puesto alto este mes?',
    }
  }

  return {
    headline: 'Te mejoraron el tiempo en el ranking general de PSR.',
    contextLabel: 'Ranking general',
    urgency: 'Es una buena oportunidad para volver y bajar tu marca.',
    closing: '¿Quieres tu revancha hoy?',
  }
}

export function buildRankingAlertWhatsappMessage({
  rankingType,
  targetPlayer,
  displacedPlayer,
  challengerPlayer,
  game,
  track,
  contextLabel,
  oldTime,
  previousTime,
  newTime,
}) {
  const copy = getRankingTypeCopy(rankingType)
  const safePlayer = targetPlayer || displacedPlayer || 'piloto'
  const safeContext = contextLabel || [game, track].filter(Boolean).join(' · ') || copy.contextLabel || 'PSR'
  const safePrevious = oldTime || previousTime || '--'
  const safeNew = newTime || '--'
  const safeChallenger = challengerPlayer || 'otro piloto'

  return [
    `Hola ${safePlayer}. ${copy.headline}`,
    '',
    `${copy.contextLabel}: ${safeContext}`,
    `Tu tiempo: ${safePrevious}`,
    `Nuevo líder: ${safeChallenger}`,
    `Nuevo tiempo líder: ${safeNew}`,
    '',
    copy.urgency,
    `${copy.closing} Te puedo dejar una reserva lista de 30 o 60 min en Patagonia SimRacing.`,
    'Si quieres, respóndeme con REVANCHA y te envío horarios disponibles.',
  ].join('\n')
}
