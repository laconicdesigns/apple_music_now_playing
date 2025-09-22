// Firefox-optimized background script (persistent background page)

// Global state management
let trackHistory = [];
let websocket = null;
let websocketConnected = false;

// Firefox compatibility layer - handles API differences
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

console.log('AMP Now Playing Getter Firefox extension loaded');

// Auto-connect on extension startup if enabled
setTimeout(() => {
  checkAutoConnect();
}, 2000); // Wait for extension to fully initialize

// Central message router for all extension communication
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);
  
  if (message.type === 'TRACK_CHANGED') {
    handleTrackChanged(message, sender);
    sendResponse({ success: true });
  } else if (message.type === 'CONNECT_WEBSOCKET') {
    connectWebSocket(message.url, sendResponse);
    return true; // Keep message channel open for async response
  } else if (message.type === 'DISCONNECT_WEBSOCKET') {
    disconnectWebSocket();
    sendResponse({ success: true });
  } else if (message.type === 'TEST_WEBSOCKET') {
    testWebSocket(message.track, sendResponse);
    return true;
  } else if (message.type === 'TEST_FILE_WRITE') {
    testFileWrite(message.track, message.filePath, message.format, sendResponse);
    return true;
  } else if (message.type === 'SAVE_TO_SPECIFIC_FILE') {
    saveToSpecificFile(message.content, message.filePath, sendResponse);
    return true;
  }
});

// Process new track data from content script
function handleTrackChanged(message, sender) {
  // Add to history with metadata
  trackHistory.unshift({
    ...message.track,
    trackText: message.trackText,
    tabId: sender?.tab?.id || 'unknown'
  });
  
  // Maintain reasonable history size for memory management
  if (trackHistory.length > 100) {
    trackHistory = trackHistory.slice(0, 100);
  }
  
  // Persist to browser storage for popup access
  browserAPI.storage.local.set({ 
    trackHistory: trackHistory,
    lastTrack: message.track 
  });
  
  console.log('Track saved:', message.trackText);
  
  // Distribute track data to configured outputs
  sendToWebSocket(message.track);
  writeToFile(message.track);
}

// WebSocket connection management with full lifecycle handling
function connectWebSocket(url, sendResponse) {
  try {
    // Clean up existing connection
    if (websocket) {
      websocket.close();
    }
    
    console.log('Attempting to connect to:', url);
    websocket = new WebSocket(url);
    
    websocket.onopen = () => {
      websocketConnected = true;
      browserAPI.storage.local.set({ websocketConnected: true });
      console.log('WebSocket connected to:', url);
      sendResponse({ success: true });
    };
    
    websocket.onclose = (event) => {
      websocketConnected = false;
      browserAPI.storage.local.set({ websocketConnected: false });
      console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      websocketConnected = false;
      browserAPI.storage.local.set({ websocketConnected: false });
      sendResponse({ success: false, error: 'Connection failed' });
    };
    
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    sendResponse({ success: false, error: error.message });
  }
}

function disconnectWebSocket() {
  if (websocket) {
    websocket.close(1000, 'User disconnected');
    websocket = null;
  }
  websocketConnected = false;
  browserAPI.storage.local.set({ websocketConnected: false });
  console.log('WebSocket manually disconnected');
}

// Transmit track data to WebSocket server with error recovery
function sendToWebSocket(track) {
  if (!websocketConnected || !websocket || websocket.readyState !== WebSocket.OPEN) {
    return;
  }
  
  try {
    // Structured data format for external consumption
    const data = {
      type: 'amp_now_playing',
      timestamp: track.timestamp,
      track: {
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork,
        artworkInfo: track.artworkInfo,
        allArtwork: track.allArtwork
      },
      source: 'amp-now-playing-getter-firefox-extension'
    };
    
    websocket.send(JSON.stringify(data));
    // console.log('Sent to WebSocket:', data);
  } catch (error) {
    console.error('Failed to send to WebSocket:', error);
    // Auto-disconnect on send failure
    websocketConnected = false;
    browserAPI.storage.local.set({ websocketConnected: false });
  }
}

function testWebSocket(track, sendResponse) {
  if (!websocketConnected || !websocket || websocket.readyState !== WebSocket.OPEN) {
    sendResponse({ success: false, error: 'WebSocket not connected' });
    return;
  }
  
  try {
    const testData = {
      type: 'test',
      timestamp: new Date().toISOString(),
      track: track,
      message: 'Test message from Apple Music Now Playing Firefox extension',
      source: 'firefox-extension'
    };
    
    websocket.send(JSON.stringify(testData));
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Auto-connect functionality for startup WebSocket connection
function checkAutoConnect() {
  browserAPI.storage.local.get(['autoConnect', 'websocketUrl'], (result) => {
    if (result.autoConnect && result.websocketUrl) {
      console.log('Auto-connecting to WebSocket:', result.websocketUrl);
      
      connectWebSocket(result.websocketUrl, (response) => {
        if (response && response.success) {
          console.log('Auto-connect successful');
        } else {
          console.log('Auto-connect failed:', response);
        }
      });
    } else {
      console.log('Auto-connect disabled or no URL configured');
    }
  });
}

// File operations using Firefox's enhanced downloads API
function writeToFile(track) {
  browserAPI.storage.local.get(['filePath', 'fileFormat', 'autoSaveEnabled'], (result) => {
    if (!result.filePath || !result.autoSaveEnabled) {
      return; // Skip if not configured
    }
    
    const format = result.fileFormat || 'detailed';
    const content = formatTrackData(track, format);
    
    // Firefox has better file handling - we can append to files
    appendToFile(content, result.filePath);
  });
}

function formatTrackData(track, format) {
  const timestamp = new Date().toLocaleString();
  
  switch (format) {
    case 'simple':
      return `${track.artist} - ${track.title}\n`;
    case 'json':
      return JSON.stringify({
        timestamp: track.timestamp,
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork,
        artworkInfo: track.artworkInfo,
        allArtwork: track.allArtwork
      }) + '\n';
    case 'detailed':
    default:
      const artworkInfo = track.artworkInfo ? ` | Artwork: ${track.artworkInfo.sizes} (${track.artworkInfo.src})` : '';
      return `[${timestamp}] ${track.title} - ${track.artist} (${track.album})${artworkInfo}\n`;
  }
}

function appendToFile(content, filePath) {
  // Firefox approach: use downloads API with better control
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Extract filename from path
  const filename = filePath.split(/[\\\/]/).pop() || 'now_playing.txt';
  
  browserAPI.downloads.download({
    url: url,
    filename: filename,
    conflictAction: 'uniquify',
    saveAs: false
  }, (downloadId) => {
    if (browserAPI.runtime.lastError) {
      console.error('Download failed:', browserAPI.runtime.lastError);
    } else {
      console.log('Track appended to file:', filename);
    }
    URL.revokeObjectURL(url);
  });
}

// Enhanced file operations for Firefox
function saveToSpecificFile(content, filePath, sendResponse) {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    browserAPI.downloads.download({
      url: url,
      filename: filePath,
      saveAs: true, // Let user choose location
      conflictAction: 'prompt'
    }, (downloadId) => {
      URL.revokeObjectURL(url);
      if (browserAPI.runtime.lastError) {
        sendResponse({ success: false, error: browserAPI.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

function testFileWrite(track, filePath, format, sendResponse) {
  if (!filePath) {
    sendResponse({ success: false, error: 'No file path specified' });
    return;
  }
  
  try {
    const content = formatTrackData(track, format);
    const filename = filePath.split(/[\\\/]/).pop() || 'test_now_playing.txt';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    browserAPI.downloads.download({
      url: url,
      filename: `test_${filename}`,
      saveAs: true
    }, (downloadId) => {
      URL.revokeObjectURL(url);
      if (browserAPI.runtime.lastError) {
        sendResponse({ success: false, error: browserAPI.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Function to export track history (keeping original functionality)
function exportTrackHistory() {
  return trackHistory.map(track => 
    `${track.timestamp} | ${track.title} - ${track.artist} (${track.album})`
  ).join('\n');
}

// Firefox-specific: Handle extension lifecycle
browserAPI.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  // Check auto-connect setting and connect if enabled
  checkAutoConnect();
});

browserAPI.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings for new installation
    browserAPI.storage.local.set({
      autoSaveEnabled: false,
      websocketUrl: 'ws://localhost:8080',
      fileFormat: 'detailed',
      autoConnect: false
    });
  } else if (details.reason === 'update') {
    // Check auto-connect after update
    setTimeout(() => {
      checkAutoConnect();
    }, 1000);
  }
});