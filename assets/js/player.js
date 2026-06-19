(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function attachSource(video, source) {
    if (!video || !source || video.getAttribute("data-ready") === "1") {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }

    video.setAttribute("data-ready", "1");
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var source = player.getAttribute("data-video-src") || (video && video.getAttribute("data-src"));

      function playVideo() {
        attachSource(video, source);
        if (button) {
          button.style.display = "none";
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.style.display = "grid";
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.style.display = "none";
          }
        });
        video.addEventListener("pause", function () {
          if (button && !video.ended) {
            button.style.display = "grid";
          }
        });
      }
    });
  });
})();
