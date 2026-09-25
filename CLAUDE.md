# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Sitio estático (HTML + CSS + JS vanilla, sin framework ni build system) de
consultoresvega.cl — firma contable/auditora en Viña del Mar. Todo el contenido
está en español de Chile. No hay `package.json`, ni dependencias, ni tests.
La raíz del repo **es** el document root del hosting (`public_html`).

## Desarrollo

Todas las rutas de assets son absolutas (`/css/...`, `/fonts/...`), así que
abrir un archivo con `file://` rompe estilos. Servir siempre desde la raíz:

```bash
python3 -m http.server 8000   # luego http://localhost:8000/
```

No hay linter ni tests. Verificación = abrir la página afectada, revisar
consola, y validar el JSON-LD (`<script type="application/ld+json">`) si se tocó.

## Despliegue

Push a `main` → GitHub Actions (`.github/workflows/deploy.yml`) sube **todo el
repo** a `public_html` por FTPS con `SamKirkland/FTP-Deploy-Action`, excluyendo
solo `.git*`, `.github/`, `README.md` y `CLAUDE.md`. Consecuencias:

- Cualquier archivo commiteado queda público. Los documentos internos de trabajo
  (planes de campaña, informes, CSVs de Google Ads, `.docx`) están listados
  explícitamente en `.gitignore` — no commitearlos. Como red de seguridad,
  `.htaccess` responde 403 a cualquier `*.md`.
- El deploy borra del servidor lo que se elimina del repo, pero **no** lo que se
  agrega al `exclude` después de haberse subido (queda huérfano en el servidor).
- `.htaccess` además fuerza HTTPS + `www`, redirige `/index.html` → `/` y
  `/servicios/` → `/#servicios`, y envía HSTS y Permissions-Policy.
- Secrets requeridos: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

## Arquitectura de CSS/JS — la parte no obvia

Fuentes de verdad: `css/style.css` y `js/main.js`. Las páginas **no** las cargan;
cargan los minificados `css/style.min.css?v=5` y `js/main.min.js?v=6`. No hay
herramienta de minificación en el repo: los `.min.*` se generan aparte y se
commitean. **Editar solo el fuente y olvidar el minificado no tiene efecto en
producción.** Desde 2026-09 se generan así:

```bash
npx csso-cli css/style.css -o css/style.min.css
npx terser js/main.js -c -m -o js/main.min.js
```

Además, las páginas con contenido above-the-fold inlinean un bloque de CSS
crítico (`@font-face` + design tokens + nav + hero + …) dentro de `<style>`:

- `index.html` — bloque propio.
- `404.html`, `servicios/*/index.html`, `rectificatoria-renta-sii/index.html` —
  bloque **idéntico entre sí**.
- `politica-privacidad/`, `terminos/` — sin inline, solo `<link>` (toman las
  fuentes del `@font-face` que está al inicio de `style.css`).

Por lo tanto, cambiar un design token (`--ink`, `--gold`, `--parchment`, `--fog`,
`--body`) o el nav/hero exige tocar hasta cuatro lugares: `style.css`,
`style.min.css`, el inline de `index.html`, y el inline compartido de las otras
páginas (aplicarlo a las 10). Verificar consistencia con:

```bash
for f in servicios/*/index.html rectificatoria-renta-sii/index.html 404.html; do
  sed -n '/<style>/,/<\/style>/p' "$f" | md5
done | sort -u   # debe imprimir un solo hash
```

Al cambiar `.min.css`/`.min.js` hay que subir el `?v=N` en **todas** las
páginas — `.htaccess` sirve CSS/JS con `max-age=31536000, immutable`.

Fuentes: 3 archivos variables en `fonts/` (Cormorant Garamond normal e itálica,
eje `wght` 300–700; DM Sans normal, `wght`). Se declaran en el inline de cada
página, en `style.css` y en `fonts/fonts.css` (este último no lo carga ninguna
página); las 3 van con `<link rel="preload">` en todas las páginas.

`css/style.css` está organizado en bandas de comentarios por componente
(NAVIGATION, HERO, SERVICE CARDS, FAQ, SECTOR CLIENT PANEL, RESPONSIVE…), no por
archivo; seguir esa convención en vez de crear archivos nuevos.

## Formulario de contacto y medición

`js/main.js` (sección "Form → WhatsApp redirect"): el form `#contacto-form` no
hace POST propio. Tiene un honeypot (`name="website"`, oculto): si viene lleno
se descarta; si se envía en < 3 s no se registra lead ni conversión (igual abre
WhatsApp). Al enviar, valida en cliente, llama `setUserDataEC()` para
Enhanced Conversions, hace `fetch(..., {mode:'no-cors'})` a un webhook de Google
Apps Script (captura de lead a Google Sheet, con token en el body), dispara el
evento GA4 `form_submit` y abre `wa.me` con el mensaje pre-armado.

- El webhook es el proyecto Apps Script "Leads Webhook - Consultores Vega"
  (vinculado a la hoja de leads, "Hoja 1"). Filtra token, honeypot, `t` < 3000 ms,
  nombre/email inválidos, > 2 links, mismo email en 10 min y > 30 leads/hora, y
  neutraliza fórmulas. Al cambiar el código hay que publicar **nueva versión en
  la implementación existente** para no cambiar la URL que usa `main.js`.
- GA4 `G-079G5GCGK9` se carga diferido en un `<script>` inline al final de cada
  página, en `window.load`. Todo evento pasa por el helper `cvTag()`, que es
  no-op si `gtag` no existe — no llamar `gtag()` directo.
- Regla vigente: PII (email/teléfono) va solo al webhook y a Enhanced
  Conversions normalizada; **nunca** como parámetro de un evento GA4.
- El toast de horario de los botones WhatsApp calcula días/horas hábiles en
  zona horaria de Chile vía `Intl.DateTimeFormat`; el horario real está
  duplicado en `llms.txt`, el JSON-LD (`OpeningHoursSpecification`) y el footer.

## Contenido, SEO y datos estructurados

Cada página lleva `canonical`, Open Graph y JSON-LD. `index.html` publica
`AccountingService`/`LocalBusiness` con `OfferCatalog` (sin reseñas:
las propias del negocio no son elegibles en Google); las
de servicio publican `Service` + `BreadcrumbList` + `FAQPage`. La FAQ general
vive solo en `preguntas-frecuentes/` (WebPage + BreadcrumbList + FAQPage; sin
CSS inline, como `terminos/`); el home ya no tiene sección FAQ y el menú "FAQ"
apunta ahí. `/faq/` redirige 301 a esa página. Al agregar o
renombrar una página hay que actualizar, en conjunto:

1. `sitemap.xml`
2. `llms.txt` (resumen del sitio para modelos de lenguaje — mantenerlo alineado
   con los servicios y datos de contacto reales)
3. el `OfferCatalog` de `index.html` y el nav/footer de **todas** las páginas
   (nav y footer están duplicados en cada HTML, no hay includes)

Datos de contacto y horario aparecen repetidos en varios archivos; cambiarlos es
siempre un `grep -rl` por el valor antiguo.

Reglas de contenido vigentes:

- Sin precios ni promociones ("1 mes gratis"): la oferta es **evaluación
  gratuita**. Tampoco `price`/`priceRange` con montos en el schema.
- La firma **no** está inscrita en la CMF. El director, Lincoyán Vega Ovalle, fue
  auditor externo inscrito en la SVS (N° 229, 07/11/1991; hoy "Cancelado" en la
  CMF): citarlo siempre en pasado. Es perito judicial (Corte de Apelaciones de
  Valparaíso) desde 1978.
- Tratar al lector de "usted"; nada de "certificados" (el SII no certifica
  contadores) ni promesas absolutas ("nunca más multas", "garantizado").

## Deuda conocida

- La protección anti-bot del hosting (Imunify360/openresty, nivel servidor, no
  configurable desde cPanel) responde "Un momento…" con status 200 ante ráfagas
  de requests. Pendiente: que el hosting confirme la lista blanca de Googlebot
  y AdsBot. Al auditar el sitio, espaciar las solicitudes.
- `Web/` y `graphify-out/` se eliminaron (2026-09-25) y están en `.gitignore`.
