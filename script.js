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
  const WEB3FORMS_KEY = '729b559c-af35-417e-a542-2d5ff12787fb';

  const FORM_LABELS = {
    ar: {
      submit: 'أرسل الرسالة',
      sending: 'جارٍ الإرسال...',
      success: 'وصلتنا رسالتك، وسنتواصل معك قريباً.',
      failure: 'تعذّر الإرسال. تأكد من اتصال الإنترنت وحاول مرة أخرى، أو راسلنا على واتساب.'
    },
    en: {
      submit: 'Send message',
      sending: 'Sending...',
      success: 'We got your message and will be in touch soon.',
      failure: 'Sending failed. Check your connection and try again, or message us on WhatsApp.'
    }
  };

  const INTEREST_LABELS = {
    coding:  { ar: 'مسار البرمجة وصناعة الألعاب', en: 'Coding & Game Development track' },
    ai:      { ar: 'مسار الذكاء الاصطناعي وهندسة الأوامر', en: 'AI & Prompt Engineering track' },
    english: { ar: 'مسار الإنجليزية التقنية والتواصل', en: 'English for Tech & Communication track' },
    other:   { ar: 'استفسار آخر', en: 'Other inquiry' }
  };

  let lastFormStatusKey = null;
  let isFormSubmitting = false;

  function updateFormStatusLang(lang) {
    const submitButton = $('#contactForm button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = isFormSubmitting;
      const arLabel = $('.ar', submitButton);
      const enLabel = $('.en', submitButton);
      if (arLabel) arLabel.textContent = isFormSubmitting ? FORM_LABELS.ar.sending : FORM_LABELS.ar.submit;
      if (enLabel) enLabel.textContent = isFormSubmitting ? FORM_LABELS.en.sending : FORM_LABELS.en.submit;
    }

    const status = $('#formStatus');
    const message = $('#formStatusMessage');
    if (!status || !message || !lastFormStatusKey) return;

    message.textContent = FORM_LABELS[lang][lastFormStatusKey];
    const whatsappLink = $('#formWhatsAppLink');
    if (whatsappLink) whatsappLink.hidden = false;
  }

  function setFormStatus(key) {
    const status = $('#formStatus');
    if (!status) return;

    lastFormStatusKey = key;
    status.dataset.state = key;
    status.hidden = false;
    updateFormStatusLang(currentLang);
  }

  function clearFormStatus() {
    const status = $('#formStatus');
    lastFormStatusKey = null;
    if (!status) return;

    status.hidden = true;
    delete status.dataset.state;
    const whatsappLink = $('#formWhatsAppLink');
    if (whatsappLink) whatsappLink.hidden = true;
  }

  function clearFormFieldError(input, error) {
    if (!input || !error) return;
    input.removeAttribute('aria-invalid');
    error.hidden = true;
  }

  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const nameInput = $('#cf-name', form);
    const contactInput = $('#cf-contact', form);
    const interestInput = $('#cf-interest', form);
    const messageInput = $('#cf-message', form);
    const consentInput = $('#cf-consent', form);
    const honeypotInput = $('#cf-botcheck', form);
    const requiredFields = [
      { input: nameInput, error: $('#cf-name-error', form), isMissing: () => !nameInput.value.trim() },
      { input: contactInput, error: $('#cf-contact-error', form), isMissing: () => !contactInput.value.trim() },
      { input: messageInput, error: $('#cf-message-error', form), isMissing: () => !messageInput.value.trim() },
      { input: consentInput, error: $('#cf-consent-error', form), isMissing: () => !consentInput.checked }
    ];

    requiredFields.forEach((field) => {
      const { input, error } = field;
      const eventName = input.type === 'checkbox' ? 'change' : 'input';
      input.addEventListener(eventName, () => {
        if (!field.isMissing()) clearFormFieldError(input, error);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isFormSubmitting) return;

      clearFormStatus();
      requiredFields.forEach(({ input, error }) => clearFormFieldError(input, error));

      const missingFields = requiredFields.filter(({ isMissing }) => isMissing());
      missingFields.forEach(({ input, error }) => {
        input.setAttribute('aria-invalid', 'true');
        error.hidden = false;
      });
      if (missingFields.length) {
        missingFields[0].input.focus();
        return;
      }

      const selectedOption = interestInput.options[interestInput.selectedIndex];
      const interestText = INTEREST_LABELS[interestInput.value]?.ar
        || selectedOption?.dataset.ar
        || '';
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: 'استفسار جديد من موقع مدرسة الممارسة',
        from_name: 'موقع مدرسة الممارسة',
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        interest: interestText,
        message: messageInput.value.trim(),
        botcheck: honeypotInput.value
      };
      if (payload.contact.includes('@')) payload.email = payload.contact;

      isFormSubmitting = true;
      updateFormStatusLang(currentLang);
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          setFormStatus('failure');
          return;
        }

        form.reset();
        requiredFields.forEach(({ input, error }) => clearFormFieldError(input, error));
        setFormStatus('success');
      } catch (error) {
        setFormStatus('failure');
      } finally {
        isFormSubmitting = false;
        updateFormStatusLang(currentLang);
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