(function () {
    'use strict';
    updateAuthNav();

    // Initialize floating "Back to Top" button
    initBackToTop();

    var toggle = document.querySelector('.nav-toggle');
    var navbar = document.querySelector('.navbar');
    if (!toggle || !navbar) return;

    // Initialize aria-expanded state on load
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function () {
        var isOpen = navbar.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', isOpen);
        if (!isOpen) {
            // Reset submenu states when the main navigation menu is closed
            var openSubmenus = navbar.querySelectorAll('.nav-links > li.submenu-open');
            openSubmenus.forEach(function (li) {
                li.classList.remove('submenu-open');
            });
        }
    });

    // Add has-submenu class to parent items and initialize toggle behavior
    var itemsWithSubmenu = navbar.querySelectorAll('.nav-links > li');
    itemsWithSubmenu.forEach(function (li) {
        var megaMenu = li.querySelector('.mega-menu');
        if (megaMenu) {
            li.classList.add('has-submenu');
            
            var parentLink = li.querySelector('a');
            if (parentLink) {
                parentLink.addEventListener('click', function (e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Close other submenus
                        itemsWithSubmenu.forEach(function (otherLi) {
                            if (otherLi !== li) {
                                otherLi.classList.remove('submenu-open');
                            }
                        });
                        
                        // Toggle this submenu
                        li.classList.toggle('submenu-open');
                    }
                });
            }
        }
    });

    // Close the menu after a navigation link is clicked (excluding parent submenu links on mobile)
    var links = navbar.querySelectorAll('.nav-links a');
    links.forEach(function (link) {
        link.addEventListener('click', function () {
            var parentLi = link.closest('li');
            var hasSubmenu = parentLi && parentLi.classList.contains('has-submenu');
            
            // If it's a submenu parent link on mobile, do not close the main menu
            if (hasSubmenu && window.innerWidth <= 768) {
                return;
            }
            
            navbar.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navbar.classList.contains('nav-open')) {
            navbar.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
        }
    });

    /**
     * Creates and initializes the Back to Top button
     */
    function initBackToTop() {
        if (document.getElementById('back-to-top')) return;

        var btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.setAttribute('title', 'Back to top');
        
        // Clean vector chevron-up SVG icon
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>';

        document.body.appendChild(btn);

        var isScrolling;
        window.addEventListener('scroll', function () {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                toggleButtonVisibility(btn);
            }, 50);
        }, { passive: true });

        // Run check on load in case page starts scrolled down
        toggleButtonVisibility(btn);

        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            btn.blur();
        });
    }

    function toggleButtonVisibility(btn) {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }
function updateAuthNav() {
    var isLoggedIn = false;
    try {
        var session = sessionStorage.getItem('novaPlusSession');
        isLoggedIn = !!session && JSON.parse(session).authenticated === true;
    } catch (e) {
        isLoggedIn = false;
    }

    // 1. Toggle Login and Sign Up buttons (hidden if logged in, shown if logged out)
    document.querySelectorAll('.navbar-actions .navbar-login, .navbar-actions .btn-accent').forEach(function (el) {
        el.style.display = isLoggedIn ? 'none' : '';
    });

    // 2. Handle Profile Icon link and visibility
    var loginEl = document.querySelector('.navbar-actions .navbar-login');
    document.querySelectorAll('.navbar-actions .navbar-profile-icon').forEach(function (profileIconEl) {
        // The Profile Icon is ALWAYS shown now
        profileIconEl.style.display = '';

        // Save the original profile link (e.g. "profile.html" or "../../profile.html")
        // so we can switch back to it when the user logs in
        if (!profileIconEl.dataset.originalHref) {
            profileIconEl.dataset.originalHref = profileIconEl.getAttribute('href') || 'profile.html';
        }

        if (isLoggedIn) {
            // Logged in: Profile icon links to the profile page
            profileIconEl.setAttribute('href', profileIconEl.dataset.originalHref);
        } else {
            // Logged out: Profile icon links to the login page
            // We copy the exact path from the Login button so it works in subdirectories too!
            if (loginEl) {
                profileIconEl.setAttribute('href', loginEl.getAttribute('href'));
            } else {
                profileIconEl.setAttribute('href', 'auth/login.html'); // Fallback
            }
        }
    });
}
})();