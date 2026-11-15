Activity Tracker — Client

Frontend for Ijene, a travel/experience logger. Browse a map of places people have logged, search for a place, and log your own experience.

## Stack
- React
- react-map-gl + Mapbox GL JS (map rendering + geocoding search)
- react-hook-form (log entry form)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

### Create a .env file in this folder with:
```
REACT_APP_MAPBOX_TOKEN=your_mapbox_access_token
```
- **Get a free token from mapbox.com.**

---

- Make sure the server is running (see server/README.md): the client expects it at http://localhost:3001 by default (see src/routes.js).

### Running
```
npm start
```

- Opens at http://localhost:3000.

## Features
- Map + list split view, centered on your device's location (browser location permission required)
- Search for a place to see existing logs or add your own
- Double-click the map to log a place directly

## Log Entry
* Title (Place) - Text - (would show on screen)
* Description - Text
* Comments - Text (would show on screen)
* Rating - scale of 1 - 10
* Image - Text - URL
* Latitude - Number
* Longitude - Number
* Date visited (required entry)