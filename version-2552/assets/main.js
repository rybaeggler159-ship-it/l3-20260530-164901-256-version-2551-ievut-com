(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = selectAll('.hero-slide', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupGlobalSearch() {
    var form = document.querySelector('[data-global-search]');
    if (!form || !window.MOVIE_INDEX) {
      return;
    }
    var input = form.querySelector('input[type="search"]');
    var panel = form.querySelector('[data-search-panel]');
    if (!input || !panel) {
      return;
    }

    function render(items) {
      if (!items.length) {
        panel.innerHTML = '<div class="search-result"><span></span><span><strong>未找到相关影片</strong><em>换一个关键词试试</em></span></div>';
        panel.classList.add('is-open');
        return;
      }
      panel.innerHTML = items.slice(0, 10).map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="./' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong><em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</em></span>' +
          '</a>';
      }).join('');
      panel.classList.add('is-open');
    }

    function doSearch() {
      var keyword = normalize(input.value);
      if (!keyword) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return [];
      }
      var results = window.MOVIE_INDEX.filter(function (item) {
        return normalize(item.title + ' ' + item.region + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).indexOf(keyword) !== -1;
      });
      render(results);
      return results;
    }

    input.addEventListener('input', doSearch);
    input.addEventListener('focus', doSearch);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var results = doSearch();
      if (results.length) {
        window.location.href = results[0].url;
      }
    });
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupGridFilters() {
    var filterBar = document.querySelector('[data-card-filters]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!filterBar || !grid) {
      return;
    }
    var keywordInput = filterBar.querySelector('[data-filter-keyword]');
    var yearSelect = filterBar.querySelector('[data-filter-year]');
    var regionSelect = filterBar.querySelector('[data-filter-region]');
    var cards = selectAll('[data-movie-card]', grid);

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          ok = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }

    [keywordInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = player.getAttribute('data-src');
      var hlsInstance = null;
      if (!video || !button || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute('data-ready') === 'true') {
          return Promise.resolve();
        }
        video.setAttribute('data-ready', 'true');
        video.controls = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                } else {
                  hlsInstance.destroy();
                }
              }
            });
            window.setTimeout(resolve, 1200);
          });
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        video.src = source;
        return Promise.resolve();
      }

      function play() {
        attachSource().then(function () {
          button.classList.add('is-hidden');
          var result = video.play();
          if (result && result.catch) {
            result.catch(function () {
              button.classList.remove('is-hidden');
            });
          }
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime < 0.1) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupMobileNav();
  setupHeroCarousel();
  setupGlobalSearch();
  setupGridFilters();
  setupPlayers();
})();
