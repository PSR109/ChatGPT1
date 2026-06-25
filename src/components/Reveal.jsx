import { useEffect, useRef } from 'react'

/**
 * Reveal — anima la entrada de un bloque al entrar al viewport (scroll-reveal).
 * Usa UN solo IntersectionObserver compartido a nivel de módulo (barato).
 * Sin JS / reduce-motion / sin soporte IO -> el contenido se muestra igual
 * (.psr-reveal arranca oculta pero .is-in se agrega de inmediato como fallback).
 * Honra prefers-reduced-motion vía CSS (.psr-reveal en index.css).
 */
let sharedObserver = null

function getObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            sharedObserver.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
  }
  return sharedObserver
}

export default function Reveal({
  // eslint-disable-next-line no-unused-vars -- Tag se usa como componente en JSX (limitación del linter sin eslint-plugin-react para params)
  as: Tag = 'div',
  delay = 0,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = getObserver()
    if (!io) {
      el.classList.add('is-in')
      return undefined
    }
    io.observe(el)
    return () => io.unobserve(el)
  }, [])

  return (
    <Tag
      ref={ref}
      className={`psr-reveal ${className}`.trim()}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
