(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot'));
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function initFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        var list = document.querySelector('[data-card-list]');
        if (!scope || !list) {
            return;
        }
        var input = scope.querySelector('[data-card-search]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var typeSelect = scope.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function passYear(card, value) {
            if (!value) {
                return true;
            }
            var year = Number(card.getAttribute('data-year')) || 0;
            if (value === 'older') {
                return year < 2020;
            }
            return String(year) === value;
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
                var matchesYear = passYear(card, year);
                var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(normalize(type)) !== -1;
                var show = matchesQuery && matchesYear && matchesType;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initSearchForm() {
        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var message = shell.querySelector('[data-player-message]');
            var source = shell.getAttribute('data-src');
            var started = false;
            if (!video || !button || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function playVideo() {
                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.ERROR, function (_, data) {
                            if (data && data.fatal) {
                                setMessage('播放源加载异常，请刷新页面后重试。');
                            }
                        });
                    } else {
                        setMessage('当前浏览器暂不支持 HLS 播放。');
                        return;
                    }
                    started = true;
                }
                shell.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setMessage('请再次点击播放器开始播放。');
                    });
                }
            }

            button.addEventListener('click', playVideo);
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initSearchForm();
        initPlayers();
    });
})();
