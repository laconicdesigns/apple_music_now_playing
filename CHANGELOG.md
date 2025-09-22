# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-21

### Initial Release

#### Added
- Real-time track detection using MediaSession API
- WebSocket streaming for external integration
- File export in multiple formats (simple, detailed, JSON)
- Automatic artwork extraction with size optimization
- Track history with 100-item limit
- Auto-connect functionality for WebSocket servers
- Firefox-optimized popup interface with status indicators
- Comprehensive error handling and recovery
- Support for Apple Music single-page app navigation

#### Features
- **Track Detection**: Monitors Apple Music for track changes every 2 seconds
- **WebSocket Support**: Real-time streaming to external applications
- **File Operations**: Save individual tracks or full history
- **Artwork Processing**: Automatically selects highest quality artwork
- **Settings Persistence**: Saves user preferences across sessions
- **Status Monitoring**: Visual indicators for connection and detection status

#### Technical
- Firefox Manifest V2 compatibility
- Persistent background page for reliable operation
- Cross-browser API compatibility layer
- Robust error handling for Apple Music instability
- Memory-efficient history management
- Clean extension lifecycle management

### Security
- Minimal permission model (activeTab, storage, downloads)
- No external data transmission without user configuration
- Personal data sanitization for open source release

---

## Future Releases

### Planned Features
- Chrome / Edge extension ports
- Additional export formats
- Integration examples and tutorials
- Performance optimizations

### Known Issues
- WebSocket reconnection requires manual intervention

---

**Note**: Version numbers follow [Semantic Versioning](https://semver.org/)