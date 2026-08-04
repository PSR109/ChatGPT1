/**
 * Links a la TIENDA digital (configuracion.patagoniasimracing.cl).
 *
 * Por qué existe este módulo (2026-08-03). patagoniasimracing.cl es el único
 * activo del portafolio con público real y clientes que ya pagan (el simcenter
 * de Puerto Varas), y la tienda de setups es el único checkout vivo. Hasta hoy
 * la conexión entre ambos eran DOS enlaces sueltos —el pie de App.jsx y el CTA
 * de /simracers— que además apuntaban a la RAÍZ del dominio de la tienda, no al
 * catálogo: el visitante caía en el generador gratis y nunca veía un producto.
 * Ninguno llevaba UTM, así que en Cloudflare Web Analytics (que la tienda sí
 * tiene, beacon vivo) ese tráfico era indistinguible del resto.
 *
 * Acá se centraliza para que ningún enlace nuevo vuelva a nacer sin destino ni
 * atribución. Convención de UTM alineada con UTM_LINKS.md: `utm_source` = de
 * dónde viene, `utm_medium` = qué tipo de superficie, `utm_campaign` = el
 * emplazamiento exacto, para poder comparar cuál de los tres convierte.
 */

export const PSR_STORE_ORIGIN = 'https://configuracion.patagoniasimracing.cl'

/** El CATÁLOGO, no la raíz: quien hace clic viene a ver productos. */
export const PSR_STORE_PACKS_PATH = '/packs'

/**
 * URL de la tienda con atribución.
 * @param {string} placement - emplazamiento (ej. 'home-simracers', 'footer').
 * @param {string} path - ruta dentro de la tienda; por defecto el catálogo.
 */
export function buildStoreLink(placement, path = PSR_STORE_PACKS_PATH) {
  const params = new URLSearchParams({
    utm_source: 'psr-web',
    utm_medium: 'cross-sell',
    utm_campaign: placement,
  })
  return `${PSR_STORE_ORIGIN}${path}?${params.toString()}`
}
