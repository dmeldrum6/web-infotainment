# Infotainment System

A touch-friendly, fullscreen infotainment web application built with HTML, CSS, and Vanilla JavaScript. Features internet radio streaming, live IPTV channels, an e-book library, browser-based games, and weather forecasts.

<img width="1919" height="801" alt="image" src="https://github.com/user-attachments/assets/214b8816-80b2-4c72-88fe-bdf23c2f89e0" />

## Features

### Music/Radio Page
- Browse top 500 internet radio stations from around the world
- Search stations by name or tags
- Filter by country and genre
- Full playback controls (play, pause, stop)
- Volume control
- Now playing display with station information
- Powered by [Radio Browser API](https://api.radio-browser.info/)

### IPTV Page
- Browse live TV channels from around the world
- Search channels by name or network
- Filter by country and category
- Full-screen video player
- Powered by [IPTV-org API](https://github.com/iptv-org/api)

### Books Page
- Browse e-books from Project Gutenberg
- Search by title or author
- Filter by language and topic/subject
- Pagination for browsing large result sets
- Book detail modal with cover image, author info, and metadata
- Download links in multiple formats (HTML, EPUB, MOBI, PDF, TXT)
- Powered by [Gutendex API](https://gutendex.com/)

### Games Page
- **Sudoku**: Three difficulty levels (Easy, Medium, Hard), algorithm-generated puzzles, number pad input, validation checking with error highlighting
- **Match-3**: 8x8 gem-swapping puzzle game with chain reactions, gravity physics, score tracking, and smooth cascade animations

### Weather Page
- Automatic location detection via IP geolocation
- Current conditions with temperature, weather icon, and wind details
- 14-day forecast grid with day/night distinction
- Powered by the [National Weather Service API](https://www.weather.gov/documentation/services-web-api) (US locations)

## User Interface

- **Touch-Optimized**: Large touch targets and gesture-friendly controls
- **Fullscreen Mode**: Toggle fullscreen for distraction-free experience
- **Dark Theme**: Easy on the eyes with a modern dark interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Tab Navigation**: Easy switching between different features

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for streaming content

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-infotainment
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or simply drag and drop `index.html` into your browser.

### Hosting

For local development, you can use a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have npx)
npx serve

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## Usage

### Music/Radio
1. Click on the "Music" tab
2. Browse available radio stations or use search/filters
3. Click on any station card to start playing
4. Use the playback controls at the bottom to control playback
5. Adjust volume with the slider

### IPTV
1. Click on the "IPTV" tab
2. Browse available TV channels or use search/filters
3. Click on any channel card to start streaming
4. Click the X button to close the video player

### Books
1. Click on the "Books" tab
2. Browse e-books or search by title/author
3. Use language and topic filters to narrow results
4. Click on a book card to view details and download links
5. Navigate pages with Previous/Next buttons

### Games
1. Click on the "Games" tab
2. Choose Sudoku or Match-3
3. **Sudoku**: Select a difficulty, tap a cell, and enter numbers via the number pad. Use "Check" to validate your progress
4. **Match-3**: Swap adjacent gems to form rows or columns of three or more matching colors

### Weather
1. Click on the "Weather" tab
2. Location is detected automatically
3. View current conditions and a 14-day forecast

### Fullscreen Mode
- Click the fullscreen icon in the top-right corner
- Press ESC to exit fullscreen mode

## Technical Details

### APIs Used

1. **Radio Browser API** (`https://api.radio-browser.info/`)
   - Endpoint: `/json/stations/topvote/500` - Top 500 stations by votes
   - Endpoint: `/json/url/{stationuuid}` - Track station clicks

2. **IPTV-org API** (`https://iptv-org.github.io/api/`)
   - Endpoint: `/channels.json` - Channel metadata
   - Endpoint: `/streams.json` - Live TV streams (HLS)

3. **Gutendex API** (`https://gutendex.com/`)
   - Endpoint: `/books/` - Browse and search Project Gutenberg e-books

4. **IP Geolocation API** (`https://ipapi.co/`)
   - Endpoint: `/json/` - Detect user location by IP

5. **National Weather Service API** (`https://api.weather.gov/`)
   - Endpoint: `/points/{lat},{lon}` - Get forecast grid
   - Endpoint: `/gridpoints/{office}/{x},{y}/forecast` - 14-day forecast

### File Structure
```
web-infotainment/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── app.js          # Application logic and API integration
├── README.md       # Documentation
└── LICENSE         # MIT License
```

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Note: Some IPTV streams may not work in all browsers due to codec support. HLS (m3u8) streams work best in Safari and browsers with native HLS support.

## Features in Detail

### Touch Optimization
- Minimum touch target size of 44x44 pixels
- Visual feedback on touch interactions
- No hover-dependent functionality
- Large, easy-to-tap buttons

### Responsive Grid
- Automatically adjusts to screen size
- Optimized layouts for mobile, tablet, and desktop
- Smooth scrolling and navigation

### Error Handling
- Graceful degradation when APIs are unavailable
- User-friendly error messages
- Fallback content for failed streams

## Known Limitations

- IPTV streams depend on third-party sources and availability may vary
- Some streams may be geo-restricted
- Network speed affects streaming quality
- Browser codec support varies for different stream formats
- Weather forecasts are limited to US locations (National Weather Service API)

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Radio Browser](https://www.radio-browser.info/) for the internet radio database
- [IPTV-org](https://github.com/iptv-org) for the TV channel database
- [Project Gutenberg](https://www.gutenberg.org/) and [Gutendex](https://gutendex.com/) for the e-book library
- [National Weather Service](https://www.weather.gov/) for weather data
