(function () {
    // Ensure the i18n instance is initialized only once
    if (window.i18nInitialized) return;
    window.i18nInitialized = true;

    let observer;

    // 1. Determine active language
    let activeLang = localStorage.getItem('lang');
    if (!activeLang) {
        const browserLang = navigator.language || navigator.userLanguage || '';
        activeLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
        localStorage.setItem('lang', activeLang);
    }
    
    // Make active lang accessible globally
    window.currentLang = activeLang;

    // Helper to resolve nested keys: e.g. "navbar.home" in translations.en
    window.t = function (key) {
        if (!key) return '';
        const keys = key.split('.');
        
        // Try current language
        let value = window.translations[window.currentLang];
        for (let i = 0; i < keys.length; i++) {
            if (value && value[keys[i]] !== undefined) {
                value = value[keys[i]];
            } else {
                value = null;
                break;
            }
        }
        
        // Fallback to default (English) if not found or empty
        if (value === null || value === undefined) {
            value = window.translations['en'];
            for (let i = 0; i < keys.length; i++) {
                if (value && value[keys[i]] !== undefined) {
                    value = value[keys[i]];
                } else {
                    value = null;
                    break;
                }
            }
        }
        
        // Return key if translation is completely missing
        return value !== null && value !== undefined ? value : key;
    };

    // Helper to translate the whole DOM
    window.translatePage = function () {
        // Set HTML lang attribute
        document.documentElement.setAttribute('lang', window.currentLang);

        // 1. Standard text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = window.t(key);
        });

        // 2. HTML content (for elements containing inline HTML tags like anchors or icons)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = window.t(key);
        });

        // 3. Input placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', window.t(key));
        });

        // 4. Aria labels
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            el.setAttribute('aria-label', window.t(key));
        });

        // 5. SEO Meta tags (Description)
        document.querySelectorAll('[data-i18n-content]').forEach(el => {
            const key = el.getAttribute('data-i18n-content');
            el.setAttribute('content', window.t(key));
        });

        // 6. Input/Button values
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            el.setAttribute('value', window.t(key));
        });

        // 7. Page title
        const titleEl = document.querySelector('title');
        if (titleEl && titleEl.hasAttribute('data-i18n')) {
            const key = titleEl.getAttribute('data-i18n');
            titleEl.textContent = window.t(key);
        }

        // Sync switcher elements value if they exist
        const switchers = document.querySelectorAll('.lang-select');
        switchers.forEach(s => {
            s.value = window.currentLang;
        });
    };

    // Helper to change language
    window.setLanguage = function (lang) {
        if (lang === 'en' || lang === 'es') {
            window.currentLang = lang;
            localStorage.setItem('lang', lang);
            window.translatePage();
        }
    };

    // Function to inject language switcher dropdown
    function injectLanguageSwitcher() {
        const navbarActions = document.querySelector('.navbar-actions');
        if (navbarActions) {
            // Check if switcher already exists to prevent duplicate injections
            if (!document.getElementById('lang-select')) {
                const themeToggle = document.getElementById('theme-toggle') || navbarActions.querySelector('.theme-toggle');
                const langSelectWrapper = document.createElement('div');
                langSelectWrapper.className = 'lang-select-wrapper';
                langSelectWrapper.innerHTML = `
                    <select id="lang-select" class="lang-select" aria-label="Select Language">
                        <option value="en">EN</option>
                        <option value="es">ES</option>
                    </select>
                `;
                
                // Bind change event
                const select = langSelectWrapper.querySelector('select');
                select.value = window.currentLang;
                select.addEventListener('change', (e) => {
                    window.setLanguage(e.target.value);
                });

                if (themeToggle) {
                    navbarActions.insertBefore(langSelectWrapper, themeToggle);
                } else {
                    navbarActions.appendChild(langSelectWrapper);
                }
            }
        }
    }

    // Initialize switcher and run translations
    const init = () => {
        if (observer) {
            observer.disconnect();
        }

        injectLanguageSwitcher();
        window.translatePage();

        if (observer) {
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    };

    // Bootstrapping
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Single Page App navigation support: listen for URL state changes
    window.addEventListener('popstate', init);
    window.addEventListener('hashchange', init);

    // Support arbitrary route/content changes using a MutationObserver
    observer = new MutationObserver((mutations) => {
        let shouldInit = false;
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element Node
                    if (
                        node.querySelector('[data-i18n], [data-i18n-html]') || 
                        node.hasAttribute('data-i18n') || 
                        node.hasAttribute('data-i18n-html') ||
                        node.querySelector('.navbar-actions') ||
                        node.classList.contains('navbar-actions')
                    ) {
                        shouldInit = true;
                        break;
                    }
                }
            }
            if (shouldInit) break;
        }
        if (shouldInit) {
            init();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
