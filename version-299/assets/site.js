(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

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
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var dotIndex = Number(dot.getAttribute("data-hero-dot") || 0);
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);

        show(0);
        start();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

        roots.forEach(function (root) {
            var container = root.parentElement || document;
            var searchInput = root.querySelector("[data-filter-search]");
            var typeSelect = root.querySelector("[data-filter-type]");
            var yearSelect = root.querySelector("[data-filter-year]");
            var empty = root.querySelector("[data-filter-empty]");
            var cards = Array.prototype.slice.call(container.querySelectorAll(".searchable-card"));

            function cardMatches(card) {
                var query = normalize(searchInput ? searchInput.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var title = normalize(card.getAttribute("data-title"));
                var region = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = Number(card.getAttribute("data-year") || 0);
                var keywords = normalize(card.getAttribute("data-keywords"));
                var queryText = [title, region, cardType, cardYear, keywords].join(" ");

                if (query && queryText.indexOf(query) === -1) {
                    return false;
                }

                if (type) {
                    if (type === "剧") {
                        if (cardType.indexOf("剧") === -1 && cardType.indexOf("短剧") === -1) {
                            return false;
                        }
                    } else if (cardType.indexOf(type) === -1 && keywords.indexOf(type) === -1) {
                        return false;
                    }
                }

                if (year) {
                    if (year === "older") {
                        if (cardYear >= 2023) {
                            return false;
                        }
                    } else if (cardYear !== Number(year)) {
                        return false;
                    }
                }

                return true;
            }

            function update() {
                var visible = 0;

                cards.forEach(function (card) {
                    var matches = cardMatches(card);
                    card.classList.toggle("is-hidden-card", !matches);
                    if (matches) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [searchInput, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", update);
                    control.addEventListener("change", update);
                }
            });

            update();
        });
    }

    function setupImageFallback() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img"));

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                var frame = image.closest(".poster-frame, .hero-poster, .overview-cover, .detail-poster");
                if (frame) {
                    frame.classList.add("no-image");
                }
            }, { once: true });
        });
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector("script[data-hls-loader]");

        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            existing.addEventListener("error", callback, { once: true });
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        script.addEventListener("error", callback, { once: true });
        document.head.appendChild(script);
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-button]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-src");
            var hlsInstance = null;
            var initialized = false;

            if (!video || !source) {
                return;
            }

            function setStatus(message, isError) {
                if (!status) {
                    return;
                }

                status.textContent = message;
                status.classList.toggle("is-error", Boolean(isError));
            }

            function hideOverlay() {
                if (button) {
                    button.classList.add("is-hidden");
                }
            }

            function initializePlayer() {
                if (initialized) {
                    return Promise.resolve();
                }

                initialized = true;
                setStatus("正在加载播放源…", false);

                return new Promise(function (resolve) {
                    var canPlayNative = video.canPlayType("application/vnd.apple.mpegurl");

                    if (canPlayNative) {
                        video.src = source;
                        setStatus("播放源已就绪", false);
                        resolve();
                        return;
                    }

                    loadHlsLibrary(function () {
                        if (window.Hls && window.Hls.isSupported()) {
                            hlsInstance = new window.Hls({
                                enableWorker: true,
                                lowLatencyMode: true
                            });

                            hlsInstance.loadSource(source);
                            hlsInstance.attachMedia(video);

                            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                                setStatus("播放源已就绪", false);
                                resolve();
                            });

                            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                                if (!data || !data.fatal) {
                                    return;
                                }

                                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                    setStatus("网络加载异常，正在重试…", true);
                                    hlsInstance.startLoad();
                                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                    setStatus("媒体解析异常，正在恢复…", true);
                                    hlsInstance.recoverMediaError();
                                } else {
                                    setStatus("播放源暂时无法加载", true);
                                    hlsInstance.destroy();
                                }
                            });
                        } else {
                            video.src = source;
                            setStatus("当前浏览器将使用原生播放方式", false);
                            resolve();
                        }
                    });
                });
            }

            function play() {
                initializePlayer().then(function () {
                    hideOverlay();

                    var playResult = video.play();

                    if (playResult && typeof playResult.catch === "function") {
                        playResult.catch(function () {
                            setStatus("请再次点击播放器开始播放", true);
                        });
                    }
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function () {
                hideOverlay();
                setStatus("正在播放", false);
            });

            video.addEventListener("pause", function () {
                setStatus("已暂停", false);
            });

            video.addEventListener("error", function () {
                setStatus("播放源暂时无法加载", true);
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHeroSlider();
        setupFilters();
        setupImageFallback();
        setupPlayers();
    });
})();
