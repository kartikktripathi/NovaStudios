/**
 * Nova Studios — Movies & TV Shows Category Filter
 * Re-binds filters dynamically on language selection to prevent node replacement race conditions.
 */

(function () {
    function initFilters() {
        var filterBar = document.querySelector('.filter-bar');
        var grid = document.querySelector('.card-grid-4, .card-grid');
        if (!filterBar || !grid) return;

        var buttons = filterBar.querySelectorAll('.filter-btn');
        var cards = grid.children;

        Array.prototype.forEach.call(buttons, function (btn) {
            // Clone the button to remove any existing event listeners before binding
            var newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', function () {
                var currentButtons = filterBar.querySelectorAll('.filter-btn');
                Array.prototype.forEach.call(currentButtons, function (b) {
                    b.classList.remove('active');
                });
                newBtn.classList.add('active');

                var selected = newBtn.textContent.trim().toLowerCase();
                var i18nKey = newBtn.getAttribute('data-i18n') || '';
                var isAll = i18nKey.endsWith('.all') || selected === 'all' || selected === 'todos';

                Array.prototype.forEach.call(cards, function (card) {
                    var genreEl = card.querySelector('.genre');
                    var genre = genreEl ? genreEl.textContent.trim().toLowerCase() : '';

                    // Fallback: extract genre from meta string "X Seasons • Genre • Rating"
                    if (!genre) {
                        var metaEl = card.querySelector('.show-meta');
                        if (metaEl) {
                            var parts = metaEl.textContent.split('•').map(function (s) {
                                return s.trim().toLowerCase();
                            });
                            genre = parts[1] || '';
                        }
                    }

                    // Translate common genre words between languages to match filter text
                    var normalizedGenre = genre;
                    if (selected === 'comedia' && genre === 'comedy') normalizedGenre = 'comedia';
                    if (selected === 'comedy' && genre === 'comedia') normalizedGenre = 'comedy';
                    if (selected === 'fantasía' && genre === 'fantasy') normalizedGenre = 'fantasía';
                    if (selected === 'fantasy' && genre === 'fantasía') normalizedGenre = 'fantasy';
                    if (selected === 'ciencia ficción' && genre === 'sci-fi') normalizedGenre = 'ciencia ficción';
                    if (selected === 'sci-fi' && (genre === 'ciencia ficción' || genre === 'ciencia-ficción')) normalizedGenre = 'sci-fi';
                    if (selected === 'documental' && genre === 'documentary') normalizedGenre = 'documental';
                    if (selected === 'documentary' && genre === 'documental') normalizedGenre = 'documentary';
                    if (selected === 'drama' && genre === 'drama') normalizedGenre = 'drama';
                    if (selected === 'aventura' && genre === 'adventure') normalizedGenre = 'aventura';
                    if (selected === 'adventure' && genre === 'aventura') normalizedGenre = 'adventure';
                    if (selected === 'animación' && genre === 'animation') normalizedGenre = 'animación';
                    if (selected === 'animation' && genre === 'animación') normalizedGenre = 'animation';

                    var show = isAll || normalizedGenre === selected;
                    card.style.display = show ? '' : 'none';
                });
            });
        });
    }

    // Re-bind whenever the language is updated
    window.addEventListener('languagechanged', initFilters);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFilters);
    } else {
        initFilters();
    }
})();