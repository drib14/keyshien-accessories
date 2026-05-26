import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;

const MapSelector = ({ onLocationSelected, initialCoords }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletInstance = useRef(null);

  // Load Leaflet dynamically on mount
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Inject Script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up search timeout if component unmounts
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !window.L || mapRef.current) return;

    const L = window.L;
    const startCoords = initialCoords || [14.5995, 120.9842]; // Manila default

    // Set map element
    mapRef.current = L.map('checkout-leaflet-map').setView(startCoords, 13);

    // Add lovely soft pastel map layer (CartoDB Positron fits pink aesthetic beautifully!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      maxZoom: 20,
    }).addTo(mapRef.current);

    // Set initial pink circle marker
    const customIcon = L.divIcon({
      className: 'custom-pink-marker',
      html: `<div style="background: var(--color-accent); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(255, 10, 84, 0.5);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    markerRef.current = L.marker(startCoords, { icon: customIcon }).addTo(mapRef.current);
    leafletInstance.current = L;

    // Listen to Map Clicks
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition([lat, lng]);
      await handleReverseGeocode(lat, lng);
    });
  }, [mapLoaded]);

  const updateMarkerPosition = (coords) => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng(coords);
      mapRef.current.panTo(coords);
    }
  };

  // Autocomplete address search via LocationIQ
  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(val)}&limit=5&countrycodes=ph`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('LocationIQ autocomplete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Choose a search suggestion
  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    
    updateMarkerPosition([lat, lon]);
    setSuggestions([]);
    setQuery(place.display_name);

    // Update parent
    onLocationSelected({
      address: place.address?.road || place.address?.suburb || place.display_name.split(',')[0],
      city: place.address?.city || place.address?.town || place.address?.county || '',
      postalCode: place.address?.postcode || '',
      displayAddress: place.display_name,
      lat,
      lng: lon,
    });
  };

  // Reverse geocoding when clicking on map
  const handleReverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`
      );
      if (response.ok) {
        const place = await response.json();
        setQuery(place.display_name);

        onLocationSelected({
          address: place.address?.road || place.address?.suburb || place.display_name.split(',')[0],
          city: place.address?.city || place.address?.town || place.address?.county || '',
          postalCode: place.address?.postcode || '',
          displayAddress: place.display_name,
          lat,
          lng: lon,
        });
      }
    } catch (error) {
      console.error('LocationIQ reverse geocoding failed:', error);
    }
  };

  return (
    <div className="map-selector-container">
      <style>{`
        .map-selector-container {
          margin-top: 15px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-glass);
          background: var(--bg-glass);
          padding: 14px;
        }
        .search-bar-container {
          position: relative;
          margin-bottom: 12px;
        }
        .search-icon-btn {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
          pointer-events: none;
        }
        .map-search-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-round);
          background: var(--bg-primary);
          color: var(--color-dark);
          outline: none;
          font-family: var(--font-body);
          font-size: 14px;
          transition: all 0.2s;
        }
        .map-search-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(255, 107, 139, 0.15);
        }
        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          margin-top: 5px;
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: var(--shadow-md);
        }
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          font-size: 13px;
          cursor: pointer;
          border-bottom: 1px solid #f9ecef;
          transition: background 0.2s;
        }
        .suggestion-item:hover {
          background: var(--bg-primary);
          color: var(--color-accent);
        }
        .map-wrapper {
          position: relative;
          height: 260px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #checkout-leaflet-map {
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .map-instruction {
          font-size: 11px;
          color: var(--color-muted);
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="search-bar-container">
        <span className="search-icon-btn">
          {loading ? <Loader2 size={16} className="spinning-icon" /> : <Search size={16} />}
        </span>
        <input
          type="text"
          placeholder="Search street, subdivision, or city..."
          className="map-search-input"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((place) => (
              <div
                key={place.place_id}
                className="suggestion-item"
                onClick={() => handleSelectSuggestion(place)}
              >
                <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>{place.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="map-wrapper">
        {!mapLoaded ? (
          <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
            <Loader2 size={32} className="spinning-icon" style={{ margin: 'auto', marginBottom: '8px' }} />
            <span>Loading interactive map...</span>
          </div>
        ) : (
          <div id="checkout-leaflet-map"></div>
        )}
      </div>

      <div className="map-instruction">
        <MapPin size={12} style={{ color: 'var(--color-accent)' }} />
        <span>You can also click anywhere on the map to pin your exact checkout coordinates.</span>
      </div>
    </div>
  );
};

export default MapSelector;
