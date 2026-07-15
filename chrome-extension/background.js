// Background Service Worker for CareerVault AI
console.log('CareerVault Service Worker successfully booted!');

// Helper: Performs JWT cookie search on both backend and frontend ports
const getAuthToken = () => {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: 'http://localhost', name: 'jwt' }, (cookie) => {
      if (cookie && cookie.value) {
        resolve(cookie.value);
      } else {
        chrome.cookies.get({ url: 'http://127.0.0.1', name: 'jwt' }, (cookie2) => {
          resolve(cookie2 ? cookie2.value : null);
        });
      }
    });
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'track_campus_drive') {
    const payload = message.payload;
    console.log('Background Worker received scraped campus drive data:', payload);
    handleTrackCampusDrive(payload);
  }
  return false;
});

async function handleTrackCampusDrive(payload) {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('Campus Drive sync blocked: User is offline / not authenticated in CareerVault.');
      return;
    }

    // Auto-post job application to backend REST API in background
    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Server error.');
    }
    console.log('Successfully synced campus application in background!', data);
  } catch (err) {
    console.error('Background sync failed:', err.message);
  }
}
