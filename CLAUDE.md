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
solo `.git*`, `.github/` y `README.md`. Consecuencias:

- Cualquier archivo commiteado queda público. Los documentos internos de trabajo
  (planes de campaña, informes, CSVs de Google Ads, `.docx`) están listados
  explícitamente en `.gitignore` — no commitearlos.
- Secrets requeridos: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

## Arquitectura de CSS/JS — la parte no obvia

Fuentes de verdad: `css/style.css` y `js/main.js`. Las páginas **no** las cargan;
cargan los minificados `css/style.min.css?v=3` y `js/main.min.js?v=4`. No existe
herramienta de minificación en el repo: los `.min.*` se generan aparte y se
commitean. **Editar solo el fuente y olvidar el minificado no tiene efecto en
producción.**

Además, las páginas con contenido above-the-fold inlinean un bloque de CSS
crítico (`@font-face` + design tokens + nav + hero + …) dentro de `<style>`:

- `index.html` — bloque propio (líneas ~37–619).
- `404.html`, `servicios/*/index.html`, `rectificatoria-renta-sii/index.html` —
  bloque **idéntico entre sí** (~573 líneas; en las de servicios va en 38–610).
- `politica-privacidad/`, `terminos/` — sin inline, solo `<link>`.

Por lo tanto, cambiar un design token (`--ink`, `--gold`, `--parchment`, `--fog`,
`--body`) o el nav/hero exige tocar hasta cuatro lugares: `style.css`,
`style.min.css`, el inline de `index.html`, y el inline compartido de las otras
páginas (aplicarlo a las 10). Verificar consistencia con:

```bash
for f in servicios/*/index.html rectificatoria-renta-sii/index.html; do
  md5 -q <(sed -n '38,610p' "$f")
done | sort -u   # debe imprimir un solo hash
```

Al cambiar `.min.css`/`.min.js` hay que subir el `?v=N` en **todas** las
páginas — `.htaccess` sirve CSS/JS con `max-age=31536000, immutable`.

`css/style.css` está organizado en bandas de comentarios por componente
(NAVIGATION, HERO, SERVICE CARDS, FAQ, SECTOR CLIENT PANEL, RESPONSIVE…), no por
archivo; seguir esa convención en vez de crear archivos nuevos.

## Formulario de contacto y medición

`js/main.js` (sección "Form → WhatsApp redirect"): el form `#contacto-form` no
hace POST propio. Al enviar, valida en cliente, llama `setUserDataEC()` para
Enhanced Conversions, hace `fetch(..., {mode:'no-cors'})` a un webhook de Google
Apps Script (captura de lead a Google Sheet, con token en el body), dispara el
evento GA4 `form_submit` y abre `wa.me` con el mensaje pre-armado.

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
`AccountingService`/`LocalBusiness` con `OfferCatalog`, reseñas y `FAQPage`; las
de servicio publican `Service` + `BreadcrumbList` + `FAQPage`. Al agregar o
renombrar una página hay que actualizar, en conjunto:

1. `sitemap.xml`
2. `llms.txt` (resumen del sitio para modelos de lenguaje — mantenerlo alineado
   con los servicios y datos de contacto reales)
3. el `OfferCatalog` de `index.html` y el nav/footer de **todas** las páginas
   (nav y footer están duplicados en cada HTML, no hay includes)

Datos de contacto y horario aparecen repetidos en varios archivos; cambiarlos es
siempre un `grep -rl` por el valor antiguo.

## Deuda conocida

- `Web/` es una copia desactualizada de todo el sitio (snapshot de 2025-08-21),
  commiteada por error y **desplegada tal cual** — queda accesible en
  `/Web/...`, con contenido viejo indexable. `Web/index.html`, `Web/css/style.css`
  y `Web/js/main.js` ya divergen de la raíz. No editarla; si el usuario lo pide,
  el arreglo es borrarla del repo. Ignorar `Web/` al hacer `grep`/`find`.
- `Web/ads-rectificatoria-renta-sii/` existe solo ahí; la versión viva es
  `rectificatoria-renta-sii/` en la raíz.
- `graphify-out/` no está trackeado y solo contiene un `.DS_Store`.
