document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var startTimer = function () {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 4800);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(dotIndex);
                startTimer();
            });
        });

        startTimer();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
        }

        var runFilter = function () {
            var text = searchInput.value.trim().toLowerCase();
            var filters = {};
            filterSelects.forEach(function (select) {
                filters[select.getAttribute('data-filter-select')] = select.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var matched = true;
                var searchBlob = card.getAttribute('data-search') || '';
                if (text && searchBlob.indexOf(text) === -1) {
                    matched = false;
                }
                Object.keys(filters).forEach(function (key) {
                    if (!matched) {
                        return;
                    }
                    var value = filters[key];
                    if (value && (card.getAttribute('data-' + key) || '') !== value) {
                        matched = false;
                    }
                });
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        };

        searchInput.addEventListener('input', runFilter);
        filterSelects.forEach(function (select) {
            select.addEventListener('change', runFilter);
        });
        runFilter();
    }
});
