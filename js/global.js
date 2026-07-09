/**
 * Nova Studios — Global JavaScript
 * Handles global interactive features like the "Back to Top" button.
 */

document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
});

/**
 * Initializes the floating "Back to Top" button.
 */
function initBackToTop() {
    // Prevent duplicate button creation if the script is loaded twice
    if (document.getElementById('back-to-top')) return;

    // Create the button element
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.setAttribute('title', 'Back to top');

    // Add SVG pointing up arrow icon
    backToTopButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    `;

    // Append to body
    document.body.appendChild(backToTopButton);

    // Scroll event listener with a throttle-like check for performance
    let isScrolling;
    window.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            toggleButtonVisibility(backToTopButton);
        }, 50);
    }, { passive: true });

    // Initial check in case the page is loaded scrolled down
    toggleButtonVisibility(backToTopButton);

    // Click event listener to scroll to top smoothly
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Remove focus after clicking so the focus ring disappears
        backToTopButton.blur();
    });
}

/**
 * Shows or hides the button depending on the scroll position.
 * @param {HTMLElement} btn 
 */
function toggleButtonVisibility(btn) {
    if (window.scrollY > 300) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
}
