(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(next) {
            active = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("is-active", index === active);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("is-active", index === active);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                play();
            });
        });

        root.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        root.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".js-card-filter"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-card"));
            var queryName = panel.getAttribute("data-read-query");

            if (queryName && input) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(queryName);
                if (value) {
                    input.value = value;
                }
            }

            function update() {
                var text = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matched = true;
                    if (text && haystack.indexOf(text) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                });
            }

            if (input) {
                input.addEventListener("input", update);
            }
            if (year) {
                year.addEventListener("change", update);
            }
            if (type) {
                type.addEventListener("change", update);
            }
            update();
        });
    }

    function prepareVideo(video) {
        if (!video || video.getAttribute("data-ready") === "1") {
            return;
        }
        var source = video.getAttribute("data-stream");
        if (!source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = source;
        }
        video.setAttribute("data-ready", "1");
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            if (!video) {
                return;
            }

            function start() {
                prepareVideo(video);
                var promise = video.play();
                player.classList.add("is-playing");
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            function stopState() {
                if (video.paused || video.ended) {
                    player.classList.remove("is-playing");
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", stopState);
            video.addEventListener("ended", stopState);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
