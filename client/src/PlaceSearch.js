import React, { useState, useRef } from 'react';

const getState = (feature) => {
    if (feature.id.startsWith('region.')) return feature.text;
    return feature.context?.find((c) => c.id.startsWith('region.'))?.text || '';
    };

const PlaceSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debounceRef = useRef(null);

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        clearTimeout(debounceRef.current);
        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            const token = process.env.REACT_APP_MAPBOX_TOKEN;
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${token}&country=ng&limit=5`;
            const res = await fetch(url);
            const data = await res.json();
            setSuggestions(data.features || []);
        }, 300);
    };

    const handleSelect = (feature) => {
        setQuery(feature.place_name);
        setSuggestions([]);
           onSelect({
            id: feature.id,
            name: feature.text,
            placeName: feature.place_name,
            state: getState(feature),
            longitude: feature.center[0],
            latitude: feature.center[1],
        });
    };

    return (
        <div className="place-search">
            <input
                type="text"
                placeholder="Search a place..."
                value={query}
                onChange={handleChange}
            />
            {suggestions.length > 0 && (
                <ul className="place-search-suggestions">
                    {suggestions.map((feature) => (
                        <li key={feature.id} onClick={() => handleSelect(feature)}>
                            {feature.place_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlaceSearch;