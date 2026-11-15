const getRegion = (feature) => {
  if (feature.id.startsWith('region.')) return feature.text;
  return feature.context?.find((c) => c.id.startsWith('region.'))?.text || '';
};

async function lookupPlace(latitude, longitude) {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${longitude},${latitude}.json` +
      `?types=place,region&limit=1&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    return {
      placeId: feature.id,
      placeName: feature.place_name,
      state: getRegion(feature),
    };
  } catch (error) {
    console.log('Place lookup failed:', error.message);
    return null;
  }
}

module.exports = { lookupPlace };