# 📱 Progressive Web App & Service Workers Guide

Convert your to-do app into an offline-capable Progressive Web App.

## What is a PWA?

A Progressive Web App (PWA) combines the best of web and mobile apps:

✅ Works offline
✅ Installable on home screen
✅ Fast and responsive
✅ Push notifications
✅ App-like experience

---

## Step 1: Create Web Manifest

Create `manifest.json`:

```json
{
  "name": "My To-Do List Application",
  "short_name": "To-Do List",
  "description": "A beautiful, offline-capable to-do list app",
  "start_url": "/todo-app/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23667eea' width='192' height='192'/><text x='50%' y='50%' font-size='120' fill='white' text-anchor='middle' dy='.3em'>✓</text></svg>",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect fill='%23667eea' width='512' height='512'/><text x='50%' y='50%' font-size='300' fill='white' text-anchor='middle' dy='.3em'>✓</text></svg>",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity"],
  "screenshots": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 540 720'><rect fill='%23667eea' width='540' height='720'/><text x='50%' y='50%' font-size='72' fill='white' text-anchor='middle' dy='.3em'>To-Do List</text></svg>",
      "sizes": "540x720",
      "type": "image/svg+xml"
    }
  ]
}
```

Add to `index.html` head:

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#667eea">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="To-Do List">
```

---

## Step 2: Create Service Worker

Create `service-worker.js`:

```javascript
const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
    '/',
    '/todo-app/index.html',
    '/todo-app/todo-style.css',
    '/todo-app/todo-script.js',
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192"/><text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dy=".3em">✓</text></svg>'
];

// Install event - cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version
                if (response) {
                    return response;
                }

                return fetch(event.request).then(response => {
                    // Clone the response
                    const responseClone = response.clone();

                    // Cache for later use
                    if (event.request.method === 'GET') {
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                    }

                    return response;
                });
            })
            .catch(error => {
                console.log('Fetch error:', error);
                // Return offline page
                return new Response('Offline - please check your connection', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// Handle messages
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
```

Register in `todo-script.js`:

```javascript
// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/todo-app/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Update available!');
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <p>New version available!</p>
        <button id="updateBtn">Update Now</button>
    `;
    document.body.appendChild(notification);
    
    document.getElementById('updateBtn').addEventListener('click', () => {
        window.location.reload();
    });
}
```

---

## Step 3: Offline Data Sync

Create `offline-sync.js`:

```javascript
// Queue for offline actions
class OfflineQueue {
    constructor() {
        this.queue = [];
        this.loadQueue();
    }

    add(action, data) {
        this.queue.push({
            id: Date.now(),
            action,
            data,
            timestamp: new Date()
        });
        this.saveQueue();
    }

    async processQueue() {
        const online = navigator.onLine;
        if (!online) {
            console.log('Still offline, queue paused');
            return;
        }

        while (this.queue.length > 0) {
            const item = this.queue[0];
            try {
                await this.processItem(item);
                this.queue.shift();
                this.saveQueue();
            } catch (error) {
                console.error('Error processing queue item:', error);
                break;
            }
        }
    }

    async processItem(item) {
        switch (item.action) {
            case 'ADD_TASK':
                await addTaskToFirebase(item.data.text);
                break;
            case 'UPDATE_TASK':
                await updateTaskInFirebase(item.data.id, item.data.updates);
                break;
            case 'DELETE_TASK':
                await deleteTaskFromFirebase(item.data.id);
                break;
        }
    }

    saveQueue() {
        localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    }

    loadQueue() {
        const saved = localStorage.getItem('offlineQueue');
        this.queue = saved ? JSON.parse(saved) : [];
    }
}

const offlineQueue = new OfflineQueue();

// Listen for online/offline events
window.addEventListener('online', () => {
    console.log('Back online!');
    offlineQueue.processQueue();
});

window.addEventListener('offline', () => {
    console.log('Lost connection');
});

// Periodically try to sync
setInterval(() => {
    if (navigator.onLine && offlineQueue.queue.length > 0) {
        offlineQueue.processQueue();
    }
}, 5000);
```

---

## Step 4: Push Notifications

Enable notifications in your app:

```javascript
// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            console.log('Notifications already enabled');
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notifications enabled');
                }
            });
        }
    }
}

// Send notification
function sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && 'ServiceWorkerContainer' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192"/><text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dy=".3em">✓</text></svg>',
                    ...options
                });
            });
        }
    }
}

// Send notification when task is added
function notifyTaskAdded(taskText) {
    sendNotification('Task Added', {
        body: taskText,
        tag: 'task-added',
        requireInteraction: false
    });
}

// Send notification for upcoming tasks
function notifyUpcomingTask(taskText) {
    sendNotification('Reminder', {
        body: `Don't forget: ${taskText}`,
        tag: 'task-reminder',
        requireInteraction: true
    });
}

// Request permission on app load
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
});
```

---

## Step 5: Add to Home Screen

Update HTML with install button:

```html
<button id="installBtn" style="display: none;">Install App</button>

<script>
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('App installed!');
});
</script>
```

---

## Step 6: Deployment

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

---

## Testing PWA

### Desktop (Chrome)
1. Open DevTools (F12)
2. Go to Application → Manifest
3. Check for manifest issues
4. Go to Application → Service Workers
5. Check registration status

### Mobile (Android)
1. Open in Chrome
2. Tap menu (⋮)
3. Tap "Install app"
4. App appears on home screen

### iOS
1. Open in Safari
2. Tap Share
3. Tap "Add to Home Screen"
4. App appears as bookmark

---

## Features Enabled by PWA

✅ **Offline Support**
- Works without internet
- Caches assets
- Syncs when back online

✅ **Installable**
- Add to home screen
- Full-screen experience
- App drawer icon

✅ **Fast**
- Service Worker caching
- Instant load times
- Optimized assets

✅ **Reliable**
- Works in low connectivity
- Automatic updates
- Background sync

✅ **Engaging**
- Push notifications
- Add to home screen prompt
- App-like experience

---

Your to-do app is now a full Progressive Web App! 🚀
