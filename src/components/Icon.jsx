/**
 * Icon — set de iconos SVG line-art coherente (reemplaza los emoji 📅🏁🔵🚀).
 * Stroke = currentColor, así heredan el color del contexto (cyan de marca).
 * Tamaño por prop `size`. viewBox 24. Trazo 1.7. WhatsApp = glifo relleno.
 */
const PATHS = {
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 9.4V3M9.7 13.6 4.5 17M14.3 13.6 19.5 17" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="12.5" rx="1.8" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </>
  ),
  vr: (
    <>
      <rect x="2.5" y="7.5" width="19" height="9" rx="3" />
      <path d="M9.5 16.5c.6-1.7 3.9-1.7 4.9 0" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="M12 16 15.5 9.5" />
      <circle cx="12" cy="16" r="1.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.2v3.6M16 3.2v3.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5c.5-3 2.8-4.6 5.5-4.6s5 1.6 5.5 4.6" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M16.8 15.2c2.1.5 3.4 2 3.7 4.3" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2M5 20.5h14" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  trophy: (
    <>
      <path d="M7 4.5h10v3a5 5 0 0 1-10 0v-3Z" />
      <path d="M7 6H4.5v1.5A3 3 0 0 0 7 10.4M17 6h2.5v1.5A3 3 0 0 1 17 10.4M9.5 13.5h5M9 19.5h6M12 13.5v6" />
    </>
  ),
  flag: <path d="M5.5 21V4M5.5 5h11l-2 3.5 2 3.5h-11" />,
  shield: (
    <>
      <path d="M12 3l7 2.5v5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5v-5L12 3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  rain: (
    <>
      <path d="M7 14a4.5 4.5 0 0 1 .6-9 5.5 5.5 0 0 1 10.4 1.4A3.6 3.6 0 0 1 17.5 14" />
      <path d="M8.5 17l-1 2.5M12 17l-1 2.5M15.5 17l-1 2.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5M9.5 20v-5h5v5" />
    </>
  ),
  chat: (
    <>
      <path d="M4.5 5.5h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3.5V6.5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 10h7M8.5 12.5h4" />
    </>
  ),
  whatsapp: {
    fill: true,
    node: (
      <path d="M12.04 2a9.9 9.9 0 0 0-8.48 14.96L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm5.8 14.2c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11a16 16 0 0 1-1.65-.61 12.9 12.9 0 0 1-4.95-4.38c-.37-.5-.97-1.45-.97-2.77 0-1.31.69-1.96.93-2.23.24-.27.53-.34.7-.34l.5.01c.16.01.38-.06.59.45.24.58.8 2 .87 2.14.07.14.12.31.02.5-.1.18-.15.3-.29.46-.14.16-.3.36-.43.49-.14.13-.29.28-.13.55.16.27.72 1.18 1.54 1.91 1.06.95 1.95 1.24 2.22 1.38.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.59-.13.24.09 1.5.71 1.76.84.27.13.45.2.51.31.07.11.07.63-.17 1.31Z" />
    ),
  },
}

export default function Icon({ name, size = 22, stroke = 1.7, style, ...rest }) {
  const entry = PATHS[name]
  if (!entry) return null
  const filled = entry && entry.fill
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, ...style }}
      {...rest}
    >
      {filled ? entry.node : entry}
    </svg>
  )
}
