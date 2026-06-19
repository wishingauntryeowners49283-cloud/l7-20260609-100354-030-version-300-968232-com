(function () {
    function each(list, fn) {
        Array.prototype.forEach.call(list, fn);
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = root.querySelectorAll('[data-hero-slide]');
        var dots = root.querySelectorAll('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            each(slides, function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            each(dots, function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        each(dots, function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFilter() {
        var inputs = document.querySelectorAll('[data-filter-input]');
        each(inputs, function (input) {
            var scope = input.closest('section') || document;
            var cards = scope.querySelectorAll('[data-card]');
            var clear = scope.querySelector('[data-clear-search]');
            function apply() {
                var q = input.value.trim().toLowerCase();
                each(cards, function (card) {
                    var source = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-year') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-hidden', q && source.indexOf(q) === -1);
                });
            }
            input.addEventListener('input', apply);
            if (clear) {
                clear.addEventListener('click', function () {
                    input.value = '';
                    apply();
                    input.focus();
                });
            }
        });
    }

    function initPlayer() {
        var root = document.querySelector('[data-player]');
        if (!root) {
            return;
        }
        var video = root.querySelector('video');
        var play = root.querySelector('[data-play]');
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-src');
        var ready = false;
        var hlsInstance = null;
        function attach() {
            if (ready || !src) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }
        function start() {
            attach();
            if (play) {
                play.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }
        if (play) {
            play.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!ready) {
                attach();
            }
        });
        video.addEventListener('play', function () {
            if (play) {
                play.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilter();
        initPlayer();
    });
})();
