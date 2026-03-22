# Interbells - Timer App Plan

## Overview
A Progressive Web App (PWA) for interval-based timed alerts. Users set a total duration and number of intervals. As each interval passes, audio alerts notify the user (n rings per interval, final interval uses different sound).

## Features
| Feature | Description |
|---------|-------------|
| Set Duration | Minutes and seconds picker |
| Set Intervals | Number of intervals (1-10+) |
| Visual Timer | Large countdown display |
| Interval Progress | Shows current interval (e.g., "Interval 2 of 3") |
| Approximate Interval | Display "~Xs each" for uneven intervals |
| Graduated Alerts | n rings (flexible based on interval count) |
| Controls | Start, Pause, Reset buttons |
| Dark Mode | Auto-detect system preference |
| PWA Installable | Add to Home Screen on mobile |
| Offline Support | Works via Service Worker |

## Timer & Interval Math

```
Algorithm:
  intervalLength = totalSeconds / numberOfIntervals
  For each interval i (1 to n):
    alertTime = intervalLength * i
    Play alert(i) at alertTime

Edge Case (uneven intervals):
  Total: 181s (3m 1s), 3 intervals
  intervalLength = 181 / 3 = 60.33s
  Alerts at: ~60s, ~120s, 181s (exact)
  Display: "~60s each"

Constraint:
  Minimum 1 second per interval
  (e.g., can't set 3 intervals in 2 seconds)
```

## Audio Design (Flexible)
| Interval | Sound | Count |
|----------|-------|-------|
| 1 to (n-1) | Sound A: Mid tone (440Hz, 0.3s) | n rings |
| n (final) | Sound B: Lower bass tone (220Hz, 0.8s) | n rings |

**Examples:**
- 3 intervals: 1→ Sound A x1, 2→ Sound A x2, 3→ Sound B x3 (final)
- 4 intervals: 1→ Sound A x1, 2→ Sound A x2, 3→ Sound A x3, 4→ Sound B x4 (final)
- 5 intervals: 1→ Sound A x1, 2→ Sound A x2, 3→ Sound A x3, 4→ Sound A x4, 5→ Sound B x5 (final)

## File Structure
```
interbells/
├── index.html      # Main UI
├── styles.css      # Orange/Green theme, dark mode
├── app.js          # Timer logic + Web Audio API
├── sw.js           # Service worker (offline)
├── manifest.json   # PWA manifest
├── README.md       # Setup & GitHub Pages guide
└── PLAN.md         # This file
```

## Technology
- **HTML/CSS/JS**: Vanilla (no framework)
- **Audio**: Web Audio API for distinct tones
- **PWA**: Service Worker + Manifest
- **Hosting**: GitHub Pages (free)

## Deployment
1. Create GitHub repo
2. Push files
3. Settings → Pages → Enable
4. App live at: `username.github.io/interbells`

## Color Theme (Orange/Green)
- Primary: Orange (#FF6B35)
- Secondary: Green (#4CAF50)
- Background Light: #FAFAFA
- Background Dark: #1A1A1A
- Text Light: #333333
- Text Dark: #F5F5F5

## User Flow
1. User opens app
2. Sets total duration (e.g., 3:00)
3. Sets number of intervals (e.g., 3)
4. Taps "Start"
5. Timer counts down
6. At each interval: audio alert (n rings) + visual update
7. At final interval: n long rings (different sound) + "Time's Up!"

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS + desktop)
- Mobile browsers: Supported via PWA
