# Interbells - Interval Timer

A Progressive Web App (PWA) for interval-based timed alerts with graduated audio notifications.

## Features

- ⏱ Set custom timer duration (minutes and seconds)
- 🔔 Set number of intervals (1-10)
- 📢 Graduated audio alerts:
  - 1 ring for first interval
  - 2 rings for second interval
  - 3 long rings for final interval (time's up)
- 🌙 Auto dark mode (follows system preference)
- 📱 Installable as app on mobile
- 🔄 Works offline after first load

## Quick Start (Local)

1. Open `index.html` in any modern browser
2. Set your timer duration and intervals
3. Click Start!

## Deploy to GitHub Pages (Free)

### Option 1: GitHub Web Interface

1. Create a new GitHub repository (e.g., `interbells`)
2. Click "Add file" → "Upload files"
3. Drag and drop all files from this folder
4. Commit changes
5. Go to **Settings** → **Pages**
6. Under "Source", select **Deploy from a branch**
7. Select **main** branch and **/ (root)** folder
8. Click **Save**
9. Wait 1-2 minutes, your app will be live at:
   `https://YOUR-USERNAME.github.io/interbells/`

### Option 2: Git Command Line

```bash
# Create new repo locally
cd intervells
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repo (replace with your actual repo URL)
git remote add origin https://github.com/YOUR-USERNAME/interbells.git
git push -u origin main

# Then enable GitHub Pages in repo Settings → Pages
```

## Install on Mobile

1. Open the app URL in Chrome (Android) or Safari (iOS)
2. Tap the menu button (⋮ or ↗)
3. Select "Add to Home Screen" or "Install App"
4. The app will appear as an icon on your home screen

## Browser Support

- ✅ Chrome / Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)

## Files

```
interbells/
├── index.html      # Main app UI
├── styles.css      # Styling with dark mode
├── app.js          # Timer logic and audio
├── sw.js           # Service worker for offline
├── manifest.json   # PWA manifest
├── README.md       # This file
└── PLAN.md         # Detailed design plan
```

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- Web Audio API (for audio alerts)
- Service Worker API (for offline support)
- PWA Manifest (for installability)

## License

MIT
