import React, { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import { listLogEntries } from './routes';
import LogEntryForm from './LogEntryForm';
import PlaceSearch from './PlaceSearch';

const haversineKm = (a, b) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
};

const App = () => {
    const mapRef = useRef();
    const [logEntries, setLogEntries] = useState([]);
    const [showPopup, setShowPopup] = useState({});
    const [addEntryLocation, setAddEntryLocation] = useState(null);
    const [deviceLocation, setDeviceLocation] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [viewState, setViewState] = useState({
        longitude: 7.4913,
        latitude: 9.0722,
        zoom: 6,
    });

 const getEntries = async () => {
    try {
        const entries = await listLogEntries();
        setLogEntries(entries);
    } catch (error) {
        console.log(error);
    }
};
    useEffect(() => {
        getEntries();
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                };
                setDeviceLocation(loc);
                setViewState((vs) => ({ ...vs, ...loc, zoom: 11 }));
            },
            () => {
                // permission denied / unavailable — keep default zoomed-out view
            }
        );
    }, []);

    const flyToLocation = (loc, zoom = 13) => {
        mapRef.current?.flyTo({ center: [loc.longitude, loc.latitude], zoom });
    };

    const handleShowMyLocation = () => {
        if (deviceLocation) flyToLocation(deviceLocation, 13);
        setAddEntryLocation(deviceLocation);
    };

    const handlePlaceSelected = (place) => {
        setSelectedPlace(place);
        flyToLocation(place, 14);
    };
    const handleLogHere = () => {
        setAddEntryLocation(selectedPlace);
         mapRef.current?.flyTo({
        center: [selectedPlace.longitude, selectedPlace.latitude],
        zoom: 15,
        offset: [0, -150],
    });
    };

    const showAddMarkerPopup = (event) => {
        const { lng: longitude, lat: latitude } = event.lngLat;
        setAddEntryLocation({ latitude, longitude });
    };

    const filterCenter = selectedPlace || deviceLocation;
    const nearbyEntries = useMemo(() => {
        if (!filterCenter) return logEntries;
        return logEntries.filter(
            (entry) => haversineKm(filterCenter, entry) <= 15 // naive "vicinity" radius — will become a real state/placeId filter in phase 2
        );
    }, [logEntries, filterCenter]);

    return (
        <div className="app-container">
            <div className="map-pane">
                <Map
                    ref={mapRef}
                    {...viewState}
                      doubleClickZoom={false}
                    onMove={(evt) => setViewState(evt.viewState)}
                    mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                    onDblClick={showAddMarkerPopup}
                >
                    <button className="locate-btn" onClick={handleShowMyLocation}>
                        📍 My Location
                    </button>

                    {logEntries.map((entry) => (
                        <React.Fragment key={entry._id}>
                            <Marker longitude={entry.longitude} latitude={entry.latitude}>
                                <div onClick={() => setShowPopup({ [entry._id]: true })}>
                                    <svg className="marker" width="24" height="30" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                            </Marker>
                            {showPopup[entry._id] && (
                                <Popup
                                    latitude={entry.latitude}
                                    longitude={entry.longitude}
                                    closeButton={true}
                                    closeOnClick={false}
                                    onClose={() => setShowPopup({})}
                                    anchor="top"
                                >
                                    <div className="popup">
                                        <h3>{entry.title}</h3>
                                        <p>{entry.comments}</p>
                                        <small>Visited on: {new Date(entry.visitDate).toLocaleDateString()}</small>
                                    </div>
                                </Popup>
                            )}
                        </React.Fragment>
                    ))}

                    {addEntryLocation && (
                        <>
                            <Marker longitude={addEntryLocation.longitude} latitude={addEntryLocation.latitude}>
                                <div>
                                    <svg className="marker" width="24" height="30" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                            </Marker>
                            <Popup
                                latitude={addEntryLocation.latitude}
                                longitude={addEntryLocation.longitude}
                                closeButton={true}
                                closeOnClick={false}
                                onClose={() => setAddEntryLocation(null)}
                                anchor="top"
                            >
                                <div className="popup">
                                    <h3>Add your new log entry here</h3>
                                    <LogEntryForm
                                        location={addEntryLocation}
                                        onClose={() => {
                                            setAddEntryLocation(null);
                                            getEntries();
                                        }}
                                    />
                                </div>
                            </Popup>
                        </>
                    )}
                </Map>
            </div>

            <div className="list-pane">
                <PlaceSearch onSelect={handlePlaceSelected} />

                {selectedPlace && (
                    <div className="selected-place">
                        <h3>{selectedPlace.placeName}</h3>
                        <button onClick={() => setAddEntryLocation(selectedPlace)}>
                            + Log your experience here
                        </button>
                    </div>
                )}

                <div className="log-list">
                    {nearbyEntries.length === 0 && <p>No logs nearby yet.</p>}
                    {nearbyEntries.map((entry) => (
                        <div className="log-card" key={entry._id}>
                            <h4>{entry.title}</h4>
                            <p>{entry.comments}</p>
                            <small>{new Date(entry.visitDate).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;