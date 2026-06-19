(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length) {
            var index = 0;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
                var target = slides[index].getAttribute('data-hero-target');
                var title = slides[index].getAttribute('data-hero-title');
                var desc = slides[index].getAttribute('data-hero-desc');
                var meta = slides[index].getAttribute('data-hero-meta');
                var titleEl = document.querySelector('[data-hero-title-text]');
                var descEl = document.querySelector('[data-hero-desc-text]');
                var metaEl = document.querySelector('[data-hero-meta-text]');
                var linkEl = document.querySelector('[data-hero-link]');
                if (titleEl) titleEl.textContent = title || '';
                if (descEl) descEl.textContent = desc || '';
                if (metaEl) metaEl.textContent = meta || '';
                if (linkEl && target) linkEl.setAttribute('href', target);
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                });
            });
            show(0);
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        filterRoots.forEach(function (root) {
            var input = root.querySelector('[data-search-input]');
            var typeSelect = root.querySelector('[data-type-select]');
            var yearSelect = root.querySelector('[data-year-select]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
            var empty = root.querySelector('[data-empty-state]');

            var apply = function () {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var typeValue = typeSelect ? typeSelect.value : '';
                var yearValue = yearSelect ? yearSelect.value : '';
                var shown = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var type = card.getAttribute('data-type') || '';
                    var year = card.getAttribute('data-year') || '';
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) ok = false;
                    if (typeValue && type !== typeValue) ok = false;
                    if (yearValue && year !== yearValue) ok = false;
                    card.classList.toggle('hidden-card', !ok);
                    if (ok) shown += 1;
                });
                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            };

            if (input) input.addEventListener('input', apply);
            if (typeSelect) typeSelect.addEventListener('change', apply);
            if (yearSelect) yearSelect.addEventListener('change', apply);
            apply();
        });
    });
})();
