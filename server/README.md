# Activity-Tracker — Server

Backend API for an activity tracker, a travel/experience logger — you visit a place, log the location and what you did, and see if your friends and others have logged nearby.

## Stack
- Node.js + Express
- MongoDB (via Mongoose)
- Mapbox Geocoding API (reverse lookup of place and state)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a .env file in this folder (see .env.example if present) with:
    ```bash
    DB_URL=mongodb://127.0.0.1:27017/activity-log
    PORT=3001
    CORS_ORIGIN=http://localhost:3000
    MAPBOX_TOKEN=pk.your_mapbox_public_token
    ```
   - For a hosted database, use your MongoDB Atlas connection string for `DB_URL` (starts with `mongodb+srv://`). Use a database user with a simple password (letters and numbers), and add your IP under Network Access in Atlas.
   - For a local database, make sure MongoDB is running.
   - `MAPBOX_TOKEN` is a a public (`pk.`) token from mapbox.com. It is optional: without it, logs still save, but logs created without place info won't get a place or state filled in.
   - Never commit your `.env` file.

## Running
Development (auto-restarts on file changes):
```
npm run dev
```

Server runs on http://localhost:3001 by default (or whatever PORT you set it to).

## API

| Method | Route     | Description            |
|--------|-----------|------------------------|
| GET    | /api/logs | List all log entries   |
| POST   | /api/logs | Create a new log entry |

### Log entry fields

| Field       | Type   | Notes                                   |
|-------------|--------|-----------------------------------------|
| title       | String | Required                                |
| description | String |                                         |
| comments    | String |                                         |
| rating      | Number | 0 to 10, defaults to 0                  |
| image       | String | Image URL                               |
| latitude    | Number | Required, -90 to 90                     |
| longitude   | Number | Required, -180 to 180                   |
| visitDate   | Date   | Defaults to now                         |
| placeId     | String | Mapbox place ID, filled in automatically |
| placeName   | String | Full place name, filled in automatically |
| state       | String | State/region, filled in automatically    |

### Place lookup
If a log is created without a `placeId` (for example, from a double-click on the map), the server looks up the nearest town and state from its coordinates using Mapbox and saves them with the log. If the lookup fails or no place is found, the log still saves without them.