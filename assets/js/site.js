(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var bg = hero.querySelector("[data-hero-bg]");
      var title = hero.querySelector("[data-hero-title]");
      var desc = hero.querySelector("[data-hero-desc]");
      var meta = hero.querySelector("[data-hero-meta]");
      var link = hero.querySelector("[data-hero-link]");
      var poster = hero.querySelector("[data-hero-poster]");
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function showSlide(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        var slide = slides[index];
        var image = slide.getAttribute("data-image");
        var href = slide.getAttribute("data-href");
        if (bg) {
          bg.style.backgroundImage = "url('" + image + "')";
        }
        if (poster) {
          poster.src = image;
          poster.alt = slide.getAttribute("data-title") || "";
        }
        if (title) {
          title.textContent = slide.getAttribute("data-title") || "";
        }
        if (desc) {
          desc.textContent = slide.getAttribute("data-desc") || "";
        }
        if (meta) {
          meta.textContent = slide.getAttribute("data-meta") || "";
        }
        if (link) {
          link.href = href || "#";
        }
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      showSlide(0);
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var searchForms = document.querySelectorAll("[data-global-search]");
    Array.prototype.forEach.call(searchForms, function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var q = encodeURIComponent(input ? input.value.trim() : "");
        window.location.href = form.getAttribute("data-target") + (q ? "?q=" + q : "");
      });
    });

    var filter = document.querySelector("[data-filter]");

    if (filter) {
      var input = filter.querySelector("[data-filter-keyword]");
      var type = filter.querySelector("[data-filter-type]");
      var year = filter.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (input && initial) {
        input.value = initial;
      }

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
      applyFilter();
    }
  });
})();
