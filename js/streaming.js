/**
 * Nova Studios — Nova+ Streaming Catalog & Custom Player Controller
 * Handles watchlist local storage persistence, interactive category filtering, live text catalog search,
 * and binding custom overlay controls to HTML5 video media players.
 */

(function () {
    // 1. Central Catalog Data Array
    const videoCatalog = [
        {
            id: "stellar-horizon",
            titleKey: "entertainment_streaming.stellar_horizon",
            type: "movie",
            typeKey: "entertainment_streaming.9_2movie",
            rating: "9.2",
            genres: ["category_all", "category_action", "category_scifi"],
            url: "details/movie-stellar-horizon.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            bgClass: "dark"
        },
        {
            id: "chronicles-of-ashenmoor",
            titleKey: "entertainment_streaming.chronicles_of_ashenmoor",
            type: "series",
            typeKey: "entertainment_streaming.9_4series",
            rating: "9.4",
            genres: ["category_all", "category_fantasy", "category_action"],
            url: "details/tv-show-chronicles-of-ashenmoor.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            bgClass: "dark"
        },
        {
            id: "echoes-of-tomorrow",
            titleKey: "entertainment_streaming.echoes_of_tomorrow",
            type: "movie",
            typeKey: "entertainment_streaming.8_7movie",
            rating: "8.7",
            genres: ["category_all", "category_scifi"],
            url: "details/movie-echoes-of-tomorrow.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
            bgClass: "purple"
        },
        {
            id: "wild-planet",
            titleKey: "entertainment_streaming.wild_planet",
            type: "series",
            typeKey: "entertainment_streaming.9_1series",
            rating: "9.1",
            genres: ["category_all", "category_documentary"],
            url: "details/tv-show-wild-planet.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            bgClass: "green"
        },
        {
            id: "signal-lost",
            titleKey: "entertainment_tv-shows.signal_lost",
            type: "series",
            typeKey: "entertainment_tv-shows.2_seasons_sci_fi_tv_14",
            rating: "8.5",
            genres: ["category_all", "category_scifi"],
            url: "details/tv-show-signal-lost.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            bgClass: "blue"
        },
        {
            id: "the-golden-hour",
            titleKey: "entertainment_tv-shows.the_golden_hour",
            type: "series",
            typeKey: "entertainment_tv-shows.3_seasons_drama_tv_ma",
            rating: "8.8",
            genres: ["category_all", "category_drama"],
            url: "details/tv-show-the-golden-hour.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            bgClass: "red"
        },
        {
            id: "the-playwright",
            titleKey: "entertainment_tv-shows.the_playwright",
            type: "series",
            typeKey: "entertainment_tv-shows.1_season_drama_tv_ma",
            rating: "8.6",
            genres: ["category_all", "category_drama"],
            url: "details/tv-show-the-playwright.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            bgClass: "dark"
        },
        {
            id: "laugh-track",
            titleKey: "entertainment_tv-shows.laugh_track",
            type: "series",
            typeKey: "entertainment_tv-shows.2_seasons_comedy_tv_14",
            rating: "8.2",
            genres: ["category_all", "category_comedy"],
            url: "details/tv-show-laugh-track.html",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            bgClass: "purple"
        }
    ];

    // State
    let watchlist = [];
    let activeGenre = "category_all";
    let searchQuery = "";
    let isInitialized = false;

    // DOM Elements
    let catalogGrid, watchlistContainer, watchlistGrid, searchInput, filterPills;
    let playerModal, videoPlayer, playBtn, muteBtn, volumeSlider, progressContainer, progressFill, timeDisplay, fullscreenBtn, closePlayerBtn;

    // Safe translation wrapper to prevent script crash if window.t is not loaded yet
    function translate(key) {
        if (typeof window.t === 'function') {
            return window.t(key);
        }
        // Fallback title formatting if i18n isn't loaded yet
        return key.split('.').pop().replace(/_/g, ' ');
    }

    // 2. Local Storage Watchlist helper functions
    function loadWatchlist() {
        const saved = localStorage.getItem('watchlist');
        try {
            watchlist = saved ? JSON.parse(saved) : [];
        } catch (e) {
            watchlist = [];
        }
    }

    function saveWatchlist() {
        try {
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
        } catch (e) {
            console.error("Failed to write to localStorage:", e);
        }
    }

    function toggleWatchlist(id) {
        const index = watchlist.indexOf(id);
        if (index > -1) {
            watchlist.splice(index, 1);
        } else {
            watchlist.push(id);
        }
        saveWatchlist();
        renderWatchlist();
        renderCatalog();
    }

    // 3. UI Rendering logic
    function renderWatchlist() {
        if (!watchlistContainer) return;

        watchlistContainer.classList.remove('hidden');
        watchlistGrid.innerHTML = '';

        if (watchlist.length === 0) {
            watchlistGrid.style.display = 'block';
            watchlistGrid.innerHTML = `
                <div class="empty-watchlist-note">
                    <i class="fa-regular fa-bookmark" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--text-muted);"></i>
                    <p>${translate('entertainment_streaming.empty_watchlist')}</p>
                </div>
            `;
            return;
        }

        watchlistGrid.style.display = 'grid';
        watchlist.forEach(id => {
            const item = videoCatalog.find(v => v.id === id);
            if (item) {
                const card = createCardElement(item, true);
                watchlistGrid.appendChild(card);
            }
        });
    }

    function renderCatalog() {
        if (!catalogGrid) return;

        catalogGrid.innerHTML = '';
        const filtered = videoCatalog.filter(item => {
            const matchesGenre = item.genres.includes(activeGenre);
            const matchesSearch = translate(item.titleKey).toLowerCase().includes(searchQuery);
            return matchesGenre && matchesSearch;
        });

        if (filtered.length === 0) {
            const emptyNote = document.createElement('div');
            emptyNote.className = 'empty-watchlist-note';
            emptyNote.style.gridColumn = '1 / -1';
            emptyNote.innerHTML = `
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>${translate('global_search.search_no_results')} "${escapeHtml(searchQuery)}"</p>
            `;
            catalogGrid.appendChild(emptyNote);
            return;
        }

        filtered.forEach(item => {
            const card = createCardElement(item, false);
            catalogGrid.appendChild(card);
        });
    }

    function createCardElement(item, isWatchlistItem) {
        const inWatchlist = watchlist.includes(item.id);
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Translate inner elements dynamically
        const translatedTitle = translate(item.titleKey);
        const translatedMeta = translate(item.typeKey);

        card.innerHTML = `
            <div class="placeholder-img ${item.bgClass} card-img" style="height: 260px;">${translatedTitle}</div>
            <div class="card-play-overlay">
                <div class="play-overlay-icon"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="card-actions-overlay">
                <button class="card-action-btn ${inWatchlist ? 'added' : ''}" title="${inWatchlist ? translate('entertainment_streaming.remove_from_watchlist') : translate('entertainment_streaming.add_to_watchlist')}">
                    <i class="${inWatchlist ? 'fa-solid fa-check' : 'fa-solid fa-plus'}"></i>
                </button>
            </div>
            <div class="card-body">
                <h3 class="card-title">${translatedTitle}</h3>
                <div class="card-meta">${translatedMeta}</div>
            </div>
        `;

        // Bind play events
        const playOverlay = card.querySelector('.card-play-overlay');
        playOverlay.addEventListener('click', () => playTrailer(item));

        // Bind watchlist toggles
        const actionBtn = card.querySelector('.card-action-btn');
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWatchlist(item.id);
        });

        // Make card redirect when title clicked
        const title = card.querySelector('.card-title');
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            window.location.href = item.url;
        });

        return card;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 4. Custom Media Player triggers & overlay control mappings
    function playTrailer(item) {
        if (!playerModal || !videoPlayer) return;
        
        videoPlayer.src = item.videoUrl;
        playerModal.classList.add('active');
        videoPlayer.play();
        updatePlayBtnUI(true);
        document.body.style.overflow = 'hidden';
    }

    function closePlayer() {
        if (!playerModal || !videoPlayer) return;

        videoPlayer.pause();
        videoPlayer.src = '';
        playerModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updatePlayBtnUI(isPlaying) {
        playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        playBtn.setAttribute('title', isPlaying ? translate('entertainment_streaming.player_pause') : translate('entertainment_streaming.player_play'));
    }

    function togglePlay() {
        if (videoPlayer.paused) {
            videoPlayer.play();
            updatePlayBtnUI(true);
        } else {
            videoPlayer.pause();
            updatePlayBtnUI(false);
        }
    }

    function toggleMute() {
        videoPlayer.muted = !videoPlayer.muted;
        muteBtn.innerHTML = videoPlayer.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        muteBtn.setAttribute('title', videoPlayer.muted ? translate('entertainment_streaming.player_unmute') : translate('entertainment_streaming.player_mute'));
        volumeSlider.value = videoPlayer.muted ? 0 : videoPlayer.volume;
    }

    function handleVolumeChange() {
        videoPlayer.volume = volumeSlider.value;
        videoPlayer.muted = (videoPlayer.volume === 0);
        muteBtn.innerHTML = videoPlayer.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function updateProgress() {
        if (videoPlayer.duration) {
            const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressFill.style.width = percentage + '%';
            timeDisplay.textContent = formatTime(videoPlayer.currentTime) + ' / ' + formatTime(videoPlayer.duration);
        }
    }

    function seekVideo(e) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (videoPlayer.duration) {
            videoPlayer.currentTime = (clickX / width) * videoPlayer.duration;
            updateProgress();
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            playerModal.querySelector('.player-container').requestFullscreen().catch(err => {
                console.error("Error attempting to enable full-screen mode:", err.message);
            });
            fullscreenBtn.innerHTML = '<i class="fa-solid fa-minimize"></i>';
            fullscreenBtn.setAttribute('title', translate('entertainment_streaming.player_exit_fullscreen'));
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fa-solid fa-maximize"></i>';
            fullscreenBtn.setAttribute('title', translate('entertainment_streaming.player_fullscreen'));
        }
    }

    // Initialize Page
    function init() {
        if (isInitialized) return;

        catalogGrid = document.getElementById('catalog-grid');
        watchlistContainer = document.getElementById('watchlist-container');
        watchlistGrid = document.getElementById('watchlist-row');
        searchInput = document.getElementById('catalog-search-input');
        filterPills = document.querySelectorAll('.filter-pill');

        // Player DOM
        playerModal = document.getElementById('custom-player-modal');
        videoPlayer = document.getElementById('player-video');
        playBtn = document.getElementById('player-play-btn');
        muteBtn = document.getElementById('player-mute-btn');
        volumeSlider = document.getElementById('player-volume-slider');
        progressContainer = document.getElementById('player-progress-container');
        progressFill = document.getElementById('player-progress-fill');
        timeDisplay = document.getElementById('player-time-display');
        fullscreenBtn = document.getElementById('player-fullscreen-btn');
        closePlayerBtn = document.getElementById('player-close-btn');

        // Listeners for Toolbar Controls
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                renderCatalog();
            });
        }

        if (filterPills) {
            filterPills.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    filterPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    activeGenre = pill.getAttribute('data-genre');
                    renderCatalog();
                });
            });
        }

        // Listeners for Video Controls
        if (videoPlayer) {
            videoPlayer.addEventListener('timeupdate', updateProgress);
            videoPlayer.addEventListener('click', togglePlay);
            playBtn.addEventListener('click', togglePlay);
            muteBtn.addEventListener('click', toggleMute);
            volumeSlider.addEventListener('input', handleVolumeChange);
            progressContainer.addEventListener('click', seekVideo);
            fullscreenBtn.addEventListener('click', toggleFullscreen);
            closePlayerBtn.addEventListener('click', closePlayer);

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && playerModal.classList.contains('active')) {
                    closePlayer();
                }
            });
        }

        loadWatchlist();
        isInitialized = true;

        // Render immediately if translations are already available
        if (typeof window.t === 'function' && window.translations) {
            renderWatchlist();
            renderCatalog();
        }
    }

    // Bind page rendering and re-rendering to language change notifications
    window.addEventListener('languagechanged', () => {
        if (!isInitialized) {
            init();
        } else {
            renderWatchlist();
            renderCatalog();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
