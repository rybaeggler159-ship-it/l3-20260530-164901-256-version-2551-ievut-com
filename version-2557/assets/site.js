const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
        mainNav.classList.toggle('is-open');
    });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
    if (!slides.length) {
        return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
}

function startHeroCarousel() {
    if (slides.length < 2) {
        return;
    }

    heroTimer = window.setInterval(function() {
        showHeroSlide(heroIndex + 1);
    }, 5200);
}

dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }

        showHeroSlide(index);
        startHeroCarousel();
    });
});

showHeroSlide(0);
startHeroCarousel();

const pageFilter = document.querySelector('[data-page-filter]');
const cardList = document.querySelector('[data-card-list]');

if (pageFilter && cardList) {
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));

    pageFilter.addEventListener('input', function() {
        const keyword = pageFilter.value.trim().toLowerCase();

        cards.forEach(function(card) {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(keyword) ? '' : 'none';
        });
    });
}

if (window.SEARCH_MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-input]');
    const title = document.querySelector('[data-search-title]');
    const results = document.querySelector('[data-search-results]');

    if (input) {
        input.value = keyword;
    }

    function renderSearch(value) {
        const term = value.trim().toLowerCase();
        const matched = window.SEARCH_MOVIES.filter(function(movie) {
            if (!term) {
                return true;
            }

            return movie.searchText.includes(term);
        }).slice(0, 160);

        if (title) {
            title.textContent = term ? '搜索结果：' + value : '最新影片';
        }

        if (results) {
            results.innerHTML = matched.map(function(movie) {
                return '<article class="movie-card">' +
                    '<a href="' + movie.file + '" class="poster-link" aria-label="' + movie.title + '">' +
                    '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">' +
                    '<span class="play-mark">▶</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<h3><a href="' + movie.file + '">' + movie.title + '</a></h3>' +
                    '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
                    '<p>' + movie.oneLine + '</p>' +
                    '<div class="tag-row">' + movie.tags.map(function(tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }
    }

    renderSearch(keyword);
}
