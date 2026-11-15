require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../databaseConfig');
const LogEntry = require('../models/LogEntry');

const token = process.env.MAPBOX_TOKEN;

const getRegion = (feature) => {
  if (feature.id.startsWith('region.')) return feature.text;
  return feature.context?.find((c) => c.id.startsWith('region.'))?.text || '';
};

const run = async () => {
  if (!token) {
    console.log('Add MAPBOX_TOKEN to server/.env first');
    process.exit(1);
  }

  await connectDB();

  // null also matches documents where the field is missing
  const entries = await LogEntry.find({ placeId: { $in: [null, ''] } });
  console.log(`Backfilling ${entries.length} entries...`);

  for (const entry of entries) {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${entry.longitude},${entry.latitude}.json` +
      `?types=place,region&limit=1&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Skipped ${entry._id}: Mapbox returned ${res.status}`);
      continue;
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      console.log(`Skipped ${entry._id}: no place found`);
      continue;
    }

    await LogEntry.updateOne(
      { _id: entry._id },
      {
        $set: {
          placeId: feature.id,
          placeName: feature.place_name,
          state: getRegion(feature),
        },
      }
    );
    console.log(`Updated ${entry.title}: ${feature.place_name}`);

    await new Promise((r) => setTimeout(r, 150)); // stay well under rate limits
  }

  await mongoose.disconnect();
  console.log('Done');
};

run();