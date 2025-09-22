// Firefox-optimized popup script

// Firefox compatibility layer - handles API differences
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', function() {
  // UI element references - organized by functional groups
  const historyEl = document.getElementById('history');
  
  // Status display elements (new status section)
  const trackStatus = document.getElementById('track-status');
  const websocketConnectionStatus = document.getElementById('websocket-connection-status');
  const lastTrackInfo = document.getElementById('last-track-info');
  
  // WebSocket configuration elements
  const websocketUrl = document.getElementById('websocket-url');
  const websocketStatus = document.getElementById('websocket-status');
  const autoConnect = document.getElementById('auto-connect');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const testBtn = document.getElementById('testBtn');
  
  // File operation elements
  const autoSave = document.getElementById('auto-save');
  const filePath = document.getElementById('file-path');
  const fileFormat = document.getElementById('file-format');
  const saveToFileBtn = document.getElementById('saveToFileBtn');
  const testFileBtn = document.getElementById('testFileBtn');

  // Load saved settings and data
  loadSettings();
  loadCurrentTrack();
  loadHistory();
  
  // WebSocket events
  connectBtn.addEventListener('click', connectWebSocket);
  disconnectBtn.addEventListener('click', disconnectWebSocket);
  testBtn.addEventListener('click', testWebSocket);
  
  // File events
  saveToFileBtn.addEventListener('click', saveCurrentToFile);
  testFileBtn.addEventListener('click', testFileWrite);
  
  // Settings change events
  websocketUrl.addEventListener('input', saveSettings);
  autoConnect.addEventListener('change', saveSettings);
  autoSave.addEventListener('change', saveSettings);
  filePath.addEventListener('input', saveSettings);
  fileFormat.addEventListener('change', saveSettings);

  function loadSettings() {
    browserAPI.storage.local.get([
      'websocketUrl', 'autoConnect', 'websocketConnected',
      'autoSaveEnabled', 'filePath', 'fileFormat'
    ], (result) => {
      websocketUrl.value = result.websocketUrl || 'ws://localhost:8080';
      autoConnect.checked = result.autoConnect || false;
      autoSave.checked = result.autoSaveEnabled || false;
      filePath.value = result.filePath || 'now_playing.txt';
      fileFormat.value = result.fileFormat || 'detailed';
      
      if (result.websocketConnected) {
        websocketStatus.className = 'status-indicator connected';
        websocketConnectionStatus.textContent = 'Connected';
        websocketConnectionStatus.className = 'status-value connected';
      } else {
        websocketStatus.className = 'status-indicator disconnected';
        websocketConnectionStatus.textContent = 'Disconnected';
        websocketConnectionStatus.className = 'status-value disconnected';
      }
      
      console.log('Settings loaded:', result);
    });
  }

  function saveSettings() {
    const settings = {
      websocketUrl: websocketUrl.value,
      autoConnect: autoConnect.checked,
      autoSaveEnabled: autoSave.checked,
      filePath: filePath.value,
      fileFormat: fileFormat.value
    };
    
    browserAPI.storage.local.set(settings);
    console.log('Settings saved:', settings);
  }

  // Query content script for current track status and update UI
  function loadCurrentTrack() {
    console.log('Checking current track status...');
    
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      browserAPI.tabs.sendMessage(activeTab.id, { type: 'GET_CURRENT_TRACK' })
        .then((response) => {
          if (response && response.track) {
            // Track detection is working
            trackStatus.textContent = 'Active';
            trackStatus.className = 'status-value active';
            lastTrackInfo.textContent = `${response.track.artist} - ${response.track.title}`;
          } else {
            // No track currently playing
            console.log('No track currently playing');
            trackStatus.textContent = 'No track playing';
            trackStatus.className = 'status-value inactive';
            lastTrackInfo.textContent = 'None detected';
          }
        })
        .catch((error) => {
          // Content script not responding - likely not on Apple Music tab
          console.error('Failed to get current track:', error);
          trackStatus.textContent = 'Extension not loaded';
          trackStatus.className = 'status-value inactive';
          lastTrackInfo.textContent = 'Refresh Apple Music';
        });
    });
  }

  function loadHistory() {
    browserAPI.storage.local.get(['trackHistory'], (result) => {
      const history = result.trackHistory || [];
      
      // Clear existing content safely
      historyEl.textContent = '';
      
      if (history.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.color = '#888';
        emptyDiv.style.fontSize = '12px';
        emptyDiv.textContent = 'No tracks recorded yet';
        historyEl.appendChild(emptyDiv);
        return;
      }

      // Create history items using DOM methods for security
      history.slice(0, 10).forEach(track => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Create title and artist line
        const titleLine = document.createElement('div');
        const titleStrong = document.createElement('strong');
        titleStrong.textContent = track.title || 'Unknown Title';
        titleLine.appendChild(titleStrong);
        titleLine.appendChild(document.createTextNode(' - ' + (track.artist || 'Unknown Artist')));
        titleLine.appendChild(document.createElement('br'));
        
        // Create album line
        const albumSmall = document.createElement('small');
        albumSmall.textContent = track.album || 'Unknown Album';
        titleLine.appendChild(albumSmall);
        titleLine.appendChild(document.createElement('br'));
        
        // Create timestamp
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = new Date(track.timestamp).toLocaleString();
        
        historyItem.appendChild(titleLine);
        historyItem.appendChild(timestampDiv);
        historyEl.appendChild(historyItem);
      });
    });
  }

  // WebSocket functions
  function connectWebSocket() {
    if (!websocketUrl.value.trim()) {
      alert('Please enter a WebSocket URL');
      return;
    }

    connectBtn.textContent = 'Connecting...';
    
    browserAPI.runtime.sendMessage({
      type: 'CONNECT_WEBSOCKET',
      url: websocketUrl.value.trim()
    }).then((response) => {
      if (response && response.success) {
        websocketStatus.className = 'status-indicator connected';
        websocketConnectionStatus.textContent = 'Connected';
        websocketConnectionStatus.className = 'status-value connected';
        connectBtn.textContent = 'Connected';
        setTimeout(() => {
          connectBtn.textContent = 'Connect';
        }, 2000);
      } else {
        connectBtn.textContent = 'Failed';
        setTimeout(() => {
          connectBtn.textContent = 'Connect';
        }, 2000);
      }
    }).catch((error) => {
      console.error('WebSocket connection failed:', error);
      connectBtn.textContent = 'Error';
      setTimeout(() => {
        connectBtn.textContent = 'Connect';
      }, 2000);
    });
  }

  function disconnectWebSocket() {
    browserAPI.runtime.sendMessage({
      type: 'DISCONNECT_WEBSOCKET'
    }).then(() => {
      websocketStatus.className = 'status-indicator disconnected';
      websocketConnectionStatus.textContent = 'Disconnected';
      websocketConnectionStatus.className = 'status-value disconnected';
      disconnectBtn.textContent = 'Disconnected';
      setTimeout(() => {
        disconnectBtn.textContent = 'Disconnect';
      }, 2000);
    });
  }

  function testWebSocket() {
    browserAPI.storage.local.get(['lastTrack'], (result) => {
      if (!result.lastTrack) {
        alert('No current track to test with');
        return;
      }

      testBtn.textContent = 'Testing...';
      
      browserAPI.runtime.sendMessage({
        type: 'TEST_WEBSOCKET',
        track: result.lastTrack
      }).then((response) => {
        if (response && response.success) {
          testBtn.textContent = 'Sent!';
          setTimeout(() => {
            testBtn.textContent = 'Test';
          }, 2000);
        } else {
          testBtn.textContent = 'Failed';
          setTimeout(() => {
            testBtn.textContent = 'Test';
          }, 2000);
        }
      });
    });
  }

  // File functions
  function saveCurrentToFile() {
    browserAPI.storage.local.get(['lastTrack', 'fileFormat'], (result) => {
      if (!result.lastTrack) {
        alert('No current track to save');
        return;
      }

      const track = result.lastTrack;
      const format = result.fileFormat || 'detailed';
      const content = formatTrackData(track, format);
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      browserAPI.downloads.download({
        url: url,
        filename: filePath.value || 'current_track.txt',
        saveAs: true
      }).then(() => {
        saveToFileBtn.textContent = 'Saved!';
        setTimeout(() => {
          saveToFileBtn.textContent = 'Save Current';
        }, 1500);
        URL.revokeObjectURL(url);
      });
    });
  }

  function testFileWrite() {
    browserAPI.storage.local.get(['lastTrack'], (result) => {
      if (!result.lastTrack) {
        alert('No current track to test with');
        return;
      }

      testFileBtn.textContent = 'Testing...';
      
      browserAPI.runtime.sendMessage({
        type: 'TEST_FILE_WRITE',
        track: result.lastTrack,
        filePath: filePath.value,
        format: fileFormat.value
      }).then((response) => {
        if (response && response.success) {
          testFileBtn.textContent = 'Written!';
          setTimeout(() => {
            testFileBtn.textContent = 'Test Write';
          }, 2000);
        } else {
          testFileBtn.textContent = 'Failed';
          setTimeout(() => {
            testFileBtn.textContent = 'Test Write';
          }, 2000);
          alert('Failed to write to file: ' + (response ? response.error : 'Unknown error'));
        }
      });
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
          album: track.album
        }) + '\n';
      case 'detailed':
      default:
        return `[${timestamp}] ${track.title} - ${track.artist} (${track.album})\n`;
    }
  }

  // Auto-refresh all status information periodically
  setInterval(() => {
    loadCurrentTrack();
    loadHistory();
    
    // Sync WebSocket status from background script
    browserAPI.storage.local.get(['websocketConnected'], (result) => {
      if (result.websocketConnected) {
        websocketConnectionStatus.textContent = 'Connected';
        websocketConnectionStatus.className = 'status-value connected';
      } else {
        websocketConnectionStatus.textContent = 'Disconnected';
        websocketConnectionStatus.className = 'status-value disconnected';
      }
    });
  }, 5000);
});