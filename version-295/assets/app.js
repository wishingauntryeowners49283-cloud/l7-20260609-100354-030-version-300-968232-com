
(function () {
  var ready = function (callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(function () {
    initMenu();
    initHero();
    initImages();
    initFilters();
    initPlayer();
  });

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-empty');
        img.removeAttribute('src');
      }, { once: true });
    });
  }

  function initFilters() {
    var grids = document.querySelectorAll('.filter-grid');
    if (!grids.length) {
      return;
    }
    var input = document.querySelector('.filter-input');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var sortSelect = document.querySelector('.sort-select');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }
    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        if (select.value) {
          filters[select.getAttribute('data-filter')] = select.value.toLowerCase();
        }
      });
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.filter-card'));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category')
          ].join(' ').toLowerCase();
          var matched = !query || haystack.indexOf(query) !== -1;
          Object.keys(filters).forEach(function (key) {
            var value = (card.getAttribute('data-' + key) || '').toLowerCase();
            if (value.indexOf(filters[key]) === -1) {
              matched = false;
            }
          });
          card.classList.toggle('is-hidden', !matched);
        });
        sortCards(grid);
      });
    };
    var sortCards = function (grid) {
      if (!sortSelect || sortSelect.value === 'default') {
        return;
      }
      var cards = Array.prototype.slice.call(grid.children);
      var key = sortSelect.value;
      cards.sort(function (a, b) {
        var av = Number(a.getAttribute('data-' + key) || 0);
        var bv = Number(b.getAttribute('data-' + key) || 0);
        return bv - av;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    if (sortSelect) {
      sortSelect.addEventListener('change', apply);
    }
    apply();
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var configNode = document.getElementById('player-config');
    if (!video || !overlay || !configNode) {
      return;
    }
    var config = {};
    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }
    var src = config.url;
    if (!src) {
      return;
    }
    var started = false;
    var play = function () {
      prepareVideo(video, src, function () {
        overlay.classList.add('is-hidden');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
    };
    overlay.addEventListener('click', function () {
      if (!started) {
        started = true;
      }
      play();
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  function prepareVideo(video, src, callback) {
    if (video.getAttribute('data-ready') === 'true') {
      callback();
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.setAttribute('data-ready', 'true');
      callback();
      return;
    }
    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute('data-ready', 'true');
          callback();
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (!video.src) {
            video.src = src;
          }
        });
      } else {
        video.src = src;
        video.setAttribute('data-ready', 'true');
        callback();
      }
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }
})();
