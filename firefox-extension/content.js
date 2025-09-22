// Firefox-optimized content script that runs directly on Apple Music tab
// This has access to navigator.mediaSession within the Apple Music context

console.log('Apple Music Now Playing Firefox extension loaded');

// Firefox compatibility layer - handles differences between browser APIs
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let lastTrack = null;
let isMonitoring = false;

// Enhanced track change detection using MediaSession API
function checkTrackChange() {
  if (!navigator.mediaSession || !navigator.mediaSession.metadata) {
    return null;
  }

  const metadata = navigator.mediaSession.metadata;
  
  // Find the largest artwork from available sizes for best quality
  function getLargestArtwork(artworkArray) {
    if (!artworkArray || !Array.isArray(artworkArray) || artworkArray.length === 0) {
      return null;
    }
    
    let largestArtwork = null;
    let maxPixels = 0;
    
    for (const artwork of artworkArray) {
      if (artwork.sizes && artwork.src) {
        // Parse sizes like "512x512" or "300x200"
        const sizeMatch = artwork.sizes.match(/(\d+)x(\d+)/);
        if (sizeMatch) {
          const width = parseInt(sizeMatch[1]);
          const height = parseInt(sizeMatch[2]);
          const totalPixels = width * height;
          
          if (totalPixels > maxPixels) {
            maxPixels = totalPixels;
            largestArtwork = {
              src: artwork.src,
              sizes: artwork.sizes,
              type: artwork.type || 'unknown',
              width: width,
              height: height,
              totalPixels: totalPixels
            };
          }
        }
      }
    }
    
    return largestArtwork;
  }
  
  // More robust metadata extraction with largest artwork
  const largestArtwork = getLargestArtwork(metadata.artwork);
  
  const track = {
    title: metadata.title || 'Unknown',
    artist: metadata.artist || 'Unknown', 
    album: metadata.album || 'Unknown',
    timestamp: new Date().toISOString(),
    artwork: largestArtwork ? largestArtwork.src : null,
    artworkInfo: largestArtwork || null,
    allArtwork: metadata.artwork || []
  };

  // Use compound key to detect actual track changes (not just metadata updates)
  const trackId = `${track.title}|${track.artist}|${track.album}`;
  
  if (lastTrack !== trackId) {
    lastTrack = trackId;
    console.log('New track detected with artwork:', {
      title: track.title,
      artist: track.artist,
      artworkCount: track.allArtwork.length,
      largestArtwork: track.artworkInfo
    });
    return track;
  }
  
  return null;
}

// Process and distribute track data through multiple channels
function saveTrackInfo(track) {
  const trackText = `[${new Date().toLocaleTimeString()}] ${track.title} - ${track.artist} (${track.album})`;
  
  console.log('New track detected:', trackText);
  

  
  // Send to background script for WebSocket transmission and file saving
  browserAPI.runtime.sendMessage({
    type: 'TRACK_CHANGED',
    track: track,
    trackText: trackText
  }).then((response) => {
    if (response && response.success) {
      console.log('Track data sent to background script');
    }
  }).catch((error) => {
    console.error('Failed to send track data:', error);
  });
}

// Start monitoring with robust error handling and recovery
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  
  // Frequent polling is needed as MediaSession doesn't provide change events
  const checkInterval = setInterval(() => {
    try {
      const newTrack = checkTrackChange();
      if (newTrack) {
        saveTrackInfo(newTrack);
      }
    } catch (error) {
      console.error('Error during track check:', error);
      // Continue monitoring despite errors - Apple Music can be unstable
    }
  }, 2000);
  
  // Initial check with delay to ensure page is fully loaded
  setTimeout(() => {
    try {
      const currentTrack = checkTrackChange();
      if (currentTrack) {
        saveTrackInfo(currentTrack);
      }
    } catch (error) {
      console.error('Error during initial track check:', error);
    }
  }, 1000);
  
  // Store interval ID for cleanup
  window.ampMonitoringInterval = checkInterval;
}

function stopMonitoring() {
  if (window.ampMonitoringInterval) {
    clearInterval(window.ampMonitoringInterval);
    window.ampMonitoringInterval = null;
  }
  
  isMonitoring = false;
  console.log('Monitoring stopped');
}

// Message handler for communication with popup and background script
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message.type);
  
  if (message.type === 'START_MONITORING') {
    startMonitoring();
    sendResponse({ success: true });
  } else if (message.type === 'STOP_MONITORING') {
    stopMonitoring();
    sendResponse({ success: true });
  } else if (message.type === 'GET_CURRENT_TRACK') {
    try {
      const track = checkTrackChange();
      sendResponse({ track: track, monitoring: isMonitoring });
    } catch (error) {
      sendResponse({ track: null, error: error.message });
    }
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ 
      monitoring: isMonitoring,
      hasMediaSession: !!(navigator.mediaSession && navigator.mediaSession.metadata),
      url: window.location.href
    });
  }
  
  return true; // Keep message channel open for async responses
});

// Auto-initialization with robust Apple Music detection
function initializeExtension() {
  // Wait for Apple Music to fully load before starting monitoring
  const checkReady = () => {
    if (document.readyState === 'complete' && window.location.href.includes('music.apple.com')) {
      setTimeout(() => {
        console.log('Initializing AMP monitoring...');
        startMonitoring();
      }, 2000);
    } else {
      setTimeout(checkReady, 1000);
    }
  };
  
  checkReady();
}

// Multiple initialization triggers for maximum reliability
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Backup initialization after full page load
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!isMonitoring) {
      initializeExtension();
    }
  }, 3000);
});

// Handle SPA navigation within Apple Music (no page reload)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('Page navigation detected, reinitializing...');
    setTimeout(initializeExtension, 1000);
  }
}, 1000);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopMonitoring();
});