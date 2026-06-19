(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        if (slides.length === 0) {
            return;
        }

        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(panel.getAttribute("data-filter-target")));
            var count = panel.querySelector("[data-result-count]");
            var empty = document.querySelector(panel.getAttribute("data-empty-target"));

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var yearMatches = !year || card.getAttribute("data-year") === year;
                    var keywordMatches = !keyword || haystack.indexOf(keyword) !== -1;
                    var shouldShow = yearMatches && keywordMatches;
                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部";
                }
                if (empty) {
                    empty.style.display = visible === 0 ? "block" : "none";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector("[data-hls-video]");
        var playButton = document.querySelector("[data-play-button]");
        if (!video || !playButton) {
            return;
        }

        var source = video.getAttribute("data-src");
        var isLoaded = false;

        function loadVideo() {
            if (isLoaded || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            isLoaded = true;
        }

        playButton.addEventListener("click", function () {
            loadVideo();
            video.controls = true;
            var overlay = document.querySelector(".player-overlay");
            if (overlay) {
                overlay.style.display = "none";
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupPlayer();
    });
})();
