(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var src = player.getAttribute('data-video');
    var hlsInstance = null;
    var ready = false;

    function load() {
      if (!video || !src) {
        return;
      }

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        ready = true;
      }

      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    player.addEventListener('click', function (event) {
      if (event.target.closest('.player-start') || event.target === video) {
        load();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  players.forEach(bindPlayer);
})();
