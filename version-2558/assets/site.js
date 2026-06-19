
(function () {
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const $ = (selector, root = document) => root.querySelector(selector);
  const debounce = (fn, delay = 120) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  };

  function initHeaderScroll() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const update = () => topbar.classList.toggle('scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initCarousel() {
    $$('[data-hero-carousel]').forEach((carousel) => {
      const slides = $$('[data-carousel-slide]', carousel);
      const dots = $$('[data-carousel-dot]', carousel);
      const prev = $('[data-carousel-prev]', carousel);
      const next = $('[data-carousel-next]', carousel);
      if (slides.length <= 1) return;
      let current = 0;
      let timer = null;

      const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
      };

      const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
      };
      const stop = () => {
        if (timer) window.clearInterval(timer);
        timer = null;
      };

      prev && prev.addEventListener('click', () => { show(current - 1); start(); });
      next && next.addEventListener('click', () => { show(current + 1); start(); });
      dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function renderSearchResults(panel, items) {
    if (!panel) return;
    if (!items.length) {
      panel.innerHTML = '<div class="search-empty">没有找到匹配内容，请尝试其他关键词。</div>';
      panel.classList.add('open');
      return;
    }
    const html = items.slice(0, 12).map((item) => `
      <a class="mini-card" href="${item.detail}">
        <img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div class="mini-copy">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml([item.year, item.genre, item.region].filter(Boolean).join(' · '))}</p>
          <p>${escapeHtml(item.oneLine || '')}</p>
        </div>
      </a>
    `).join('');
    panel.innerHTML = `<div class="mini-grid">${html}</div>`;
    panel.classList.add('open');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }

  function initGlobalSearch() {
    const index = Array.isArray(window.MOVIES_INDEX) ? window.MOVIES_INDEX : [];
    $$('[data-global-search]').forEach((input) => {
      const panel = document.querySelector(input.dataset.resultsTarget || '[data-search-results]');
      if (!panel) return;
      const run = debounce(() => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) {
          panel.classList.remove('open');
          panel.innerHTML = '';
          return;
        }
        const results = index.filter((item) => {
          const text = [item.title, item.year, item.genre, item.region, item.type, item.oneLine, item.tags].join(' ').toLowerCase();
          return text.includes(q);
        });
        renderSearchResults(panel, results);
      }, 80);
      input.addEventListener('input', run);
      input.addEventListener('focus', run);
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== input) panel.classList.remove('open');
      });
    });
  }

  function initLocalFilter() {
    $$('[data-filter-input]').forEach((input) => {
      const target = document.querySelector(input.dataset.filterTarget);
      if (!target) return;
      const cards = $$('[data-card]', target);
      const empty = target.querySelector('[data-empty-state]');
      const run = debounce(() => {
        const q = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const text = (card.dataset.search || card.textContent).toLowerCase();
          const show = !q || text.includes(q);
          card.style.display = show ? '' : 'none';
          if (show) visible += 1;
        });
        if (empty) empty.hidden = visible !== 0;
      }, 70);
      input.addEventListener('input', run);
      input.addEventListener('change', run);
      run();
    });
  }

  function initPlayer() {
    const player = document.querySelector('[data-hls-player]');
    if (!player) return;
    const shell = player.closest('.player');
    const playButton = document.querySelector('[data-play-toggle]');
    let loaded = false;
    let hlsInstance = null;
    const src = player.dataset.src;

    const load = () => {
      if (loaded || !src) return;
      loaded = true;
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(player);
      } else {
        player.src = src;
      }
      player.setAttribute('playsinline', 'playsinline');
      if (shell) shell.classList.add('is-playing');
    };

    const play = () => {
      load();
      const attempt = player.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
      if (shell) shell.classList.add('is-playing');
    };

    playButton && playButton.addEventListener('click', play);
    player.addEventListener('click', () => {
      if (player.paused) play();
      else player.pause();
    });
    player.addEventListener('play', () => shell && shell.classList.add('is-playing'));
    player.addEventListener('pause', () => shell && shell.classList.remove('is-playing'));
    window.addEventListener('beforeunload', () => {
      if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
    });
  }

  function initBackToTop() {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    const update = () => btn.classList.toggle('visible', window.scrollY > 600);
    update();
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  initHeaderScroll();
  initCarousel();
  initGlobalSearch();
  initLocalFilter();
  initPlayer();
  initBackToTop();
})();
