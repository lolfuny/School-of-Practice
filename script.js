/* =========================================================
   School of Practice — Landing Page Scripts
   Vanilla JS | No dependencies | AR + EN support
   ========================================================= */

(function () {
  'use strict';

  /* =======================================================
     1. STATE & CONSTANTS
     ======================================================= */
  const STORAGE_KEY = 'sop_lang';
  const DEFAULT_LANG = 'ar';
  const SUPPORTED_LANGS = ['ar', 'en'];
  const NAV_SECTIONS = ['home', 'about', 'vision', 'tracks', 'contact'];

  let currentLang = DEFAULT_LANG;

  /* =======================================================
     2. UTILITIES
     ======================================================= */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =======================================================
     3. LANGUAGE (AR / EN)
     ======================================================= */
  function setLanguage(lang, persist = true) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    currentLang = lang;

    // Update <html>
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';

    // Toggle .ar / .en spans
    $$('.ar').forEach(el => { el.hidden = lang !== 'ar'; });
    $$('.en').forEach(el => { el.hidden = lang !== 'en'; });

    // Update placeholders
    $$('[data-ar-placeholder]').forEach(el => {
      el.placeholder = lang === 'ar'
        ? el.dataset.arPlaceholder
        : el.dataset.enPlaceholder;
    });

    // Update lang toggle button label
    const langBtn = $('#langToggle');
    if (langBtn) {
      langBtn.textContent = lang === 'ar' ? 'English' : 'العربية';
      langBtn.setAttribute(
        'aria-label',
        lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'
      );
    }

    // Update nav toggle aria-label
    const navToggle = $('#navToggle');
    if (navToggle) {
      navToggle.setAttribute(
        'aria-label',
        lang === 'ar' ? 'فتح القائمة' : 'Open menu'
      );
    }

    // Back to top aria-label
    const backTop = $('#backToTop');
    if (backTop) {
      backTop.setAttribute(
        'aria-label',
        lang === 'ar' ? 'العودة للأعلى' : 'Back to top'
      );
    }

    // Update select options
    updateSelectOptions(lang);

    // Update form status if visible
    updateFormStatusLang(lang);

    // Persist
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    }
  }

  /**
   * Options in <select> can't contain hidden spans, so we store both
   * AR and EN labels in data-attributes and swap them here.
   */
  function updateSelectOptions(lang) {
    const select = $('#cf-interest');
    if (!select) return;
    $$('option', select).forEach(opt => {
      const ar = opt.dataset.ar;
      const en = opt.dataset.en;
      if (ar && en) {
        opt.textContent = lang === 'ar' ? ar : en;
      }
    });
  }

  /**
   * Read the AR/EN labels from the select on load and store them
   * as data-attributes so we can switch later.
   */
  function cacheSelectOptions() {
    const select = $('#cf-interest');
    if (!select) return;
    $$('option', select).forEach(opt => {
      const arSpan = opt.querySelector('.ar');
      const enSpan = opt.querySelector('.en');
      if (arSpan && enSpan) {
        opt.dataset.ar = arSpan.textContent.trim();
        opt.dataset.en = enSpan.textContent.trim();
        // Clean up the option content (remove spans)
        opt.textContent = opt.dataset.ar;
      }
    });
  }

  function initLanguage() {
    let saved = DEFAULT_LANG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) saved = stored;
    } catch (e) {}

    cacheSelectOptions();
    setLanguage(saved, false);
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'ar' ? 'en' : 'ar');
  }

  /* =======================================================
     4. MOBILE NAVIGATION
     ======================================================= */
  function toggleMobileNav() {
    const nav = $('#siteNav');
    const btn = $('#navToggle');
    if (!nav || !btn) return;

    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileNav() {
    const nav = $('#siteNav');
    const btn = $('#navToggle');
    if (!nav || !btn) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function initMobileNav() {
    const btn = $('#navToggle');
    if (btn) {
      btn.addEventListener('click', toggleMobileNav);
    }

    // Close on nav link click (mobile)
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeMobileNav();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const nav = $('#siteNav');
      const btn = $('#navToggle');
      if (!nav || !btn) return;
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      closeMobileNav();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileNav();
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMobileNav();
    });
  }

  /* =======================================================
     5. SMOOTH SCROLL
     ======================================================= */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const headerOffset = 80;
        const targetY = target.getBoundingClientRect().top
                      + window.pageYOffset
                      - headerOffset;

        window.scrollTo({
          top: targetY,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, '', href);
        }

        updateActiveNav(href.replace('#', ''));
      });
    });
  }

  /* =======================================================
     6. ACTIVE NAV ON SCROLL
     ======================================================= */
  function updateActiveNav(sectionId) {
    $$('.nav-link').forEach(link => {
      const matches = link.dataset.page === sectionId;
      link.classList.toggle('active', matches);
    });
  }

  function initActiveNavOnScroll() {
    const sections = NAV_SECTIONS
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          updateActiveNav(visible[0].target.id);
        }
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    sections.forEach(s => observer.observe(s));
  }

  /* =======================================================
     7. HEADER SHADOW ON SCROLL
     ======================================================= */
  function initHeaderShadow() {
    const header = $('#siteHeader');
    if (!header) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =======================================================
     8. BACK TO TOP BUTTON
     ======================================================= */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 600);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  }

  /* =======================================================
     9. SCROLL REVEAL
     ======================================================= */
  function initScrollReveal() {
    if (prefersReducedMotion()) return;
    if (!('IntersectionObserver' in window)) return;

    const selectors = [
      '.section-head',
      '.vm-big-card',
      '.goal-card',
      '.track-card',
      '.solution-card',
      '.experience-card',
      '.faq-item',
      '.contact-card',
      '.future-visual',
      '.future-content'
    ];

    const els = $$(selectors.join(','));
    if (!els.length) return;

    els.forEach((el, i) => {
      el.classList.add('reveal');
      const delay = Math.min((i % 4) * 80, 240);
      el.style.transitionDelay = delay + 'ms';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach(el => observer.observe(el));
  }

  /* =======================================================
     10. FAQ ACCORDION
     ======================================================= */
  function initFAQ() {
    const items = $$('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        // Close others (accordion behavior)
        items.forEach(other => {
          if (other !== item && other.open) {
            other.open = false;
          }
        });
      });
    });
  }

  /* =======================================================
     11. CONTACT FORM
     ======================================================= */
  const FORM_LABELS = {
    ar: {
      subject: 'استفسار من موقع مدرسة الممارسة',
      name: 'الاسم',
      contact: 'وسيلة التواصل',
      interest: 'مهتم بـ',
      message: 'الرسالة',
      empty: '—',
      success: 'هنفتح لك تطبيق البريد الإلكتروني — أرسل الرسالة من هناك لإتمام التواصل.',
      error: 'الرجاء تعبئة جميع الحقول المطلوبة.'
    },
    en: {
      subject: 'Inquiry from School of Practice website',
      name: 'Name',
      contact: 'Contact',
      interest: 'Interested in',
      message: 'Message',
      empty: '—',
      success: 'We will open your email app — send the message from there to complete your inquiry.',
      error: 'Please fill in all required fields.'
    }
  };

  const INTEREST_LABELS = {
    coding:  { ar: 'مسار البرمجة وصناعة الألعاب', en: 'Coding & Game Development track' },
    ai:      { ar: 'مسار الذكاء الاصطناعي ومهندسة الأوامر', en: 'AI & Prompt Engineering track' },
    english: { ar: 'مسار الإنجليزية التقنية والتواصل', en: 'English for Tech & Communication track' },
    solutions: { ar: 'الحلول المؤسسية (مدارس/منظمات)', en: 'Institutional Solutions (schools/orgs)' },
    other:   { ar: 'استفسار آخر', en: 'Other inquiry' }
  };

  // 🔴 استبدل: الإيميل الفعلي
  const TO_EMAIL = 'sop.practice.1@gmail.com';

  let lastFormStatusKey = null; // 'success' | 'error' | null

  function updateFormStatusLang(lang) {
    const status = $('#formStatus');
    if (!status || status.hidden) return;
    if (!lastFormStatusKey) return;
    const L = FORM_LABELS[lang];
    status.textContent = lastFormStatusKey === 'success' ? L.success : L.error;
  }

  function initContactForm() {
    const form = $('#contactForm');
    const status = $('#formStatus');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = ($('#cf-name')?.value || '').trim();
      const contact = ($('#cf-contact')?.value || '').trim();
      const interest= ($('#cf-interest')?.value || '').trim();
      const message = ($('#cf-message')?.value || '').trim();

      const L = FORM_LABELS[currentLang];

      // Basic validation
      if (!name || !contact || !message) {
        if (status) {
          status.hidden = false;
          lastFormStatusKey = 'error';
          status.textContent = L.error;
          status.style.background = 'rgba(220,53,69,.1)';
          status.style.color = '#B02A37';
        }
        return;
      }

      const interestText = INTEREST_LABELS[interest]
        ? INTEREST_LABELS[interest][currentLang]
        : L.empty;

      const bodyLines = [
        `${L.name}: ${name}`,
        `${L.contact}: ${contact}`,
        `${L.interest}: ${interestText}`,
        '',
        `${L.message}:`,
        message
      ];
      const body = bodyLines.join('\n');

      const mailto = `mailto:${TO_EMAIL}`
        + `?subject=${encodeURIComponent(L.subject)}`
        + `&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;

      if (status) {
        status.hidden = false;
        lastFormStatusKey = 'success';
        status.textContent = L.success;
        status.style.background = '';
        status.style.color = '';
      }
    });
  }

  /* =======================================================
     12. DYNAMIC YEAR
     ======================================================= */
  function initYear() {
    const year = new Date().getFullYear();
    const y1 = $('#year');
    const y2 = $('#year-en');
    if (y1) y1.textContent = year;
    if (y2) y2.textContent = year;
  }

  /* =======================================================
     13. LAZY LOADING FALLBACK
     ======================================================= */
  function initLazyFallback() {
    if ('loading' in HTMLImageElement.prototype) return;
    $$('img[loading="lazy"]').forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
    });
  }

  /* =======================================================
     14. EXTERNAL LINK SAFETY
     ======================================================= */
  function initExternalLinks() {
    $$('a[target="_blank"]').forEach(link => {
      const rel = link.getAttribute('rel') || '';
      if (!rel.includes('noopener')) {
        link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
      }
    });
  }

  /* =======================================================
     15. INIT ALL
     ======================================================= */
  function init() {
    // Language first
    initLanguage();

    const langBtn = $('#langToggle');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);

    // UI behaviors
    initMobileNav();
    initSmoothScroll();
    initActiveNavOnScroll();
    initHeaderShadow();
    initBackToTop();
    initScrollReveal();
    initFAQ();
    initContactForm();
    initYear();
    initLazyFallback();
    initExternalLinks();

    // Hash navigation on back/forward
    window.addEventListener('hashchange', () => {
      const hash = (location.hash || '').replace('#', '');
      if (hash) updateActiveNav(hash);
    });

    // Deep link on load
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          const headerOffset = 80;
          const targetY = target.getBoundingClientRect().top
                        + window.pageYOffset
                        - headerOffset;
          window.scrollTo({ top: targetY, behavior: 'auto' });
        }, 100);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();