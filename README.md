# Apple Music Now Playing Firefox Extension

A Firefox extension that extracts "now playing" track information from Apple Music and streams it in real-time via WebSocket connections or saves it to flat files.

## ✨ Features

- **Real-time Track Detection** - Automatically detects track changes on Apple Music using the MediaSession API
- **WebSocket Streaming** - Send track data to external applications in real-time
- **File Export** - Save track history to text files in multiple formats
- **Artwork Extraction** - Automatically finds and includes the highest quality album artwork
- **Auto-Connect** - Optionally connect to WebSocket servers on startup
- **Track History** - Maintains a history of recently played tracks
- **Multiple Formats** - Export data in simple, detailed, or JSON formats

## 🚀 Installation

### From Source (Developer Installation)

1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" 
4. Click "Load Temporary Add-on"
5. Navigate to the `firefox-extension` folder and select `manifest.json`

### Firefox Add-ons Store
*Coming soon - pending Mozilla review*

## 📖 Usage

### Basic Setup

1. **Open Apple Music** - Navigate to [music.apple.com](https://music.apple.com) and start playing music
2. **Open Extension** - Click the extension icon in your Firefox toolbar
3. **Check Status** - The status section will show if track detection is working

### WebSocket Integration

1. **Configure URL** - Enter your WebSocket server URL (e.g., `ws://localhost:8080`)
2. **Enable Auto-Connect** - Optionally enable automatic connection on startup
3. **Connect** - Click "Connect" to start streaming track data

#### WebSocket Data Format
```json
{
  "type": "amp_now_playing",
  "timestamp": "2025-09-21T10:30:00.000Z",
  "track": {
    "title": "Song Title",
    "artist": "Artist Name", 
    "album": "Album Name",
    "artwork": "https://...",
    "artworkInfo": {
      "src": "https://...",
      "sizes": "512x512",
      "width": 512,
      "height": 512
    },
    "allArtwork": [...]
  },
  "source": "apple-music-now-playing-firefox-extension"
}
```

### File Export

1. **Enable Auto-Save** - Toggle automatic file saving
2. **Set File Path** - Choose filename and location
3. **Select Format**:
   - **Simple**: `Artist - Title`
   - **Detailed**: `[Timestamp] Title - Artist (Album)`
   - **JSON**: Full structured data
4. **Manual Save** - Use "Save Current" to save individual tracks

## 🔧 Development

### WebSocket Server Example

Here's a simple Node.js WebSocket server to receive track data:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('Extension connected');
  
  ws.on('message', function incoming(data) {
    const trackData = JSON.parse(data);
    if (trackData.type === 'amp_now_playing') {
      console.log('Now Playing:', trackData.track.artist, '-', trackData.track.title);
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
```

### Building from Source

1. Clone the repository
2. Navigate to `firefox-extension/` directory
3. Load in Firefox using `about:debugging`
4. For distribution, use `web-ext build`

## 📋 Requirements

- **Firefox 91.0+** - Uses modern WebExtension APIs
- **Apple Music Account** - Requires active Apple Music subscription
- **Apple Music Web Player** - Must use music.apple.com (not the desktop app)

## 🔒 Privacy & Permissions

This extension only requests the minimum necessary permissions:

- `activeTab` - Communicate with the current Apple Music tab
- `storage` - Save settings and track history locally
- `downloads` - Save track data to files
- `https://music.apple.com/*` - Only access Apple Music website

**No data is sent to external servers unless you configure WebSocket connections.**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Firefox's `about:debugging`
5. Submit a pull request

## 📝 License

[LICENSE TYPE] - See [LICENSE](LICENSE) file for details

## 🐛 Troubleshooting

### Extension Not Working
- Ensure you're on music.apple.com (not the desktop app)
- Refresh the Apple Music tab
- Reload the extension in `about:debugging`

### WebSocket Connection Fails
- Check that your server is running and accessible
- Verify the WebSocket URL format (ws:// or wss://)
- Check browser console for error messages

### No Track Detection
- Make sure music is actually playing in Apple Music
- Some tracks may not have full metadata available
- Try playing a different song

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## ⭐ Support

If you find this extension useful, please consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs via GitHub Issues
- 💡 Suggesting features
- 🤝 Contributing code

---

**Note**: This extension is not affiliated with Apple Inc. Apple Music is a trademark of Apple Inc.