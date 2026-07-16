// ============================================
// Nova Studios — Carousel Navigation
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('releasesCarousel');
    const prevButton = document.querySelector('.carousel-button-prev');
    const nextButton = document.querySelector('.carousel-button-next');

    if (!carousel || !prevButton || !nextButton) return;

    const scrollAmount = 284; // 260px card + 24px gap

    prevButton.addEventListener('click', function() {
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextButton.addEventListener('click', function() {
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    function updateButtonStates() {
        const isAtStart = carousel.scrollLeft <= 0;
        const isAtEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10;

        prevButton.disabled = isAtStart;
        nextButton.disabled = isAtEnd;

        prevButton.style.opacity = isAtStart ? '0.5' : '1';
        prevButton.style.cursor = isAtStart ? 'not-allowed' : 'pointer';

        nextButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextButton.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
    }

    carousel.addEventListener('scroll', updateButtonStates);

    updateButtonStates();
    window.addEventListener('resize', updateButtonStates);
});