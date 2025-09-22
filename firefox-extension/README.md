# Apple Music Now Playing - Firefox Extension

🦊 **Firefox-Optimized Version** - Designed specifically for Firefox with enhanced features and better performance.

## 🚀 Firefox Installation

### Quick Install (Temporary):

1. **Open Firefox Add-ons Debug Page**
   - Type `about:debugging` in the address bar
   - Click "This Firefox" in the left sidebar

2. **Load Temporary Add-on**
   - Click "Load Temporary Add-on..."
   - Navigate to the `firefox-extension` folder
   - Select `manifest.json`
   - The extension will appear in your toolbar

### Permanent Install (Developer Mode):

1. **Package the Extension**
   ```bash
   cd firefox-extension
   zip -r apple-music-now-playing-firefox.zip *
   ```

2. **Install Unsigned Extension** (requires Firefox Developer Edition or Nightly)
   - Go to `about:config`
   - Set `xpinstall.signatures.required` to `false`
   - Drag the .zip file to Firefox to install

## 🎯 Firefox-Specific Features

### ✅ **Enhanced over Chrome Version:**
- **Better File Handling**: More flexible downloads and file management
- **Improved WebSocket Support**: Better connection handling and error recovery
- **Superior Clipboard Access**: More reliable copy/paste functionality
- **Persistent Background**: Uses background pages instead of service workers
- **Enhanced UI**: Firefox-themed interface with better animations

### 🔧 **Firefox Optimizations:**
- **Manifest V2**: Uses the stable WebExtensions API
- **Persistent Background Script**: Better reliability than service workers
- **Enhanced Downloads API**: More control over file operations
- **Better Error Handling**: More detailed error messages and recovery
- **Auto-reconnect**: WebSocket auto-reconnection features

## 🎵 Usage

### First Time Setup:
1. **Go to Apple Music**: Open https://music.apple.com
2. **Start Playing**: Play any song
3. **Open Extension**: Click the extension icon in toolbar
4. **Configure Settings**: 
   - Set WebSocket URL (e.g., `ws://localhost:8080`)
   - Set file path for saving (e.g., `now_playing.txt`)
   - Choose your preferred format

### Daily Use:
- Extension automatically monitors when Apple Music is playing
- Track changes are sent to WebSocket (if connected)
- Track info is saved to file (if auto-save enabled)
- Visual indicator shows monitoring status on Apple Music page

## ⚙️ Configuration Options

### WebSocket Settings:
- **URL**: Your WebSocket server address
- **Auto-connect**: Automatically connect on extension startup
- **Test Function**: Send test messages to verify connection

### File Settings:
- **Auto-save**: Automatically save track changes to file
- **File Path**: Where to save the file (downloads folder)
- **Format Options**:
  - **Simple**: `Artist - Title`
  - **Detailed**: `[Time] Title - Artist (Album)`
  - **JSON**: Full structured data

## 🔗 WebSocket Integration

The Firefox extension sends enhanced JSON data:

```json
{
  "type": "now_playing",
  "timestamp": "2025-09-21T10:30:15.123Z",
  "track": {
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name"
  },
  "source": "firefox-extension"
}
```

## 🐛 Troubleshooting

### Extension Not Working:
- **Refresh Apple Music**: Press F5 on the Apple Music tab
- **Reload Extension**: Go to `about:debugging` → Remove → Re-add
- **Check Console**: Press F12 → Console tab for error messages

### WebSocket Issues:
- **Check Server**: Make sure your WebSocket server is running
- **Firewall**: Ensure port is not blocked
- **URL Format**: Use `ws://` or `wss://` prefix

### File Saving Issues:
- **Downloads Permission**: Firefox may prompt for download permission
- **File Location**: Files save to your default downloads folder
- **Format**: Check that your chosen format is valid

## 🆚 Firefox vs Chrome Version

| Feature | Firefox | Chrome |
|---------|---------|---------|
| Manifest | V2 (Stable) | V3 (Newer) |
| Background | Persistent Page | Service Worker |
| File Access | Enhanced Downloads | Limited Downloads |
| WebSocket | Better Error Handling | Basic Support |
| Clipboard | Superior Support | Standard Support |
| UI | Firefox-themed | Chrome-themed |

## 🔧 Development

### Testing WebSocket:
```bash
cd ../websocket-example
npm install
npm start
```

### Debug Mode:
1. Open `about:debugging`
2. Click "Inspect" next to the extension
3. Use the developer tools to debug

### Manifest Updates:
- Edit `manifest.json`
- Click "Reload" in `about:debugging`
- No need to re-add the extension

## 🎨 Customization

The Firefox extension is designed to be easily customizable:
- Edit CSS in `popup.html` for styling changes
- Modify `content.js` for different monitoring behavior
- Update `background.js` for additional features

Perfect for Firefox users who want the best possible Apple Music monitoring experience! 🎵🦊