/* ═══════════════════════════════════════════════════════════════
   CONSULTORES VEGA — main.js
   Interactions: magnetic buttons, count-up, reveal, mobile menu
   Analytics: GA4 custom events (conversiones CRO)
═══════════════════════════════════════════════════════════════ */

/* ─── GA4 helper — dispara evento solo si gtag está disponible ─── */
function cvTag(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, Object.assign({ send_to: 'G-079G5GCGK9' }, params));
  }
}

/* ─── Enhanced Conversions: normalización de datos de contacto ───
   Google recomienda enviar el dato en texto plano ya normalizado
   (trim + minúsculas para email, formato E.164 para teléfono) y
   dejar que el Google tag lo hashee (SHA-256) automáticamente antes
   de transmitirlo. No se envía ni se guarda el dato sin hashear. */
function normalizeEmailEC(email) {
  return (email || '').trim().toLowerCase();
}
function normalizePhoneEC(phone) {
  if (!phone) return '';
  let digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  digits = digits.replace(/^0+/, '');
  /* Chile: 9 dígitos móviles → anteponer +56 */
  if (digits.length === 9) return '+56' + digits;
  if (digits.length === 8) return '+562' + digits; /* fijo Valparaíso/Viña, sin 9 */
  return digits ? '+56' + digits : '';
}
/* Envía email/teléfono normalizados al Google tag para Enhanced
   Conversions (GA4 + Google Ads, si se enlaza una cuenta más
   adelante). Debe llamarse ANTES del evento de conversión. */
function setUserDataEC(email, phone) {
  if (typeof gtag !== 'function') return;
  const userData = {};
  const emailN = normalizeEmailEC(email);
  const phoneN = normalizePhoneEC(phone);
  if (emailN) userData.email = emailN;
  if (phoneN) userData.phone_number = phoneN;
  if (Object.keys(userData).length) {
    gtag('set', 'user_data', userData);
  }
}

/* ═══════════════════════════════════════════════════════════════
   HORARIO DE ATENCIÓN — tooltip al hacer hover en botones WhatsApp
   Lun–Vie: 09:00–13:30  |  Lun–Jue: 15:00–17:30 (Chile)
═══════════════════════════════════════════════════════════════ */
(function () {

  /* ── Detecta si estamos en horario hábil (zona horaria Chile) ── */
  function estaEnHorario() {
    try {
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Santiago',
        weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      });
      var parts = fmt.formatToParts(new Date());
      var get = function(type) { return parts.find(function(p){ return p.type === type; }); };
      var diaStr = (get('weekday') || {value:''}).value;
      var h    = parseInt((get('hour')   || {value:'0'}).value, 10);
      var m    = parseInt((get('minute') || {value:'0'}).value, 10);
      var mins = h * 60 + m;
      var diasHab = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5 };
      var dia  = diasHab[diaStr];
      if (!dia) return false;
      return (mins >= 540 && mins < 810) || (mins >= 900 && mins < 1050 && dia <= 4);
    } catch(e) { return false; }
  }

  /* ── Construye el tooltip una sola vez ── */
  function crearToast() {
    if (document.getElementById('wa-horario-toast')) return;
    var enHorario = estaEnHorario();
    var t = document.createElement('div');
    t.id = 'wa-horario-toast';
    t.className = 'wa-toast';
    t.setAttribute('role', 'tooltip');
    t.innerHTML =
      '<div class="wa-toast__header">' +
        '<span class="wa-toast__icon wa-toast__icon--' + (enHorario ? 'on' : 'off') + '">' +
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>' +
        '</span>' +
        (enHorario ? 'En línea ahora' : 'Fuera de horario') +
      '</div>' +
      (enHorario
        ? '<p class="wa-toast__body">Estamos disponibles. Te respondemos de inmediato.</p>'
        : '<p class="wa-toast__body">Tu mensaje llegará. Te respondemos en el próximo horario hábil.</p>'
      ) +
      '<div class="wa-toast__horario">' +
        '<strong>Horario de atención</strong><br>' +
        'Lun – Vie: &nbsp;9:00 – 13:30 hrs<br>' +
        'Lun – Jue: 15:00 – 17:30 hrs' +
      '</div>';
    document.body.appendChild(t);
  }

  var _hideTimer = null;

  function mostrarToast(anchorEl) {
    crearToast();
    var t = document.getElementById('wa-horario-toast');
    if (!t) return;
    clearTimeout(_hideTimer);

    var r  = anchorEl.getBoundingClientRect();
    var tw = Math.min(300, window.innerWidth - 16);
    var vh = window.innerHeight;

    /* Alineación horizontal: pegado al borde derecho del botón, sin salir de pantalla */
    var left = r.right - tw;
    if (left < 8) left = 8;
    if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;

    /* Posición vertical: debajo si el botón está en la mitad superior, arriba si no */
    var enMitadSuperior = r.bottom < vh / 2;
    t.style.left   = left + 'px';
    t.style.right  = 'auto';
    t.style.width  = tw + 'px';
    if (enMitadSuperior) {
      t.style.top    = (r.bottom + 10) + 'px';
      t.style.bottom = 'auto';
    } else {
      t.style.bottom = (vh - r.top + 10) + 'px';
      t.style.top    = 'auto';
    }

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        t.classList.add('is-visible');
      });
    });
  }

  function ocultarToast(delay) {
    _hideTimer = setTimeout(function() {
      var t = document.getElementById('wa-horario-toast');
      if (t) t.classList.remove('is-visible');
    }, delay || 0);
  }

  /* ── Registrar hover en todos los botones WhatsApp ── */
  function bindHover() {
    var t = document.getElementById('wa-horario-toast');

    document.querySelectorAll('a[href*="wa.me"]').forEach(function(el) {
      el.addEventListener('mouseenter', function() { mostrarToast(el); });
      el.addEventListener('mouseleave', function() { ocultarToast(300); });
    });

    /* Si el mouse entra al propio toast, cancelar el hide */
    document.addEventListener('mouseenter', function(e) {
      var toast = document.getElementById('wa-horario-toast');
      if (toast && toast.contains(e.target)) clearTimeout(_hideTimer);
    }, true);
    document.addEventListener('mouseleave', function(e) {
      var toast = document.getElementById('wa-horario-toast');
      if (toast && toast.contains(e.target)) ocultarToast(300);
    }, true);
  }

  /* Inicializar al cargar el DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindHover);
  } else {
    bindHover();
  }

})();

(function () {
  'use strict';

  /* ─── Scroll Progress ─── */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0';
    }, { passive: true });
  }

  /* ─── Navbar Scroll State ─── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const handleNavScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  /* ─── Mobile Overlay Menu ─── */
  const toggle = document.querySelector('.nav__toggle');
  const overlay = document.querySelector('.nav__overlay');
  const overlayClose = document.querySelector('.nav__overlay-close');

  if (toggle && overlay) {
    const openMenu = () => {
      overlay.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      overlay.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    if (overlayClose) overlayClose.addEventListener('click', closeMenu);
    overlay.querySelectorAll('.nav__overlay-link, .nav__overlay-wa').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
    });
  }

  /* ─── Reveal on scroll (IntersectionObserver) ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // gold-rule children
        entry.target.querySelectorAll('.gold-rule').forEach(r => r.classList.add('visible'));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => {
    revealObserver.observe(el);
  });

  /* Gold rule standalone */
  const goldRuleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        goldRuleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.gold-rule').forEach(el => goldRuleObserver.observe(el));

  /* ─── Hero overline line ─── */
  const heroLine = document.querySelector('.hero__overline-line');
  if (heroLine) {
    setTimeout(() => heroLine.classList.add('is-visible'), 400);
  }

  /* ─── Count-Up Animation ─── */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();
    const isFloat = String(target).includes('.');
    const decimals = isFloat ? (String(target).split('.')[1] || '').length : 0;
    const startVal = parseFloat(el.dataset.from || '0');

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = startVal + (target - startVal) * easeOutQuart(progress);
      el.textContent = prefix + (decimals > 0 ? value.toFixed(decimals) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ─── Magnetic Buttons ─── */
  document.querySelectorAll('.btn-magnetic').forEach(wrap => {
    const btn = wrap.querySelector('.btn') || wrap;
    let bounds;

    wrap.addEventListener('mouseenter', () => {
      bounds = wrap.getBoundingClientRect();
      btn.style.transition = 'transform 0s';
    });
    wrap.addEventListener('mousemove', e => {
      if (!bounds) return;
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    wrap.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1)';
      btn.style.transform = '';
      bounds = null;
    });
  });

  /* ─── Active nav link ─── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link, .nav__dropdown-item').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (currentPath === href || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('active');
    }
  });

  /* ─── FAQ accordion ─── */
  document.querySelectorAll('.faq-item details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        document.querySelectorAll('.faq-item details').forEach(other => {
          if (other !== detail) other.removeAttribute('open');
        });
      }
    });
  });

  /* ─── Form → WhatsApp redirect (con validación) ─── */
  const contactForm = document.querySelector('#contacto-form');
  if (contactForm) {
    /* Anti-spam: honeypot + tiempo mínimo de llenado */
    const formLoadedAt = Date.now();

    /* Muestra/oculta el error de un campo */
    function setError(field, msg) {
      const wrap = field.closest('.form-group');
      if (!wrap) return;
      field.classList.toggle('field--error', !!msg);
      let err = wrap.querySelector('.field-error-msg');
      if (msg) {
        if (!err) {
          err = document.createElement('span');
          err.className = 'field-error-msg';
          err.setAttribute('role', 'alert');
          wrap.appendChild(err);
        }
        err.textContent = msg;
      } else if (err) {
        err.remove();
      }
    }

    /* Valida el formulario completo; devuelve true si todo está OK */
    function validarForm(data) {
      let ok = true;
      const nombre  = (data.get('nombre')  || '').trim();
      const email   = (data.get('email')   || '').trim();
      const servicio= (data.get('servicio')|| '').trim();

      /* Nombre */
      if (!nombre) {
        setError(contactForm.querySelector('#nombre'), 'Por favor ingrese su nombre.');
        ok = false;
      } else {
        setError(contactForm.querySelector('#nombre'), '');
      }

      /* Email */
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!email) {
        setError(contactForm.querySelector('#email'), 'Por favor ingrese su email.');
        ok = false;
      } else if (!emailOk) {
        setError(contactForm.querySelector('#email'), 'Ingrese un email válido.');
        ok = false;
      } else {
        setError(contactForm.querySelector('#email'), '');
      }

      /* Servicio */
      if (!servicio) {
        setError(contactForm.querySelector('#servicio'), 'Seleccione un servicio de interés.');
        ok = false;
      } else {
        setError(contactForm.querySelector('#servicio'), '');
      }

      return ok;
    }

    /* Limpiar error al editar el campo */
    ['nombre','email','servicio'].forEach(id => {
      const el = contactForm.querySelector('#' + id);
      if (el) el.addEventListener('input', () => setError(el, ''));
    });

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(contactForm);

      if (!validarForm(data)) {
        /* Hacer scroll al primer error */
        const firstErr = contactForm.querySelector('.field--error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* Anti-spam: si el campo oculto viene lleno es un bot → se descarta
         en silencio. Si se envió en menos de 3 s (posible bot o autocompletado)
         no se registra el lead ni la conversión, pero igual se abre WhatsApp. */
      if ((data.get('website') || '').trim() !== '') return;
      const elapsed = Date.now() - formLoadedAt;
      const sospechoso = elapsed < 3000;

      const nombre  = data.get('nombre').trim();
      const empresa = (data.get('empresa') || '').trim();
      const email   = data.get('email').trim();
      const telefono= (data.get('telefono') || '').trim();
      const servicio= data.get('servicio');
      const mensaje = (data.get('mensaje') || '').trim();
      const wa = '+56953330986';
      let text = `Hola, mi nombre es ${nombre}`;
      if (empresa) text += ` de ${empresa}`;
      text += `. Estoy interesado en ${servicio}.`;
      if (mensaje) text += ` ${mensaje}`;
      const encoded = encodeURIComponent(text);

      /* Enhanced Conversions: registrar email/teléfono (normalizados,
         hasheados por el Google tag) ANTES del evento de conversión */
      if (!sospechoso) {
        setUserDataEC(email, telefono);

        /* Captura de lead: enviar datos completos a Google Sheet vía
           Apps Script webhook. No se envía a GA4 (evita PII en eventos);
           es un canal separado solo para uso interno del negocio. */
        fetch('https://script.google.com/macros/s/AKfycbxA__HpZXBG-jAvXbliXKAljMTbQbKYBsgtjnjymKG5qw2n5QLk9LQQtSoSEWk15s0kTA/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: 'CVsii7k3Qm9Xp2Rf8Nb',
            nombre: nombre,
            empresa: empresa,
            email: email,
            telefono: telefono,
            servicio: servicio,
            mensaje: mensaje,
            pagina: window.location.pathname,
            t: String(elapsed)
          })
        }).catch(function () {});

        cvTag('form_submit', {
          event_category: 'contacto',
          event_label: servicio,
          page: window.location.pathname
        });
      }
      window.open(`https://wa.me/${wa}?text=${encoded}`, '_blank');
    });
  }

  /* ─── GA4: TODOS los links WhatsApp ─── */
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {

      /* Etiquetar el evento según el origen del botón */
      let label = 'whatsapp_link';
      if (link.classList.contains('wa-fab'))        label = 'fab_flotante';
      else if (link.classList.contains('nav__cta')) label = 'nav_consulta_gratis';
      else if (link.classList.contains('nav__overlay-wa')) label = 'menu_overlay_movil';
      else if (link.closest('.hero__actions'))      label = 'hero_cta';
      else if (link.closest('.cta-band'))           label = 'cta_band';
      else if (link.closest('.service-hero'))       label = 'service_hero_cta';
      else {
        label = link.dataset.gaLabel ||
                link.closest('section')?.getAttribute('aria-label') ||
                link.textContent.trim().slice(0, 50) ||
                'whatsapp_link';
      }
      cvTag('whatsapp_click', {
        event_category: 'whatsapp',
        event_label: label,
        page: window.location.pathname
      });
    });
  });

  /* ─── GA4: CTAs que NO son WhatsApp ─── */
  document.querySelectorAll('.nav__cta:not([href*="wa.me"])').forEach(btn => {
    btn.addEventListener('click', () => {
      cvTag('cta_click', { event_category: 'cta', event_label: 'nav_consulta_gratis', page: window.location.pathname });
    });
  });

  /* ─── GA4: click teléfono ─── */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      cvTag('phone_click', {
        event_category: 'contacto',
        event_label: link.href.replace('tel:', ''),
        page: window.location.pathname
      });
    });
  });

  /* ─── GA4: click email ─── */
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      cvTag('email_click', {
        event_category: 'contacto',
        event_label: link.href.replace('mailto:', ''),
        page: window.location.pathname
      });
    });
  });

  /* ─── Smooth anchor scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();

/* ─── Footer accordion (mobile) ─── */
(function () {
  function initFooterAccordion() {
    if (window.innerWidth > 767) return;
    document.querySelectorAll('.footer__col-title').forEach(function (title) {
      // Skip first col (brand col has no toggle)
      if (title.closest('.footer__brand-col')) return;
      title.style.cursor = 'pointer';
      title.addEventListener('click', function () {
        this.classList.toggle('open');
      });
    });
  }
  initFooterAccordion();
  // Re-check on resize
  var mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', function (e) {
    if (!e.matches) {
      // Remove open states + restore links visibility on desktop
      document.querySelectorAll('.footer__col-title.open').forEach(function (el) {
        el.classList.remove('open');
      });
    } else {
      initFooterAccordion();
    }
  });
})();
