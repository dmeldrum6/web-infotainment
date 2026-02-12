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
        this.weatherLoaded = false;
        this.booksData = {
            books: [],
            currentPage: 1,
            nextUrl: null,
            prevUrl: null,
            totalCount: 0,
            languages: new Set(),
            topics: new Set()
        };
        this.booksLoaded = false;

        // Games state
        this.sudoku = {
            board: [],
            solution: [],
            given: [],
            selectedCell: null
        };
        this.match3 = {
            board: [],
            selectedCell: null,
            score: 0,
            cols: 8,
            rows: 8,
            colors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
            animating: false
        };

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFullscreen();
        this.setupMusicPage();
        this.setupIPTVPage();
        this.setupBooksPage();
        this.setupGamesPage();
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
        if (pageName === 'weather' && !this.weatherLoaded) {
            this.weatherLoaded = true;
            this.loadWeather();
        }
        if (pageName === 'books' && !this.booksLoaded) {
            this.booksLoaded = true;
            this.loadBooks();
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
            const response = await fetch('https://de1.api.radio-browser.info/json/stations/topvote/500');
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

        sortedTags.forEach(tag => {
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
            // Fetch both channels metadata and streams
            const [channelsResponse, streamsResponse] = await Promise.all([
                fetch('https://iptv-org.github.io/api/channels.json'),
                fetch('https://iptv-org.github.io/api/streams.json')
            ]);

            const channels = await channelsResponse.json();
            const streams = await streamsResponse.json();

            console.log(`Loaded ${channels.length} channels and ${streams.length} streams`);

            // Debug: Log first channel and stream to see structure
            if (channels.length > 0) console.log('Sample channel:', channels[0]);
            if (streams.length > 0) console.log('Sample stream:', streams[0]);

            // Create a map of channels by ID for quick lookup
            const channelMap = new Map();
            channels.forEach(channel => {
                channelMap.set(channel.id, channel);
            });

            // Merge stream data with channel metadata
            const mergedChannels = [];
            streams.forEach(stream => {
                const channel = channelMap.get(stream.channel);
                if (channel && stream.url &&
                    (stream.url.endsWith('.m3u8') || stream.url.includes('m3u8'))) {

                    // Extract country (ISO code)
                    const country = channel.country || 'Unknown';

                    // Extract primary category from categories array
                    const category = channel.categories && channel.categories.length > 0 ?
                        channel.categories[0] : 'general';

                    mergedChannels.push({
                        id: channel.id,
                        name: stream.title || channel.name,
                        country: country,
                        category: category,
                        network: channel.network || '',
                        url: stream.url,
                        website: channel.website || ''
                    });
                }
            });

            console.log(`Merged ${mergedChannels.length} channels with streams`);

            // Limit to first 300 channels for performance
            this.iptvChannels = mergedChannels.slice(0, 300);

            // Populate filters
            this.iptvChannels.forEach(channel => {
                if (channel.country) this.iptvCountries.add(channel.country);
                if (channel.category) this.iptvCategories.add(channel.category);
            });

            console.log(`Countries: ${this.iptvCountries.size}, Categories: ${this.iptvCategories.size}`);

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

    // Books Page
    setupBooksPage() {
        const searchInput = document.getElementById('books-search');
        const languageFilter = document.getElementById('books-language-filter');
        const topicFilter = document.getElementById('books-topic-filter');
        const prevBtn = document.getElementById('books-prev-btn');
        const nextBtn = document.getElementById('books-next-btn');
        const closeModalBtn = document.getElementById('close-book-modal');

        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.searchBooks(), 500);
        });

        languageFilter.addEventListener('change', () => this.searchBooks());
        topicFilter.addEventListener('change', () => this.searchBooks());
        prevBtn.addEventListener('click', () => this.loadBooksPage(this.booksData.prevUrl));
        nextBtn.addEventListener('click', () => this.loadBooksPage(this.booksData.nextUrl));
        closeModalBtn.addEventListener('click', () => this.closeBookModal());

        const modal = document.getElementById('book-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBookModal();
            }
        });
    }

    async loadBooks(url = 'https://gutendex.com/books') {
        const container = document.getElementById('books-grid');
        container.innerHTML = '<div class="loading">Loading books...</div>';

        try {
            const response = await fetch(url);
            const data = await response.json();

            this.booksData.books = data.results || [];
            this.booksData.nextUrl = data.next;
            this.booksData.prevUrl = data.previous;
            this.booksData.totalCount = data.count || 0;

            // Extract unique languages and topics for filters
            this.booksData.books.forEach(book => {
                if (book.languages) {
                    book.languages.forEach(lang => this.booksData.languages.add(lang));
                }
                if (book.bookshelves) {
                    book.bookshelves.forEach(shelf => this.booksData.topics.add(shelf));
                }
                if (book.subjects) {
                    book.subjects.forEach(subject => {
                        const topic = subject.split('--')[0].trim();
                        this.booksData.topics.add(topic);
                    });
                }
            });

            this.populateBooksLanguageFilter();
            this.populateBooksTopicFilter();
            this.displayBooks(this.booksData.books);
            this.updatePaginationControls();
        } catch (error) {
            container.innerHTML = '<div class="loading">Failed to load books. Please try again later.</div>';
            console.error('Error loading books:', error);
        }
    }

    async loadBooksPage(url) {
        if (!url) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await this.loadBooks(url);
    }

    populateBooksLanguageFilter() {
        const languageFilter = document.getElementById('books-language-filter');
        const currentValue = languageFilter.value;

        // Only populate if empty
        if (languageFilter.options.length <= 1) {
            const languageNames = {
                'en': 'English',
                'fr': 'French',
                'de': 'German',
                'es': 'Spanish',
                'it': 'Italian',
                'pt': 'Portuguese',
                'nl': 'Dutch',
                'fi': 'Finnish',
                'sv': 'Swedish',
                'da': 'Danish',
                'no': 'Norwegian',
                'la': 'Latin',
                'el': 'Greek',
                'zh': 'Chinese',
                'ja': 'Japanese'
            };

            const sortedLanguages = Array.from(this.booksData.languages).sort();

            sortedLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = languageNames[lang] || lang.toUpperCase();
                languageFilter.appendChild(option);
            });
        }

        languageFilter.value = currentValue;
    }

    populateBooksTopicFilter() {
        const topicFilter = document.getElementById('books-topic-filter');
        const currentValue = topicFilter.value;

        // Only populate if empty
        if (topicFilter.options.length <= 1) {
            const sortedTopics = Array.from(this.booksData.topics)
                .sort()
                .slice(0, 50); // Limit to top 50 topics

            sortedTopics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicFilter.appendChild(option);
            });
        }

        topicFilter.value = currentValue;
    }

    searchBooks() {
        const searchTerm = document.getElementById('books-search').value.trim();
        const language = document.getElementById('books-language-filter').value;
        const topic = document.getElementById('books-topic-filter').value;

        let url = 'https://gutendex.com/books?';
        const params = [];

        if (searchTerm) {
            params.push(`search=${encodeURIComponent(searchTerm)}`);
        }
        if (language) {
            params.push(`languages=${language}`);
        }
        if (topic) {
            params.push(`topic=${encodeURIComponent(topic)}`);
        }

        url += params.join('&');
        this.loadBooks(url);
    }

    displayBooks(books) {
        const container = document.getElementById('books-grid');

        if (books.length === 0) {
            container.innerHTML = '<div class="loading">No books found.</div>';
            return;
        }

        container.innerHTML = '';
        books.forEach(book => {
            const card = this.createBookCard(book);
            container.appendChild(card);
        });
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';

        const author = book.authors && book.authors.length > 0 ?
            book.authors[0].name : 'Unknown Author';

        const coverUrl = book.formats['image/jpeg'] || '';
        const coverHtml = coverUrl ?
            `<img src="${this.escapeHtml(coverUrl)}" alt="Book cover">` :
            `<div class="book-cover-placeholder">📚</div>`;

        const languages = book.languages && book.languages.length > 0 ?
            book.languages.map(lang =>
                `<span class="book-lang-tag">${this.escapeHtml(lang)}</span>`
            ).join('') : '';

        card.innerHTML = `
            <div class="book-cover">${coverHtml}</div>
            <h3>${this.escapeHtml(book.title)}</h3>
            <div class="book-author">${this.escapeHtml(author)}</div>
            <div class="book-languages">${languages}</div>
            <div class="book-downloads">📥 ${book.download_count || 0} downloads</div>
        `;

        card.addEventListener('click', () => this.showBookDetails(book));

        return card;
    }

    showBookDetails(book) {
        const modal = document.getElementById('book-modal');
        const details = document.getElementById('book-details');

        const authors = book.authors && book.authors.length > 0 ?
            book.authors.map(a => `${a.name}${a.birth_year ? ` (${a.birth_year}-${a.death_year || '?'})` : ''}`).join(', ') :
            'Unknown Author';

        const coverUrl = book.formats['image/jpeg'] || '';
        const coverHtml = coverUrl ?
            `<img src="${this.escapeHtml(coverUrl)}" alt="Book cover">` :
            `<div class="book-cover-placeholder" style="font-size: 5rem;">📚</div>`;

        const subjects = book.subjects && book.subjects.length > 0 ?
            book.subjects.slice(0, 10).map(subject =>
                `<span class="book-subject-tag">${this.escapeHtml(subject)}</span>`
            ).join('') : '';

        const bookshelves = book.bookshelves && book.bookshelves.length > 0 ?
            book.bookshelves.map(shelf =>
                `<span class="book-subject-tag">${this.escapeHtml(shelf)}</span>`
            ).join('') : '';

        // Prepare download links
        const downloadLinks = [];

        if (book.formats['text/html']) {
            downloadLinks.push(`<a href="${this.escapeHtml(book.formats['text/html'])}" target="_blank" class="download-btn read-online">Read Online (HTML)</a>`);
        }
        if (book.formats['application/epub+zip']) {
            downloadLinks.push(`<a href="${this.escapeHtml(book.formats['application/epub+zip'])}" target="_blank" class="download-btn">Download EPUB</a>`);
        }
        if (book.formats['application/x-mobipocket-ebook']) {
            downloadLinks.push(`<a href="${this.escapeHtml(book.formats['application/x-mobipocket-ebook'])}" target="_blank" class="download-btn">Download MOBI</a>`);
        }
        if (book.formats['application/pdf']) {
            downloadLinks.push(`<a href="${this.escapeHtml(book.formats['application/pdf'])}" target="_blank" class="download-btn">Download PDF</a>`);
        }
        if (book.formats['text/plain']) {
            downloadLinks.push(`<a href="${this.escapeHtml(book.formats['text/plain'])}" target="_blank" class="download-btn">Download TXT</a>`);
        }

        details.innerHTML = `
            <div class="book-detail-header">
                <div class="book-detail-cover">${coverHtml}</div>
                <div class="book-detail-info">
                    <h2>${this.escapeHtml(book.title)}</h2>
                    <div class="book-detail-author">${this.escapeHtml(authors)}</div>
                    <div class="book-detail-meta">
                        <div class="book-detail-meta-item">
                            <strong>Languages:</strong>
                            <span>${book.languages ? book.languages.join(', ').toUpperCase() : 'Unknown'}</span>
                        </div>
                        <div class="book-detail-meta-item">
                            <strong>Downloads:</strong>
                            <span>${book.download_count || 0}</span>
                        </div>
                        ${book.copyright !== null ? `
                        <div class="book-detail-meta-item">
                            <strong>Copyright:</strong>
                            <span>${book.copyright ? 'Yes' : 'Public Domain'}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            ${subjects || bookshelves ? `
            <div class="book-subjects">
                ${subjects}
                ${bookshelves}
            </div>
            ` : ''}
            ${downloadLinks.length > 0 ? `
            <div class="book-download-links">
                <h3>Read or Download</h3>
                ${downloadLinks.join('')}
            </div>
            ` : ''}
        `;

        modal.classList.remove('hidden');
    }

    closeBookModal() {
        const modal = document.getElementById('book-modal');
        modal.classList.add('hidden');
    }

    updatePaginationControls() {
        const prevBtn = document.getElementById('books-prev-btn');
        const nextBtn = document.getElementById('books-next-btn');
        const pageInfo = document.getElementById('books-page-info');

        prevBtn.disabled = !this.booksData.prevUrl;
        nextBtn.disabled = !this.booksData.nextUrl;

        const currentStart = this.booksData.prevUrl ?
            (parseInt(new URL(this.booksData.prevUrl).searchParams.get('page') || '1') + 1) : 1;

        pageInfo.textContent = `Page ${currentStart}`;
    }

    // Weather Page
    async loadWeather() {
        const content = document.getElementById('weather-content');
        const locationEl = document.getElementById('weather-location');
        content.innerHTML = '<div class="loading">Detecting your location...</div>';

        try {
            // Step 1: Get location from IP address
            const geoResponse = await fetch('https://ipapi.co/json/');
            if (!geoResponse.ok) throw new Error('Could not detect location');
            const geo = await geoResponse.json();

            const lat = geo.latitude;
            const lon = geo.longitude;
            const city = geo.city || '';
            const region = geo.region || '';
            locationEl.textContent = city && region ? `${city}, ${region}` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

            content.innerHTML = '<div class="loading">Loading weather data...</div>';

            // Step 2: Get NWS grid point for this location
            const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
                headers: { 'User-Agent': 'WebInfotainment' }
            });
            if (!pointsResponse.ok) throw new Error('NWS does not cover this location');
            const points = await pointsResponse.json();

            const forecastUrl = points.properties.forecast;
            const nwsCity = points.properties.relativeLocation?.properties?.city;
            const nwsState = points.properties.relativeLocation?.properties?.state;
            if (nwsCity && nwsState) {
                locationEl.textContent = `${nwsCity}, ${nwsState}`;
            }

            // Step 3: Fetch the forecast
            const forecastResponse = await fetch(forecastUrl, {
                headers: { 'User-Agent': 'WebInfotainment' }
            });
            if (!forecastResponse.ok) throw new Error('Could not load forecast');
            const forecast = await forecastResponse.json();

            this.displayWeather(forecast.properties.periods);
        } catch (error) {
            console.error('Weather error:', error);
            content.innerHTML = `
                <div class="weather-error">
                    <p>${this.escapeHtml(error.message || 'Unable to load weather data.')}</p>
                    <p>The NWS API only covers US locations.</p>
                    <button class="weather-retry-btn" id="weather-retry">Retry</button>
                </div>
            `;
            document.getElementById('weather-retry').addEventListener('click', () => {
                this.loadWeather();
            });
        }
    }

    displayWeather(periods) {
        const content = document.getElementById('weather-content');
        if (!periods || periods.length === 0) {
            content.innerHTML = '<div class="loading">No forecast data available.</div>';
            return;
        }

        const current = periods[0];

        // Build current weather section
        let html = `
            <div class="weather-current">
                <div class="weather-current-icon">
                    <img src="${this.escapeHtml(current.icon)}" alt="${this.escapeHtml(current.shortForecast)}">
                </div>
                <div class="weather-current-info">
                    <div class="weather-current-temp">${current.temperature}&deg;${this.escapeHtml(current.temperatureUnit)}</div>
                    <div class="weather-current-desc">${this.escapeHtml(current.name)} &mdash; ${this.escapeHtml(current.shortForecast)}</div>
                    <div class="weather-current-details">
                        <span>Wind: ${this.escapeHtml(current.windSpeed)} ${this.escapeHtml(current.windDirection)}</span>
                    </div>
                    <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.95rem;">${this.escapeHtml(current.detailedForecast)}</p>
                </div>
            </div>
        `;

        // Build forecast grid (remaining periods)
        html += '<div class="weather-forecast-grid">';
        for (let i = 1; i < periods.length; i++) {
            const period = periods[i];
            const nightClass = period.isDaytime ? '' : ' night';
            html += `
                <div class="weather-forecast-card${nightClass}">
                    <h4>${this.escapeHtml(period.name)}</h4>
                    <img src="${this.escapeHtml(period.icon)}" alt="${this.escapeHtml(period.shortForecast)}">
                    <div class="forecast-temp">${period.temperature}&deg;${this.escapeHtml(period.temperatureUnit)}</div>
                    <div class="forecast-desc">${this.escapeHtml(period.shortForecast)}</div>
                    <div class="forecast-wind">${this.escapeHtml(period.windSpeed)} ${this.escapeHtml(period.windDirection)}</div>
                </div>
            `;
        }
        html += '</div>';

        content.innerHTML = html;
    }

    // Games Page
    setupGamesPage() {
        // Game selection cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                this.openGame(game);
            });
        });

        // Sudoku controls
        document.getElementById('sudoku-back').addEventListener('click', () => this.closeGame());
        document.getElementById('sudoku-new').addEventListener('click', () => this.newSudoku());
        document.getElementById('sudoku-check').addEventListener('click', () => this.checkSudoku());
        document.getElementById('sudoku-numpad').addEventListener('click', (e) => {
            const btn = e.target.closest('.numpad-btn');
            if (btn) this.sudokuInput(parseInt(btn.dataset.num));
        });

        // Match 3 controls
        document.getElementById('match3-back').addEventListener('click', () => this.closeGame());
        document.getElementById('match3-new').addEventListener('click', () => this.newMatch3());
    }

    openGame(game) {
        document.getElementById('games-menu').classList.add('hidden');
        if (game === 'sudoku') {
            document.getElementById('sudoku-game').classList.remove('hidden');
            if (this.sudoku.board.length === 0) this.newSudoku();
        } else if (game === 'match3') {
            document.getElementById('match3-game').classList.remove('hidden');
            if (this.match3.board.length === 0) this.newMatch3();
        }
    }

    closeGame() {
        document.getElementById('sudoku-game').classList.add('hidden');
        document.getElementById('match3-game').classList.add('hidden');
        document.getElementById('games-menu').classList.remove('hidden');
    }

    // --- Sudoku ---
    newSudoku() {
        const difficulty = document.getElementById('sudoku-difficulty').value;
        const removals = { easy: 36, medium: 46, hard: 54 };
        this.sudoku.solution = this.generateSudokuSolution();
        this.sudoku.board = this.sudoku.solution.map(row => [...row]);
        this.sudoku.given = Array.from({ length: 9 }, () => Array(9).fill(false));
        this.sudoku.selectedCell = null;

        // Remove cells
        let toRemove = removals[difficulty] || 46;
        const cells = [];
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                cells.push([r, c]);
        this.shuffleArray(cells);
        for (let i = 0; i < toRemove && i < cells.length; i++) {
            const [r, c] = cells[i];
            this.sudoku.board[r][c] = 0;
        }

        // Mark given cells
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                this.sudoku.given[r][c] = this.sudoku.board[r][c] !== 0;

        document.getElementById('sudoku-message').textContent = '';
        document.getElementById('sudoku-message').className = 'game-message';
        this.renderSudoku();
    }

    generateSudokuSolution() {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillSudokuBoard(board);
        return board;
    }

    fillSudokuBoard(board) {
        const empty = this.findEmptySudokuCell(board);
        if (!empty) return true;
        const [row, col] = empty;
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(nums);
        for (const num of nums) {
            if (this.isValidSudokuPlacement(board, row, col, num)) {
                board[row][col] = num;
                if (this.fillSudokuBoard(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    findEmptySudokuCell(board) {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (board[r][c] === 0) return [r, c];
        return null;
    }

    isValidSudokuPlacement(board, row, col, num) {
        for (let c = 0; c < 9; c++)
            if (board[row][c] === num) return false;
        for (let r = 0; r < 9; r++)
            if (board[r][col] === num) return false;
        const boxR = Math.floor(row / 3) * 3;
        const boxC = Math.floor(col / 3) * 3;
        for (let r = boxR; r < boxR + 3; r++)
            for (let c = boxC; c < boxC + 3; c++)
                if (board[r][c] === num) return false;
        return true;
    }

    renderSudoku() {
        const container = document.getElementById('sudoku-board');
        container.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (this.sudoku.given[r][c]) {
                    cell.classList.add('given');
                } else if (this.sudoku.board[r][c] !== 0) {
                    cell.classList.add('user-input');
                }
                if (this.sudoku.selectedCell &&
                    this.sudoku.selectedCell[0] === r && this.sudoku.selectedCell[1] === c) {
                    cell.classList.add('selected');
                } else if (this.sudoku.selectedCell) {
                    const [sr, sc] = this.sudoku.selectedCell;
                    if (sr === r || sc === c ||
                        (Math.floor(sr / 3) === Math.floor(r / 3) &&
                         Math.floor(sc / 3) === Math.floor(c / 3))) {
                        cell.classList.add('highlighted');
                    }
                }
                cell.textContent = this.sudoku.board[r][c] || '';
                cell.addEventListener('click', () => this.selectSudokuCell(r, c));
                container.appendChild(cell);
            }
        }
    }

    selectSudokuCell(row, col) {
        if (this.sudoku.given[row][col]) {
            this.sudoku.selectedCell = [row, col];
        } else {
            this.sudoku.selectedCell = [row, col];
        }
        this.renderSudoku();
    }

    sudokuInput(num) {
        if (!this.sudoku.selectedCell) return;
        const [r, c] = this.sudoku.selectedCell;
        if (this.sudoku.given[r][c]) return;
        this.sudoku.board[r][c] = num === 0 ? 0 : num;
        this.renderSudoku();
    }

    checkSudoku() {
        const msgEl = document.getElementById('sudoku-message');
        let hasEmpty = false;
        let hasError = false;

        // Clear previous error highlights
        const cells = document.querySelectorAll('.sudoku-cell');

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.sudoku.board[r][c] === 0) {
                    hasEmpty = true;
                } else if (this.sudoku.board[r][c] !== this.sudoku.solution[r][c]) {
                    hasError = true;
                    const idx = r * 9 + c;
                    if (cells[idx]) cells[idx].classList.add('error');
                }
            }
        }

        if (hasError) {
            msgEl.textContent = 'Some numbers are incorrect!';
            msgEl.className = 'game-message error';
        } else if (hasEmpty) {
            msgEl.textContent = 'Looking good so far! Keep going.';
            msgEl.className = 'game-message';
        } else {
            msgEl.textContent = 'Congratulations! Puzzle solved!';
            msgEl.className = 'game-message success';
        }
    }

    // --- Match 3 ---
    newMatch3() {
        this.match3.score = 0;
        this.match3.selectedCell = null;
        this.match3.animating = false;
        document.getElementById('match3-score').textContent = '0';
        document.getElementById('match3-message').textContent = '';
        document.getElementById('match3-message').className = 'game-message';
        this.match3.board = [];
        const { rows, cols, colors } = this.match3;
        for (let r = 0; r < rows; r++) {
            this.match3.board[r] = [];
            for (let c = 0; c < cols; c++) {
                this.match3.board[r][c] = this.randomMatch3Color();
            }
        }
        // Remove initial matches
        let safety = 0;
        while (this.findMatch3Matches().length > 0 && safety < 100) {
            const matches = this.findMatch3Matches();
            for (const [r, c] of matches) {
                this.match3.board[r][c] = this.randomMatch3Color();
            }
            safety++;
        }
        this.renderMatch3();
    }

    randomMatch3Color() {
        const { colors } = this.match3;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    renderMatch3() {
        const container = document.getElementById('match3-board');
        container.innerHTML = '';
        const { rows, cols, board } = this.match3;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'match3-cell';
                cell.style.backgroundColor = board[r][c];
                if (this.match3.selectedCell &&
                    this.match3.selectedCell[0] === r &&
                    this.match3.selectedCell[1] === c) {
                    cell.classList.add('selected');
                }
                cell.addEventListener('click', () => this.match3Click(r, c));
                container.appendChild(cell);
            }
        }
    }

    match3Click(row, col) {
        if (this.match3.animating) return;

        if (!this.match3.selectedCell) {
            this.match3.selectedCell = [row, col];
            this.renderMatch3();
            return;
        }

        const [sr, sc] = this.match3.selectedCell;
        if (sr === row && sc === col) {
            this.match3.selectedCell = null;
            this.renderMatch3();
            return;
        }

        // Check adjacency
        const dr = Math.abs(sr - row);
        const dc = Math.abs(sc - col);
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
            this.match3Swap(sr, sc, row, col);
        } else {
            this.match3.selectedCell = [row, col];
            this.renderMatch3();
        }
    }

    async match3Swap(r1, c1, r2, c2) {
        this.match3.animating = true;
        this.match3.selectedCell = null;
        const { board } = this.match3;

        // Swap
        [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
        this.renderMatch3();

        const matches = this.findMatch3Matches();
        if (matches.length === 0) {
            // Swap back
            await this.delay(200);
            [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
            this.renderMatch3();
            this.match3.animating = false;
            return;
        }

        await this.match3ResolveMatches();
        this.match3.animating = false;
    }

    async match3ResolveMatches() {
        let matches = this.findMatch3Matches();
        while (matches.length > 0) {
            // Score
            this.match3.score += matches.length * 10;
            document.getElementById('match3-score').textContent = this.match3.score;

            // Animate matched cells
            const container = document.getElementById('match3-board');
            const cells = container.children;
            const { cols } = this.match3;
            for (const [r, c] of matches) {
                const idx = r * cols + c;
                if (cells[idx]) cells[idx].classList.add('matched');
            }
            await this.delay(300);

            // Remove matches
            for (const [r, c] of matches) {
                this.match3.board[r][c] = null;
            }

            // Drop tiles
            this.match3DropTiles();
            this.match3FillEmpty();
            this.renderMatch3();

            // Animate drops
            const newCells = container.children;
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < this.match3.rows; r++) {
                    const idx = r * cols + c;
                    if (newCells[idx]) newCells[idx].classList.add('dropping');
                }
            }
            await this.delay(300);

            matches = this.findMatch3Matches();
        }
    }

    findMatch3Matches() {
        const { rows, cols, board } = this.match3;
        const matched = new Set();

        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 2; c++) {
                const color = board[r][c];
                if (color && board[r][c + 1] === color && board[r][c + 2] === color) {
                    let end = c + 2;
                    while (end + 1 < cols && board[r][end + 1] === color) end++;
                    for (let i = c; i <= end; i++) matched.add(`${r},${i}`);
                }
            }
        }

        // Vertical
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows - 2; r++) {
                const color = board[r][c];
                if (color && board[r + 1][c] === color && board[r + 2][c] === color) {
                    let end = r + 2;
                    while (end + 1 < rows && board[end + 1][c] === color) end++;
                    for (let i = r; i <= end; i++) matched.add(`${i},${c}`);
                }
            }
        }

        return Array.from(matched).map(s => s.split(',').map(Number));
    }

    match3DropTiles() {
        const { rows, cols, board } = this.match3;
        for (let c = 0; c < cols; c++) {
            let writeRow = rows - 1;
            for (let r = rows - 1; r >= 0; r--) {
                if (board[r][c] !== null) {
                    board[writeRow][c] = board[r][c];
                    if (writeRow !== r) board[r][c] = null;
                    writeRow--;
                }
            }
            for (let r = writeRow; r >= 0; r--) {
                board[r][c] = null;
            }
        }
    }

    match3FillEmpty() {
        const { rows, cols, board } = this.match3;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === null) {
                    board[r][c] = this.randomMatch3Color();
                }
            }
        }
    }

    // Utility helpers for games
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
