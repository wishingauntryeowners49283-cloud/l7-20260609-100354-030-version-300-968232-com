(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');

        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var searchInput = document.querySelector('[data-page-search]');

        if (searchInput) {
            var searchable = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
            searchInput.addEventListener('input', function () {
                var value = searchInput.value.trim().toLowerCase();
                searchable.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                    item.classList.toggle('hidden-by-search', value && text.indexOf(value) === -1);
                });
            });
        }

        var video = document.querySelector('video[data-source]');

        if (video) {
            var source = video.getAttribute('data-source');
            var wrap = video.closest('.player-wrap');
            var button = document.querySelector('[data-play-button]');
            var loaded = false;

            function loadVideo() {
                if (loaded || !source) {
                    return;
                }

                loaded = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                loadVideo();
                if (wrap) {
                    wrap.classList.add('is-playing');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                if (wrap) {
                    wrap.classList.add('is-playing');
                }
            });
        }
    });
})();
