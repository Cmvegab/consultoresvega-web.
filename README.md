# consultoresvega.cl

Código fuente del sitio web de Consultores Vega.

## Despliegue

Cada push a `main` despliega automáticamente a `public_html` en el hosting
vía FTPS (GitHub Actions), usando la cuenta FTP dedicada `deploy-web`
(sin acceso al resto de la cuenta de hosting).

Secrets necesarios en **Settings → Secrets and variables → Actions**:

- `FTP_SERVER` — `ftp.consultoresvega.cl`
- `FTP_USERNAME` — `deploy-web@consultoresvega.cl`
- `FTP_PASSWORD`
