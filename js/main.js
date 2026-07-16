/**
 * Nova Studios — Theme and Navigation Controller
 * Handles Light/Dark mode settings, localStorage persistence, and mobile menu toggling.
 */

// 1. Immediate Execution (Pre-render) to prevent Flash of Unstyled Content (FOUC) and bootstrap i18n
(function () {
    try {
        // Theme config
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // No preference saved: check system media query
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        // Prevent duplicate script injection
        if (window.i18nScriptsInjected) return;
        window.i18nScriptsInjected = true;

        // Determine base path relative to main.js script source
        let basePath = '';
        if (document.currentScript) {
            basePath = document.currentScript.src.replace(/js\/main\.js$/, '');
        } else {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src && script.src.endsWith('js/main.js')) {
                    basePath = script.src.replace(/js\/main\.js$/, '');
                    break;
                }
            }
        }

        // Load search stylesheet dynamically
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = basePath + 'css/search.css';
        document.head.appendChild(link);

        // Load translations, search index and scripts dynamically in order (async = false)
        const scriptsToLoad = [
            'js/translations/en.js',
            'js/translations/es.js',
            'js/i18n.js',
            'js/search-index.js',
            'js/search.js'
        ];

        scriptsToLoad.forEach(src => {
            const s = document.createElement('script');
            s.src = basePath + src;
            s.async = false;
            document.head.appendChild(s);
        });
    } catch (e) {
        console.error('Failed to initialize theme and internationalization settings', e);
    }
})();

// 2. DOM Interactive Setup
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Handler
    const themeToggles = document.querySelectorAll('.theme-toggle');

    const updateThemeUI = (theme) => {
        themeToggles.forEach(toggle => {
            toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
            toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        });
    };

    // Initialize UI states
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeUI(currentTheme);

    // Add click listeners to all theme toggles
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    });

    // Mobile Navigation Menu Toggle
    const navToggles = document.querySelectorAll('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggles.length > 0 && navLinks) {
        navToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');
                toggle.classList.toggle('active');
            });
        });
    }

    // Skip-link visibility and keyboard support
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        const showSkipLink = () => {
            skipLink.classList.remove('hidden');
            skipLink.classList.add('show');
            document.body.classList.add('skip-active');
        };

        const hideSkipLink = () => {
            skipLink.classList.add('hidden');
            skipLink.classList.remove('show');
            document.body.classList.remove('skip-active');
        };

        window.addEventListener('scroll', hideSkipLink);
        document.addEventListener('pointerdown', (event) => {
            if (!skipLink.contains(event.target)) {
                hideSkipLink();
            }
        });
        document.addEventListener('touchstart', (event) => {
            if (!skipLink.contains(event.target)) {
                hideSkipLink();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' || event.keyCode === 9) {
                showSkipLink();
            } else if (skipLink.classList.contains('show')) {
                hideSkipLink();
            }
        });

        skipLink.addEventListener('focus', showSkipLink);
        skipLink.addEventListener('blur', () => {
            if (window.scrollY > 0) {
                hideSkipLink();
            }
        });

        showSkipLink();
    }

    // Inject global search button into navbar actions
    const navbarActions = document.querySelector('.navbar-actions');
    if (navbarActions && !document.getElementById('global-search-btn')) {
        const themeToggle = document.getElementById('theme-toggle') || navbarActions.querySelector('.theme-toggle');
        const searchBtn = document.createElement('button');
        searchBtn.id = 'global-search-btn';
        searchBtn.className = 'nav-search-btn';
        searchBtn.setAttribute('data-i18n-aria-label', 'global_search.search_aria_label');
        searchBtn.setAttribute('aria-label', 'Search website');
        searchBtn.innerHTML = '<i class="fa fa-search"></i>';
        
        searchBtn.addEventListener('click', () => {
            if (window.openGlobalSearch) {
                window.openGlobalSearch();
            }
        });

        if (themeToggle) {
            navbarActions.insertBefore(searchBtn, themeToggle);
        } else {
            navbarActions.appendChild(searchBtn);
        }
    }

    // Inject global search overlay modal into body
    if (!document.getElementById('global-search-overlay')) {
        const searchOverlay = document.createElement('div');
        searchOverlay.id = 'global-search-overlay';
        searchOverlay.setAttribute('aria-modal', 'true');
        searchOverlay.setAttribute('role', 'dialog');
        searchOverlay.style.display = 'none';
        searchOverlay.innerHTML = `
            <div id="global-search-modal">
                <div class="global-search-header">
                    <span class="global-search-icon"><i class="fa fa-search"></i></span>
                    <input type="text" id="global-search-input" data-i18n-placeholder="global_search.search_placeholder" placeholder="Search movies, TV shows, pages...">
                    <button id="global-search-close-btn" class="global-search-close" data-i18n-aria-label="global_search.player_close" aria-label="Close search">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div id="global-search-body" class="global-search-body"></div>
                <div class="global-search-footer">
                    <span data-i18n="global_search.search_shortcut_info">Press Esc to close, Tab to navigate</span>
                    <div class="search-shortcuts">
                        <span><span class="search-shortcut-key">↑↓</span> Navigate</span>
                        <span><span class="search-shortcut-key">↵</span> Select</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(searchOverlay);
    }

    // Enable transition animations only after initial rendering is done
    // This stops components from animating from light to dark on page load.
    setTimeout(() => {
        document.documentElement.classList.add('theme-loaded');
    }, 150);
});
