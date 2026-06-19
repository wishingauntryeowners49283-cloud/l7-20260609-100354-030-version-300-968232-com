(function () {
  const header = document.querySelector('[data-header]');
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    uniqueSorted(values).forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('.js-card'));

    fillSelect(yearSelect, cards.map(function (card) { return card.dataset.year; }));
    fillSelect(typeSelect, cards.map(function (card) { return card.dataset.type; }));

    function applyFilters() {
      const keyword = normalize(input && input.value);
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.category,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesYear = !year || card.dataset.year === year;
        const matchesType = !type || card.dataset.type === type;
        const shouldShow = matchesKeyword && matchesYear && matchesType;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      let empty = document.querySelector('[data-filter-empty]');
      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.dataset.filterEmpty = 'true';
          empty.textContent = '没有找到匹配影片，请更换关键词或筛选条件。';
          const results = document.querySelector('[data-filter-results]');
          if (results) {
            results.after(empty);
          }
        }
      } else if (empty) {
        empty.remove();
      }
    }

    [input, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
  }

  function createResultCard(movie) {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = movie.url;
    link.innerHTML = [
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
        '<p>' + escapeHtml(movie.summary) + '</p>' +
        '<span>' + escapeHtml([movie.year, movie.region, movie.type, movie.genre, movie.category].filter(Boolean).join(' · ')) + '</span></span>'
    ].join('');
    return link;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const globalResults = document.querySelector('[data-global-results]');
  if (globalResults && Array.isArray(window.MOVIE_INDEX)) {
    const input = document.querySelector('[data-global-search]');
    const categorySelect = document.querySelector('[data-global-category]');
    const yearSelect = document.querySelector('[data-global-year]');
    const typeSelect = document.querySelector('[data-global-type]');
    const data = window.MOVIE_INDEX;
    const query = new URLSearchParams(window.location.search).get('q') || '';

    fillSelect(categorySelect, data.map(function (movie) { return movie.category; }));
    fillSelect(yearSelect, data.map(function (movie) { return movie.year; }));
    fillSelect(typeSelect, data.map(function (movie) { return movie.type; }));

    if (input) {
      input.value = query;
    }

    function renderSearch() {
      const keyword = normalize(input && input.value);
      const category = categorySelect ? categorySelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';

      const matches = data.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.summary,
          movie.tags,
          movie.genre,
          movie.region,
          movie.type,
          movie.category,
          movie.year
        ].join(' '));
        return (!keyword || haystack.includes(keyword)) &&
          (!category || movie.category === category) &&
          (!year || movie.year === year) &&
          (!type || movie.type === type);
      }).slice(0, 120);

      globalResults.innerHTML = '';
      if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配影片，请更换关键词或筛选条件。';
        globalResults.appendChild(empty);
        return;
      }

      matches.forEach(function (movie) {
        globalResults.appendChild(createResultCard(movie));
      });
    }

    [input, categorySelect, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', renderSearch);
        element.addEventListener('change', renderSearch);
      }
    });

    renderSearch();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const message = player.querySelector('[data-player-message]');

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      const source = video.dataset.src;
      if (!source) {
        setMessage('播放源暂不可用。');
        return;
      }

      player.classList.add('is-playing');
      setMessage('');

      const nativeHls = video.canPlayType('application/vnd.apple.mpegurl');
      if (nativeHls) {
        if (!video.src) {
          video.src = source;
        }
        video.play().catch(function () {
          setMessage('请再次点击播放按钮开始播放。');
          player.classList.remove('is-playing');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (video.__hlsInstance) {
          video.__hlsInstance.destroy();
        }
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        video.__hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('请再次点击播放按钮开始播放。');
            player.classList.remove('is-playing');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放加载失败，请刷新页面后重试。');
          }
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {
        setMessage('当前浏览器暂不支持此播放源。');
        player.classList.remove('is-playing');
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }
  });
})();
