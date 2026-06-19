(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function toggleNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var area = bar.closest("section") || document;
            var input = bar.querySelector("[data-filter-search]");
            var region = bar.querySelector("[data-filter-region]");
            var year = bar.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
            var empty = area.querySelector(".empty-state");

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function apply() {
                var q = valueOf(input);
                var regionValue = valueOf(region);
                var yearValue = valueOf(year);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();

                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (regionValue && (card.getAttribute("data-region") || "").toLowerCase().indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
        });
    }

    ready(function () {
        toggleNavigation();
        initHero();
        initFilters();
    });

    window.startMoviePlayback = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var layer = document.querySelector(".play-layer");
        if (!video || !streamUrl) {
            return;
        }

        var hlsInstance = null;
        var started = false;

        function begin() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", begin);
        }

        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
