# Graph Report - consultores-vega  (2026-08-21)

## Corpus Check
- 26 files · ~72,482 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 68 nodes · 100 edges · 7 communities
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Sitio Web Principal
- Servicios y Reguladores
- JavaScript Principal
- JavaScript Minificado
- Propuesta Rediseño Web
- Deploy y CI/CD
- Animaciones Contador

## God Nodes (most connected - your core abstractions)
1. `Consultores Vega Homepage` - 11 edges
2. `Consultores Vega` - 9 edges
3. `Consultores Vega LLMs.txt` - 7 edges
4. `Consultores Vega Ltda.` - 6 edges
5. `SEO + CRO Strategy Proposal` - 5 edges
6. `Production Design System` - 5 edges
7. `Politica de Privacidad` - 4 edges
8. `Servicio de Impuestos Internos (SII)` - 4 edges
9. `Control Interno Service Page` - 4 edges
10. `Evaluaciones de Empresa Service Page` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Robots.txt` --references--> `Consultores Vega Homepage`  [INFERRED]
  robots.txt → index.html
- `Terminos de Uso Page` --DESCRIBES--> `Consultores Vega`  [INFERRED]
  terminos/index.html → propuesta/datos_web.txt
- `Production Design System` --EXTENDS--> `Heritage Excellence Design System`  [INFERRED]
  servicios/control-interno/index.html → propuesta/heritage_excellence/DESIGN.md
- `404 Error Page` --references--> `Consultores Vega Homepage`  [EXTRACTED]
  404.html → index.html
- `Consultores Vega Homepage` --references--> `Consultoria Service Page`  [EXTRACTED]
  index.html → servicios/consultoria/index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Main Navigation Service Links** — index_consultores_vega_homepage, servicios_auditoria_tributaria_index_auditoria_tributaria, servicios_auditoria_contable_index_auditoria_contable, servicios_contabilidad_index_contabilidad, servicios_consultoria_index_consultoria [EXTRACTED 1.00]
- **Shared Design System Across All Pages** — index_design_system, index_consultores_vega_homepage, 404_error_page, politica_privacidad_index_privacy_policy, rectificatoria_renta_sii_index_rectificatoria, servicios_auditoria_contable_index_auditoria_contable, servicios_auditoria_tributaria_index_auditoria_tributaria, servicios_consultoria_index_consultoria, servicios_contabilidad_index_contabilidad [EXTRACTED 1.00]
- **FTPS Deployment Pipeline** — _github_workflows_deploy_deploy_workflow, _github_workflows_deploy_ftp_deploy_action, readme_project_readme [EXTRACTED 1.00]
- **Production service pages unified design system** — servicios_control_interno_index_page, servicios_evaluaciones_index_page, servicios_remuneraciones_index_page, servicios_tributarios_mensuales_index_page, production_design_system_concept [1.0]
- **Heritage Excellence prototype family** — propuesta_inicio_consultores_vega_code_prototype, propuesta_servicios_consultores_vega_code_prototype, propuesta_servicios_consultores_vega_optimizado_code_prototype, propuesta_heritage_excellence_design_system [1.0]
- **Website redesign proposal package** — propuesta_datos_web_content, propuesta_seo_cro_brief, propuesta_estrategia_seo_cro_consultores_vega_strategy, propuesta_heritage_excellence_design_system [0.9]

## Communities (7 total, 0 thin omitted)

### Community 0 - "Sitio Web Principal"
Cohesion: 0.21
Nodes (17): 404 Error Page, Consultores Vega Homepage, Consultores Vega Ltda., Consultores Vega Design System, Google Analytics G-079G5GCGK9, CMF / SVS (Comision para el Mercado Financiero), Consultores Vega LLMs.txt, Isaac Vega Duran (+9 more)

### Community 1 - "Servicios y Reguladores"
Cohesion: 0.23
Nodes (13): CMF / SVS, Consultores Vega, COSO Framework, Direccion del Trabajo, Issac Vega Duran, Lincoyan Vega Ovalle, Production Design System, Control Interno Service Page (+5 more)

### Community 2 - "JavaScript Principal"
Cohesion: 0.24
Nodes (10): bindHover(), crearToast(), estaEnHorario(), mostrarToast(), normalizeEmailEC(), normalizePhoneEC(), ocultarToast(), setError() (+2 more)

### Community 3 - "JavaScript Minificado"
Cohesion: 0.26
Nodes (10): e(), f(), h(), l(), n(), normalizeEmailEC(), normalizePhoneEC(), o() (+2 more)

### Community 4 - "Propuesta Rediseño Web"
Cohesion: 0.43
Nodes (7): Original Website Content Scrape, SEO + CRO Strategy Proposal, Heritage Excellence Design System, Homepage Prototype (Tailwind), SEO/CRO Creative Brief, Services Page Prototype (Tailwind), Optimized Services Page Prototype

### Community 5 - "Deploy y CI/CD"
Cohesion: 0.67
Nodes (3): FTPS Deploy Workflow, FTP-Deploy-Action v4.3.5, Project README

### Community 6 - "Animaciones Contador"
Cohesion: 1.00
Nodes (3): animateCount(), easeOutQuart(), tick()

## Knowledge Gaps
- **11 isolated node(s):** `Project README`, `Robots.txt`, `Rectificatoria Renta SII`, `FTP-Deploy-Action v4.3.5`, `Lincoyan Vega Ovalle` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Consultores Vega` connect `Servicios y Reguladores` to `Propuesta Rediseño Web`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Consultores Vega` (e.g. with `Issac Vega Duran` and `Lincoyan Vega Ovalle`) actually correct?**
  _`Consultores Vega` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `SEO + CRO Strategy Proposal` (e.g. with `Consultores Vega` and `Original Website Content Scrape`) actually correct?**
  _`SEO + CRO Strategy Proposal` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Project README`, `Robots.txt`, `Rectificatoria Renta SII` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._