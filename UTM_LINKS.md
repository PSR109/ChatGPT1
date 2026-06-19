# UTM links — atribución por canal (lo que PostHog no hace solo)

PostHog mide **qué pasa dentro de patagoniasimracing.cl**. NO sabe de qué red vino el visitante… salvo que el link traiga **UTMs**. PostHog **autocaptura** `utm_source/medium/campaign` en el primer pageview — **cero código extra**. Solo hay que usar el link con UTM en cada perfil.

## Regla de oro

UTM solo sirve si el link **apunta a la WEB**. Si un link va directo a `wa.me` (ej. botón WhatsApp de IG/GBP), PostHog no lo ve → esa conversión la cierra el **reel-code en el cobro SumUp** + el `/fuente` ("¿cómo nos conociste?"). Las dos capas juntas cubren todo.

| Superficie | ¿El link va a la web? | Usa UTM | Si va directo a wa.me |
|---|---|---|---|
| GBP — botón "Sitio web" | sí | pega link GBP de abajo | (botón "Reservar/WhatsApp" = SumUp reel-code) |
| TripAdvisor — campo Website | sí | pega link TripAdvisor | — |
| IG bio (link-in-bio → web) | si apunta a la web | pega link IG-bio | si bio = wa.me → SumUp reel-code |
| TikTok bio | si apunta a la web | pega link TikTok-bio | idem |
| Facebook | si apunta a la web | pega link FB | idem |
| YouTube (about/links) | sí | pega link YT | idem |

## Links listos para pegar (perfil / bio)

```
IG bio          https://www.patagoniasimracing.cl/?utm_source=instagram&utm_medium=bio&utm_campaign=perfil
TikTok bio      https://www.patagoniasimracing.cl/?utm_source=tiktok&utm_medium=bio&utm_campaign=perfil
GBP web button  https://www.patagoniasimracing.cl/?utm_source=gbp&utm_medium=perfil&utm_campaign=ficha
TripAdvisor     https://www.patagoniasimracing.cl/?utm_source=tripadvisor&utm_medium=perfil&utm_campaign=ficha
Facebook        https://www.patagoniasimracing.cl/?utm_source=facebook&utm_medium=perfil&utm_campaign=perfil
YouTube         https://www.patagoniasimracing.cl/?utm_source=youtube&utm_medium=bio&utm_campaign=perfil
```

## Links por publicación (opcional, atribución fina)

Cambia `utm_medium` (reel/story/post/video) y usa el **reel-code** como `utm_campaign` — el MISMO código que va al cobro SumUp. Así PostHog (web) y SumUp (venta directa) hablan el mismo idioma.

```
IG reel         https://www.patagoniasimracing.cl/?utm_source=instagram&utm_medium=reel&utm_campaign=<REEL-CODE>
IG story        https://www.patagoniasimracing.cl/?utm_source=instagram&utm_medium=story&utm_campaign=<REEL-CODE>
TikTok video    https://www.patagoniasimracing.cl/?utm_source=tiktok&utm_medium=video&utm_campaign=<REEL-CODE>
GBP post        https://www.patagoniasimracing.cl/?utm_source=gbp&utm_medium=post&utm_campaign=<TEMA>
```

## Cómo lo ves en PostHog

1. PostHog → **Web Analytics** → desglosa sesiones por `utm_source` (qué red trae más visitas).
2. PostHog → **Funnels** → paso 1 `$pageview`, paso 2 `wa_contact` → filtra por `utm_source` → **% visita→WhatsApp por canal**. Eso dice qué red convierte, no solo cuál trae bulto.
3. Combinado con `wa_contact {context}` (hero/FAB/paquetes) sabes qué red + qué parte del sitio cierra.

## Qué NO cubre (honesto)

- Conversión social → wa.me **directo** (sin pasar por la web) = invisible a PostHog. La mide **SumUp reel-code** (ya armado) + `/fuente`.
- Comportamiento **dentro** de IG/TikTok/GBP/TripAdvisor = no es superficie tuya → Metricool / GBP Insights / panel TripAdvisor (ya conectados).

UTM = pega-y-listo, sin tocar código. Generador de links en la skill `psr-measure` (`/psr-measure utm <red>`).
