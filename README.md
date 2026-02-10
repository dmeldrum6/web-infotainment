# Infotainment System

A touch-friendly, fullscreen infotainment web application built with HTML, CSS, and Vanilla JavaScript. Features internet radio streaming and live IPTV channels with an intuitive interface designed for in-vehicle or kiosk use.

## Features

### Music/Radio Page
- Browse top 50 internet radio stations from around the world
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

### Additional Pages (Placeholders)
- Books - E-books and audiobooks (coming soon)
- Games - Gaming entertainment (coming soon)
- Maps - GPS navigation (coming soon)
- Weather - Weather forecast (coming soon)

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

### Fullscreen Mode
- Click the fullscreen icon in the top-right corner
- Press ESC to exit fullscreen mode

## Technical Details

### APIs Used

1. **Radio Browser API** (`https://api.radio-browser.info/`)
   - Endpoint: `/json/stations/topvote/50` - Top 50 stations by votes
   - Endpoint: `/json/url/{stationuuid}` - Track station clicks

2. **IPTV-org API** (`https://iptv-org.github.io/api/`)
   - Endpoint: `/streams.json` - List of live TV streams

### File Structure
```
web-infotainment/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── app.js          # Application logic and API integration
└── README.md       # Documentation
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

## Future Enhancements

- Books: Integrate with e-book and audiobook APIs
- Games: Browser-based games and entertainment
- Maps: GPS navigation with mapping APIs
- Weather: Real-time weather information
- Settings: Customize theme, default volume, favorites
- Favorites: Save favorite stations and channels
- Recent: Track recently played content

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Radio Browser](https://www.radio-browser.info/) for the internet radio database
- [IPTV-org](https://github.com/iptv-org) for the TV channel database