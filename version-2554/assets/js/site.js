(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mainNav = document.querySelector(".main-nav");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
    }

    document.querySelectorAll(".dropdown-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            var parent = button.closest(".nav-dropdown");
            if (parent) {
                parent.classList.toggle("open");
            }
        });
    });

    var hero = document.querySelector("[data-hero-carousel]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function showSlide(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5800);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var searchInput = document.querySelector(".movie-search");
    var filters = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
        ].join(" "));
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? normalize(searchInput.value) : "";
        var selected = {};

        filters.forEach(function (select) {
            selected[select.getAttribute("data-filter")] = normalize(select.value);
        });

        cards.forEach(function (card) {
            var text = cardText(card);
            var visible = !query || text.indexOf(query) !== -1;

            Object.keys(selected).forEach(function (key) {
                var value = selected[key];
                if (value && normalize(card.getAttribute("data-" + key)).indexOf(value) === -1) {
                    visible = false;
                }
            });

            card.classList.toggle("is-hidden", !visible);
        });
    }

    if (searchInput || filters.length) {
        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }
        filters.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        var params = new URLSearchParams(location.search);
        var initialQuery = params.get("q");
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }
        applyFilters();
    }
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    var hls = null;
    var ready = false;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function beginPlay() {
        attachStream();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", beginPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlay();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("ended", function () {
        if (hls) {
            hls.stopLoad();
        }
    });
}
