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
