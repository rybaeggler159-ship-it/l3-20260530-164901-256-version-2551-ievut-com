function setupPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var hls = null;
    var ready = false;
    var pendingPlay = false;

    if (!video || !overlay || !config.source) {
        return;
    }

    var showError = function () {
        overlay.classList.remove('is-hidden');
        overlay.innerHTML = '<span class="play-ring">▶</span><strong>播放暂时不可用，请刷新重试</strong>';
    };

    var requestPlay = function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    };

    var init = function () {
        if (video.getAttribute('data-ready') === 'true') {
            return;
        }
        video.setAttribute('data-ready', 'true');
        video.poster = config.poster;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.source;
            video.addEventListener('loadedmetadata', function () {
                ready = true;
                if (pendingPlay) {
                    requestPlay();
                }
            }, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(config.source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
                if (pendingPlay) {
                    requestPlay();
                }
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                showError();
            });
            return;
        }

        showError();
    };

    var start = function () {
        pendingPlay = true;
        overlay.classList.add('is-hidden');
        init();
        if (ready) {
            requestPlay();
        }
    };

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    init();
}
