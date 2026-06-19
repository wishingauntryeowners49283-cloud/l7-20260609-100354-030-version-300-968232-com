function initMoviePlayer(source) {
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('[data-play-cover]');
    var button = document.querySelector('[data-play-button]');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function startPlay() {
        loadSource();
        video.controls = true;
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var task = video.play();
        if (task && typeof task.catch === 'function') {
            task.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlay);
    }
    if (button) {
        button.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlay();
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
