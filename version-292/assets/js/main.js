(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-target'));
        showSlide(target);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search]')).forEach(function (panel) {
    var input = panel.querySelector('input[type="search"]');
    var scope = panel.parentElement.querySelector('[data-card-scope]') || document.querySelector('[data-card-scope]');

    if (!input || !scope) {
      return;
    }

    var items = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row, .category-card'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();

      items.forEach(function (item) {
        var text = (item.textContent + ' ' + Array.prototype.slice.call(item.attributes).map(function (attr) {
          return attr.value;
        }).join(' ')).toLowerCase();

        item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  });
})();
