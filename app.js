// Infotainment App - Main JavaScript

class InfotainmentApp {
    constructor() {
        this.currentPage = 'music';
        this.radioPlayer = document.getElementById('radio-player');
        this.iptvPlayer = document.getElementById('iptv-player');
        this.radioStations = [];
        this.iptvChannels = [];
        this.countries = new Set();
        this.tags = new Set();
        this.iptvCountries = new Set();
        this.iptvCategories = new Set();

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFullscreen();
        this.setupMusicPage();
        this.setupIPTVPage();
        this.loadRadioStations();
        this.loadIPTVChannels();
    }

    // Navigation
    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const page = tab.dataset.page;
                this.switchPage(page);
            });
        });
    }

    switchPage(pageName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const activeTab = document.querySelector(`[data-page="${pageName}"]`);
        const activePage = document.getElementById(`${pageName}-page`);

        if (activeTab) activeTab.classList.add('active');
        if (activePage) activePage.classList.add('active');

        this.currentPage = pageName;

        if (pageName !== 'music') {
            this.stopRadio();
        }
        if (pageName !== 'iptv') {
            this.closeIPTVPlayer();
        }
    }

    // Fullscreen
    setupFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        }
    }

    // Music/Radio Page
    setupMusicPage() {
        const searchInput = document.getElementById('radio-search');
        const countryFilter = document.getElementById('country-filter');
        const tagFilter = document.getElementById('tag-filter');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        const volumeSlider = document.getElementById('volume-slider');

        searchInput.addEventListener('input', () => this.filterRadioStations());
        countryFilter.addEventListener('change', () => this.filterRadioStations());
        tagFilter.addEventListener('change', () => this.filterRadioStations());

        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        stopBtn.addEventListener('click', () => this.stopRadio());
        volumeSlider.addEventListener('input', (e) => {
            this.radioPlayer.volume = e.target.value / 100;
        });

        this.radioPlayer.volume = 0.7;
    }

    async loadRadioStations() {
        const container = document.getElementById('radio-stations');
        container.innerHTML = '<div class="loading">Loading radio stations...</div>';

        try {
            const response = await fetch('https://de1.api.radio-browser.info/json/stations/topvote/50');
            const stations = await response.json();

            this.radioStations = stations.filter(station =>
                station.url_resolved && station.url_resolved.trim() !== ''
            );

            this.radioStations.forEach(station => {
                if (station.country) this.countries.add(station.country);
                if (station.tags) {
                    station.tags.split(',').forEach(tag => {
                        const trimmedTag = tag.trim();
                        if (trimmedTag) this.tags.add(trimmedTag);
                    });
                }
            });

            this.populateCountryFilter();
            this.populateTagFilter();
            this.displayRadioStations(this.radioStations);
        } catch (error) {
            container.innerHTML = '<div class="loading">Failed to load radio stations. Please try again later.</div>';
            console.error('Error loading radio stations:', error);
        }
    }

    populateCountryFilter() {
        const countryFilter = document.getElementById('country-filter');
        const sortedCountries = Array.from(this.countries).sort();

        sortedCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
    }

    populateTagFilter() {
        const tagFilter = document.getElementById('tag-filter');
        const sortedTags = Array.from(this.tags).sort();

        sortedTags.slice(0, 50).forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

    filterRadioStations() {
        const searchTerm = document.getElementById('radio-search').value.toLowerCase();
        const selectedCountry = document.getElementById('country-filter').value;
        const selectedTag = document.getElementById('tag-filter').value;

        const filtered = this.radioStations.filter(station => {
            const matchesSearch = !searchTerm ||
                station.name.toLowerCase().includes(searchTerm) ||
                (station.tags && station.tags.toLowerCase().includes(searchTerm));

            const matchesCountry = !selectedCountry || station.country === selectedCountry;

            const matchesTag = !selectedTag ||
                (station.tags && station.tags.toLowerCase().includes(selectedTag.toLowerCase()));

            return matchesSearch && matchesCountry && matchesTag;
        });

        this.displayRadioStations(filtered);
    }

    displayRadioStations(stations) {
        const container = document.getElementById('radio-stations');

        if (stations.length === 0) {
            container.innerHTML = '<div class="loading">No stations found.</div>';
            return;
        }

        container.innerHTML = '';
        stations.forEach(station => {
            const card = this.createStationCard(station);
            container.appendChild(card);
        });
    }

    createStationCard(station) {
        const card = document.createElement('div');
        card.className = 'station-card';

        const tags = station.tags ? station.tags.split(',').slice(0, 3).map(tag =>
            `<span class="tag">${tag.trim()}</span>`
        ).join('') : '';

        card.innerHTML = `
            <h3>${this.escapeHtml(station.name)}</h3>
            <p>${this.escapeHtml(station.country || 'Unknown')}</p>
            <p style="font-size: 0.85rem; color: #888;">${station.bitrate ? station.bitrate + ' kbps' : ''}</p>
            <div class="station-tags">${tags}</div>
        `;

        card.addEventListener('click', () => this.playRadioStation(station));

        return card;
    }

    playRadioStation(station) {
        this.radioPlayer.src = station.url_resolved;
        this.radioPlayer.play();

        const nowPlaying = document.getElementById('now-playing');
        nowPlaying.classList.remove('hidden');

        const stationLogo = document.getElementById('station-logo');
        stationLogo.src = station.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
        stationLogo.onerror = () => {
            stationLogo.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
        };

        document.getElementById('station-name').textContent = station.name;
        document.getElementById('station-country').textContent = station.country || 'Unknown';

        this.updatePlayPauseButton(true);

        fetch(`https://de1.api.radio-browser.info/json/url/${station.stationuuid}`).catch(() => {});
    }

    togglePlayPause() {
        if (this.radioPlayer.paused) {
            this.radioPlayer.play();
            this.updatePlayPauseButton(true);
        } else {
            this.radioPlayer.pause();
            this.updatePlayPauseButton(false);
        }
    }

    updatePlayPauseButton(isPlaying) {
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');

        if (isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    stopRadio() {
        this.radioPlayer.pause();
        this.radioPlayer.src = '';
        document.getElementById('now-playing').classList.add('hidden');
        this.updatePlayPauseButton(false);
    }

    // IPTV Page
    setupIPTVPage() {
        const searchInput = document.getElementById('iptv-search');
        const countryFilter = document.getElementById('iptv-country-filter');
        const categoryFilter = document.getElementById('iptv-category-filter');
        const closePlayerBtn = document.getElementById('close-player');

        searchInput.addEventListener('input', () => this.filterIPTVChannels());
        countryFilter.addEventListener('change', () => this.filterIPTVChannels());
        categoryFilter.addEventListener('change', () => this.filterIPTVChannels());
        closePlayerBtn.addEventListener('click', () => this.closeIPTVPlayer());
    }

    async loadIPTVChannels() {
        const container = document.getElementById('iptv-channels');
        container.innerHTML = '<div class="loading">Loading TV channels...</div>';

        try {
            const response = await fetch('https://iptv-org.github.io/api/streams.json');
            const channels = await response.json();

            this.iptvChannels = channels.filter(channel =>
                channel.url &&
                channel.status === 'online' &&
                (channel.url.endsWith('.m3u8') || channel.url.includes('m3u8'))
            ).slice(0, 200);

            this.iptvChannels.forEach(channel => {
                if (channel.country) this.iptvCountries.add(channel.country);
                if (channel.category) this.iptvCategories.add(channel.category);
            });

            this.populateIPTVCountryFilter();
            this.populateIPTVCategoryFilter();
            this.displayIPTVChannels(this.iptvChannels);
        } catch (error) {
            container.innerHTML = '<div class="loading">Failed to load TV channels. Please try again later.</div>';
            console.error('Error loading IPTV channels:', error);
        }
    }

    populateIPTVCountryFilter() {
        const countryFilter = document.getElementById('iptv-country-filter');
        const sortedCountries = Array.from(this.iptvCountries).sort();

        sortedCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
    }

    populateIPTVCategoryFilter() {
        const categoryFilter = document.getElementById('iptv-category-filter');
        const sortedCategories = Array.from(this.iptvCategories).sort();

        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    filterIPTVChannels() {
        const searchTerm = document.getElementById('iptv-search').value.toLowerCase();
        const selectedCountry = document.getElementById('iptv-country-filter').value;
        const selectedCategory = document.getElementById('iptv-category-filter').value;

        const filtered = this.iptvChannels.filter(channel => {
            const matchesSearch = !searchTerm ||
                channel.name.toLowerCase().includes(searchTerm) ||
                (channel.network && channel.network.toLowerCase().includes(searchTerm));

            const matchesCountry = !selectedCountry || channel.country === selectedCountry;
            const matchesCategory = !selectedCategory || channel.category === selectedCategory;

            return matchesSearch && matchesCountry && matchesCategory;
        });

        this.displayIPTVChannels(filtered);
    }

    displayIPTVChannels(channels) {
        const container = document.getElementById('iptv-channels');

        if (channels.length === 0) {
            container.innerHTML = '<div class="loading">No channels found.</div>';
            return;
        }

        container.innerHTML = '';
        channels.forEach(channel => {
            const card = this.createChannelCard(channel);
            container.appendChild(card);
        });
    }

    createChannelCard(channel) {
        const card = document.createElement('div');
        card.className = 'channel-card';

        const category = channel.category ?
            `<span class="tag">${this.escapeHtml(channel.category)}</span>` : '';

        card.innerHTML = `
            <h3>${this.escapeHtml(channel.name)}</h3>
            <p>${this.escapeHtml(channel.country || 'Unknown')}</p>
            ${channel.network ? `<p style="font-size: 0.85rem; color: #888;">${this.escapeHtml(channel.network)}</p>` : ''}
            <div class="channel-tags">${category}</div>
        `;

        card.addEventListener('click', () => this.playIPTVChannel(channel));

        return card;
    }

    playIPTVChannel(channel) {
        const playerContainer = document.getElementById('video-player-container');
        playerContainer.classList.remove('hidden');

        this.iptvPlayer.src = channel.url;

        document.getElementById('channel-name').textContent = channel.name;
        document.getElementById('channel-country').textContent =
            `${channel.country || 'Unknown'}${channel.network ? ' - ' + channel.network : ''}`;

        this.iptvPlayer.play().catch(error => {
            console.error('Error playing channel:', error);
            alert('Unable to play this channel. It may be offline or not compatible with your browser.');
            this.closeIPTVPlayer();
        });
    }

    closeIPTVPlayer() {
        const playerContainer = document.getElementById('video-player-container');
        playerContainer.classList.add('hidden');
        this.iptvPlayer.pause();
        this.iptvPlayer.src = '';
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InfotainmentApp();
});
