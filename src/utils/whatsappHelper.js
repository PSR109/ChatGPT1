const PSR_PHONE = '+56984630196'

export function buildWhatsAppLink(type) {
  const text = buildWhatsAppCopyText(type)
  return buildBookingWhatsappLink(text)
}

export function buildWhatsAppCopyText(type) {
  const copyMap = {
    aprender:
      'Hola, quiero cotizar una sesión en Patagonia SimRacing para aprender o practicar. ¿Qué horarios recomiendan y qué configuración me conviene?',
    empresa:
      'Hola, quiero cotizar una actividad de team building para empresa en Patagonia SimRacing. ¿Qué formato recomiendan y qué disponibilidad tienen?',
    evento:
      'Hola, quiero cotizar un evento o cumpleaños en Patagonia SimRacing. ¿Qué opciones tienen para grupos y qué horarios sugieren?',
    activacion:
      'Hola, quiero cotizar una activación de marca con Patagonia SimRacing. ¿Qué formatos y alcance manejan?',
  }

  return copyMap[type] || copyMap.aprender
}

export function buildCommercialBookingPrefill(type) {
  const prefillMap = {
    aprender: {
      bookingKind: 'LOCAL',
      bookingConfig: '1_ESTANDAR',
      bookingDuration: 30,
      sourceLabel: 'Práctica',
    },
    empresa: {
      bookingKind: 'EMPRESA',
      bookingConfig: '3_SIMULADORES',
      bookingDuration: 120,
      sourceLabel: 'Empresa',
    },
    evento: {
      bookingKind: 'EVENTO',
      bookingConfig: '3_SIMULADORES',
      bookingDuration: 120,
      sourceLabel: 'Evento',
    },
    activacion: {
      bookingKind: 'EVENTO',
      bookingConfig: '3_SIMULADORES',
      bookingDuration: 120,
      sourceLabel: 'Activación',
    },
  }

  return prefillMap[type] || prefillMap.aprender
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

export function buildBookingWhatsappLink(text) {
  const cleanPhone = String(PSR_PHONE).replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text || '')}`
}

export function buildDirectWhatsappLink(phone, text) {
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text || '')}`
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
