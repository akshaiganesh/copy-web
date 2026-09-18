(() => {
  'use strict';

  const ready = new Promise((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', resolve, { once: true });
  });

  const onIdle = (cb) => {
    if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 1200 });
    else setTimeout(cb, 60);
  };

  function setupStaggerAnimations() {
    const staggerEls = document.querySelectorAll('.hero-stagger');
    staggerEls.forEach((el, idx) => {
      const stagger = Number(el.style.getPropertyValue('--stagger') || idx);
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transitionProperty = 'opacity, transform';
      el.style.transitionDuration = '900ms';
      el.style.transitionTimingFunction = 'cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transitionDelay = `${80 + stagger * 110}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }

  function setupNavbarScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let lastY = 0;
    const update = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(1, Math.max(0, y / 120));
      if (progress > 0.05) {
        header.style.backgroundColor = 'rgba(26, 21, 16, 0.82)';
        header.style.backdropFilter = 'blur(14px) saturate(140%)';
        header.style.webkitBackdropFilter = 'blur(14px) saturate(140%)';
        header.style.borderColor = 'rgba(232, 231, 230, 0.08)';
        header.style.boxShadow = '0 1px 0 0 rgba(255, 255, 255, 0.05)';
      } else {
        header.style.backgroundColor = 'transparent';
        header.style.backdropFilter = 'none';
        header.style.webkitBackdropFilter = 'none';
        header.style.borderColor = 'rgba(232, 231, 230, 0)';
        header.style.boxShadow = '0 1px 0 0 rgba(255, 255, 255, 0)';
      }
      lastY = y;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  function setupHeroScrollBlur() {
    const blurEl = document.querySelector('.hero-scroll-blur');
    const hero = document.getElementById('site-hero');
    if (!hero) return;
    const update = () => {
      const y = window.scrollY || 0;
      const maxBlur = 18;
      const progress = Math.min(1, Math.max(0, y / 520));
      const blurAmount = progress * maxBlur;
      const fade = Math.min(1, progress * 1.2);
      if (blurEl) {
        blurEl.style.position = 'absolute';
        blurEl.style.inset = '0';
        blurEl.style.backdropFilter = `blur(${blurAmount}px) saturate(120%)`;
        blurEl.style.webkitBackdropFilter = `blur(${blurAmount}px) saturate(120%)`;
        blurEl.style.background = `linear-gradient(to bottom, rgba(26,21,16,${0.32 * fade}) 0%, rgba(26,21,16,${0.72 * fade}) 100%)`;
        blurEl.style.pointerEvents = 'none';
        blurEl.style.zIndex = '5';
      }
      document.documentElement.style.setProperty('--hero-blur', `${blurAmount}px`);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function setupHeroNotifications() {
    const stack = document.querySelector('.hero-notif-stack-list');
    if (!stack) return;
    const notifs = [
      {
        title: 'Task completed',
        subtitle: 'Incorporate LLC',
        status: 'success',
        delay: 0
      },
      {
        title: 'Agent working',
        subtitle: 'Building website',
        status: 'running',
        delay: 1200
      },
      {
        title: 'Approval needed',
        subtitle: 'Review brand spec',
        status: 'review',
        delay: 2400
      }
    ];

    stack.style.position = 'relative';
    stack.style.width = '320px';
    stack.style.height = 'auto';
    stack.style.perspective = 'var(--notif-perspective, 300px)';

    notifs.forEach((n, i) => {
      setTimeout(() => {
        const card = document.createElement('div');
        const tints = {
          success: '#DFF5FF',
          running: '#EAF9E2',
          review: '#FBEEEA'
        };
        const dots = {
          success: '#1A6FD1',
          running: '#8CCF70',
          review: '#D96D62'
        };
        card.className = 'hero-notif-card';
        card.style.cssText = `
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 10px;
          background: linear-gradient(135deg, rgba(251,251,248,0.92) 0%, rgba(245,245,242,0.88) 100%);
          backdrop-filter: blur(var(--notif-glass-blur, 16px)) saturate(var(--notif-glass-saturation, 1.19));
          -webkit-backdrop-filter: blur(var(--notif-glass-blur, 16px)) saturate(var(--notif-glass-saturation, 1.19));
          border: 0.6px solid rgba(32,32,32,0.08);
          border-radius: 10px;
          box-shadow: 0 18px 38px -6px rgba(0,0,0,0.14), 0 2px 0 0 rgba(255,255,255,0.6) inset, 0 -1px 0 0 rgba(0,0,0,0.05) inset;
          transform: translate3d(0, 0, 0) rotateY(-12deg) rotateX(-2deg);
          opacity: 0;
          animation: heroNotifIn 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards, heroNotifFloat 6s ease-in-out ${1200 + i * 400}ms infinite;
          transform-origin: center;
        `;
        const dot = document.createElement('div');
        dot.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${dots[n.status]};
          flex-shrink: 0;
          box-shadow: 0 0 0 3px ${tints[n.status]};
        `;
        const texts = document.createElement('div');
        texts.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        `;
        const title = document.createElement('div');
        title.textContent = n.title;
        title.style.cssText = `
          font-family: var(--font-neoris), "TT Neoris Trial Variable", sans-serif;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.15;
          color: rgba(32,32,32,0.92);
          letter-spacing: 0.1px;
        `;
        const sub = document.createElement('div');
        sub.textContent = n.subtitle;
        sub.style.cssText = `
          font-family: var(--font-mono), "IBM Plex Mono", monospace;
          font-size: 10.5px;
          line-height: 1.2;
          color: rgba(32,32,32,0.52);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0;
        `;
        texts.appendChild(title);
        texts.appendChild(sub);
        card.appendChild(dot);
        card.appendChild(texts);
        stack.appendChild(card);
      }, n.delay);
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes heroNotifIn {
        0% { opacity: 0; transform: translate3d(30px, 10px, 0) rotateY(-16deg) rotateX(-6deg) scale(0.94); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) rotateY(var(--notif-rotate-y, -12deg)) rotateX(var(--notif-rotate-x, -2deg)) scale(var(--notif-scale, 0.88)); }
      }
      @keyframes heroNotifFloat {
        0%, 100% { transform: translate3d(0, 0, 0) rotateY(-12deg) rotateX(-2deg) scale(0.88); }
        50% { transform: translate3d(-3px, -4px, 0) rotateY(-10deg) rotateX(-1deg) scale(0.895); }
      }
    `;
    document.head.appendChild(style);
  }

  function setupScrollReveals() {
    const revealSelectors = [
      '#social-proof > div',
      '#social-proof > p',
      '#section-2-start + div > h2',
      '.orch-frame',
      'article',
      '#how-to-guides > div > h2',
      '#how-to-guides > div > p',
      '#features-carousel > div > h2',
      '#features-carousel > div > p',
      '#industries > h3',
      '#industries > p',
      'footer > h2'
    ];
    const candidates = document.querySelectorAll(revealSelectors.join(','));
    if (!('IntersectionObserver' in window) || candidates.length === 0) {
      candidates.forEach((el) => { el.style.opacity = '1'; });
      return;
    }
    candidates.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transitionProperty = 'opacity, transform';
      el.style.transitionDuration = '820ms';
      el.style.transitionTimingFunction = 'cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transitionDelay = `${(i % 4) * 90}ms`;
      el.style.willChange = 'opacity, transform';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    candidates.forEach((el) => io.observe(el));
  }

  function setupCloudDrift() {
    const left = document.querySelector('img[src*="clouds-left"]');
    const right = document.querySelector('img[src*="clouds-right"]');
    [left, right].forEach((img, idx) => {
      if (!img) return;
      img.style.willChange = 'transform';
      img.style.animation = idx === 0
        ? 'cloudDriftLeft 22s ease-in-out infinite alternate'
        : 'cloudDriftRight 26s ease-in-out infinite alternate';
    });
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cloudDriftLeft {
        0% { transform: translateX(-8px) translateY(0); }
        100% { transform: translateX(16px) translateY(-6px); }
      }
      @keyframes cloudDriftRight {
        0% { transform: translateX(8px) translateY(0); }
        100% { transform: translateX(-16px) translateY(4px); }
      }
    `;
    document.head.appendChild(style);
  }

  function setupGradientText() {
    const els = document.querySelectorAll('.hero-gradient-text');
    els.forEach((el) => {
      el.style.background = 'linear-gradient(-10deg, #FFE8B5 0%, #FFFAF0 25%, #FFFFFF 50%, #F0E4C8 75%, #FFE8B5 100%)';
      el.style.backgroundSize = '300% 300%';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.color = 'transparent';
      el.style.animation = 'gradientShift 6.5s ease-in-out infinite';
    });
    if (!document.getElementById('gradient-shift-style')) {
      const s = document.createElement('style');
      s.id = 'gradient-shift-style';
      s.textContent = `
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `;
      document.head.appendChild(s);
    }
  }

  function setupShimmerText() {
    const els = document.querySelectorAll('.shimmer');
    els.forEach((el) => {
      el.style.background = 'linear-gradient(90deg, rgba(38,35,35,0.4) 0%, rgba(38,35,35,0.8) 45%, rgba(38,35,35,0.4) 90%)';
      el.style.backgroundSize = '220% 100%';
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.color = 'transparent';
      el.style.animation = 'shimmerSweep 3.4s linear infinite';
    });
    if (!document.getElementById('shimmer-style')) {
      const s = document.createElement('style');
      s.id = 'shimmer-style';
      s.textContent = `
        @keyframes shimmerSweep {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `;
      document.head.appendChild(s);
    }
  }

  function setupDecorativeImages() {
    const replacements = [
      { find: '/build-ui-bits/carousel-top.png', replaceWith: '/build-ui-bits/carousel-top.svg' },
      { find: '/build-ui-bits/carousel-top-big.png', replaceWith: '/build-ui-bits/carousel-top.svg' },
      { find: '/build-ui-bits/carousel-bottom.png', replaceWith: '/build-ui-bits/carousel-bottom.svg' },
      { find: '/build-ui-bits/carousel-bottom-1000.png', replaceWith: '/build-ui-bits/carousel-bottom.svg' },
      { find: '/build-ui-bits/carousel-bottom-big.png', replaceWith: '/build-ui-bits/carousel-bottom.svg' },
      { find: '/build-ui-bits/carousel-bottom-mobile.png', replaceWith: '/build-ui-bits/carousel-bottom.svg' },
      { find: '/build-ui-bits/right-top-decor.png', replaceWith: '/build-ui-bits/right-top-decor.svg' },
      { find: '/build-ui-bits/right-bottom-decor.png', replaceWith: '/build-ui-bits/right-bottom-decor.svg' },
      { find: '/build-ui-bits/right-small-decor.png', replaceWith: '/build-ui-bits/right-small-decor.svg' },
      { find: '/homepage/product-ui-1/col-bg.png', replaceWith: '/homepage/product-ui-1/col-bg.svg' },
      { find: '/homepage/product-ui-1/icon-bank.png', replaceWith: '/homepage/product-ui-1/icon-bank.svg' },
      { find: '/homepage/product-ui-1/icon-brand-spec.png', replaceWith: '/homepage/product-ui-1/icon-brand-spec.svg' },
      { find: '/homepage/product-ui-1/icon-buy-domain.png', replaceWith: '/homepage/product-ui-1/icon-buy-domain.svg' },
      { find: '/homepage/product-ui-1/icon-codebase.png', replaceWith: '/homepage/product-ui-1/icon-codebase.svg' },
      { find: '/homepage/product-ui-1/icon-company-name.png', replaceWith: '/homepage/product-ui-1/icon-company-name.svg' },
      { find: '/homepage/product-ui-1/icon-idea-new.png', replaceWith: '/homepage/product-ui-1/icon-idea-new.svg' },
      { find: '/homepage/product-ui-1/icon-llc.png', replaceWith: '/homepage/product-ui-1/icon-llc.svg' },
      { find: '/homepage/product-ui-1/icon-social-presence.png', replaceWith: '/homepage/product-ui-1/icon-social-presence.svg' }
    ];

    const repair = () => {
      document.querySelectorAll('img, source, [style*="url("]').forEach((node) => {
        if (node.tagName === 'IMG' || node.tagName === 'SOURCE') {
          const attrs = ['src', 'srcset'];
          attrs.forEach((attr) => {
            const val = node.getAttribute(attr) || '';
            if (!val) return;
            let newVal = val;
            replacements.forEach(({ find, replaceWith }) => {
              const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\//g, '\\/'), 'g');
              newVal = newVal.replace(re, replaceWith);
            });
            if (newVal !== val) {
              node.setAttribute(attr, newVal);
              if (attr === 'srcset') node.removeAttribute('srcset');
            }
          });
          if (node.dataset && !node.dataset.customDecorFixed) {
            const src = node.getAttribute('src') || '';
            let found = null;
            for (const { find, replaceWith } of replacements) {
              if (src.includes(find)) { found = { find, replaceWith }; break; }
            }
            if (found) {
              node.dataset.customDecorFixed = 'true';
              node.loading = 'eager';
              node.removeAttribute('srcset');
              node.setAttribute('src', node.getAttribute('src').replace(found.find, found.replaceWith));
            }
          }
        }
      });
    };
    repair();
    const mo = new MutationObserver(() => onIdle(repair));
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(repair, 150);
    setTimeout(repair, 800);
    setTimeout(repair, 2400);
  }

  function setupHeroPixelBg() {
    const hero = document.getElementById('site-hero');
    if (!hero) return;
    hero.classList.add('pixel-bg-hero');
  }

  function setupMobileMenu() {
    const btn = document.querySelector('button[aria-label="Open menu"]');
    if (!btn) return;
    let open = false;
    const toggle = () => {
      open = !open;
      btn.setAttribute('aria-expanded', String(open));
      const spans = btn.querySelectorAll('span.absolute.block');
      if (spans.length === 3) {
        if (open) {
          spans[0].style.transform = 'translateY(0) rotate(45deg)';
          spans[1].style.opacity = '0';
          spans[1].style.transform = 'scaleX(0)';
          spans[2].style.transform = 'translateY(0) rotate(-45deg)';
        } else {
          spans[0].style.transform = 'translateY(-5px) rotate(0deg)';
          spans[1].style.opacity = '1';
          spans[1].style.transform = 'scaleX(1)';
          spans[2].style.transform = 'translateY(5px) rotate(0deg)';
        }
      }
    };
    btn.addEventListener('click', toggle);
  }

  ready.then(() => {
    setupDecorativeImages();
    setupHeroPixelBg();
    setupGradientText();
    setupShimmerText();
    setupStaggerAnimations();
    setupNavbarScroll();
    setupHeroScrollBlur();
    setupHeroNotifications();
    setupCloudDrift();
    setupMobileMenu();
    onIdle(setupScrollReveals);
  });
})();
