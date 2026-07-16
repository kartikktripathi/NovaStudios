/**
 * Nova Studios — Global Search Controller
 * Handles modal visibility, fuzzy search execution, keyboard navigation, and path depth resolution.
 */

(function () {
    let overlay, input, resultsBody, closeBtn;
    let selectedIndex = -1;
    let visibleItems = [];

    // Calculate relative path prefix depending on current page folder depth
    function getPathPrefix() {
        const path = window.location.pathname;
        if (path.includes('/details/')) {
            return '../../';
        }
        const subdirs = ['/entertainment/', '/company/', '/legal/', '/support/', '/blog/', '/auth/', '/media/'];
        if (subdirs.some(dir => path.includes(dir))) {
            return '../';
        }
        return '';
    }

    function toggleSearch(show) {
        if (!overlay) return;
        
        if (show) {
            overlay.style.display = 'flex';
            overlay.offsetHeight; // Force reflow
            overlay.classList.add('active');
            input.value = '';
            selectedIndex = -1;
            visibleItems = [];
            renderResults([]);
            setTimeout(() => input.focus(), 50);
            document.body.style.overflow = 'hidden'; // Stop page scroll
        } else {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (!overlay.classList.contains('active')) {
                    overlay.style.display = 'none';
                }
            }, 250);
        }
    }

    function handleSearch() {
        const query = input.value.trim().toLowerCase();
        if (!query) {
            selectedIndex = -1;
            visibleItems = [];
            renderResults([]);
            return;
        }

        // Perform case-insensitive search
        const matched = [];
        const prefix = getPathPrefix();

        window.searchIndex.forEach(item => {
            const translatedTitle = window.t(item.titleKey).toLowerCase();
            const translatedCategory = window.t(item.categoryKey).toLowerCase();
            
            if (translatedTitle.includes(query) || translatedCategory.includes(query)) {
                matched.push({
                    ...item,
                    resolvedTitle: window.t(item.titleKey),
                    resolvedCategory: window.t(item.categoryKey),
                    resolvedUrl: prefix + item.url
                });
            }
        });

        selectedIndex = -1;
        renderResults(matched);
    }

    function renderResults(items) {
        resultsBody.innerHTML = '';
        visibleItems = items;

        if (items.length === 0) {
            if (input.value.trim() !== '') {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'search-empty-state';
                emptyDiv.innerHTML = `
                    <div class="search-empty-icon"><i class="fa-regular fa-folder-open"></i></div>
                    <p>${window.t('global_search.search_no_results')} <span>"${escapeHtml(input.value)}"</span></p>
                `;
                resultsBody.appendChild(emptyDiv);
            }
            return;
        }

        // Group matches by category
        const groups = {};
        items.forEach(item => {
            if (!groups[item.resolvedCategory]) {
                groups[item.resolvedCategory] = [];
            }
            groups[item.resolvedCategory].push(item);
        });

        // Set search item icons based on category
        const getIconClass = (categoryKey) => {
            if (categoryKey.includes('movies')) return 'fa-solid fa-film';
            if (categoryKey.includes('tv')) return 'fa-solid fa-tv';
            return 'fa-solid fa-file-lines';
        };

        // Render grouped listings
        let globalIdx = 0;
        for (const [category, groupItems] of Object.entries(groups)) {
            const groupHeader = document.createElement('div');
            groupHeader.className = 'search-results-group';
            
            let html = `<div class="search-group-header">${category}</div>`;
            groupItems.forEach(item => {
                const highlightTitle = highlightMatch(item.resolvedTitle, input.value.trim());
                html += `
                    <a href="${item.resolvedUrl}" class="search-result-item" data-index="${globalIdx}">
                        <i class="${getIconClass(item.categoryKey)}"></i>
                        <div class="search-result-content">
                            <span class="search-result-title">${highlightTitle}</span>
                            <span class="search-result-url">${item.url}</span>
                        </div>
                    </a>
                `;
                item.domIndex = globalIdx;
                globalIdx++;
            });
            
            groupHeader.innerHTML = html;
            resultsBody.appendChild(groupHeader);
        }

        // Bind click events and sync references
        const listLinks = resultsBody.querySelectorAll('.search-result-item');
        listLinks.forEach(link => {
            link.addEventListener('click', () => toggleSearch(false));
            link.addEventListener('mouseenter', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                updateSelection(idx);
            });
        });
    }

    // Bold search string matches inside text
    function highlightMatch(text, query) {
        if (!query) return text;
        const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<strong style="color: #f59e0b; font-weight: 800;">$1</strong>');
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function updateSelection(index) {
        selectedIndex = index;
        const links = resultsBody.querySelectorAll('.search-result-item');
        links.forEach(link => {
            const linkIdx = parseInt(link.getAttribute('data-index'));
            if (linkIdx === selectedIndex) {
                link.classList.add('selected');
                link.scrollIntoView({ block: 'nearest' });
            } else {
                link.classList.remove('selected');
            }
        });
    }

    // Keyboard handlers inside the overlay modal
    function handleKeyDown(e) {
        if (!overlay.classList.contains('active')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            toggleSearch(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (visibleItems.length === 0) return;
            const nextIdx = (selectedIndex + 1) % visibleItems.length;
            updateSelection(nextIdx);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (visibleItems.length === 0) return;
            const prevIdx = selectedIndex <= 0 ? visibleItems.length - 1 : selectedIndex - 1;
            updateSelection(prevIdx);
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && selectedIndex < visibleItems.length) {
                e.preventDefault();
                const targetLink = resultsBody.querySelector(`.search-result-item[data-index="${selectedIndex}"]`);
                if (targetLink) {
                    targetLink.click();
                    window.location.href = targetLink.getAttribute('href');
                }
            }
        }
    }

    function initializeSearch() {
        overlay = document.getElementById('global-search-overlay');
        if (!overlay) return;

        input = document.getElementById('global-search-input');
        resultsBody = document.getElementById('global-search-body');
        closeBtn = document.getElementById('global-search-close-btn');

        input.addEventListener('input', handleSearch);
        closeBtn.addEventListener('click', () => toggleSearch(false));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) toggleSearch(false);
        });

        document.addEventListener('keydown', handleKeyDown);

        // Globally listen to Cmd+K / Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleSearch(!overlay.classList.contains('active'));
            }
        });

        // Expose open trigger to global main navbar triggers
        window.openGlobalSearch = function () {
            toggleSearch(true);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSearch);
    } else {
        initializeSearch();
    }
})();
