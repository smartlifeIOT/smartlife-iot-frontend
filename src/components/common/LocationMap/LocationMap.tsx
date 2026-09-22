import React, { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  height?: string;
  className?: string;
  onLocationChange?: (latitude: number, longitude: number) => void;
}

// Google Maps types
interface GoogleMaps {
  maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: { lat: number; lng: number };
        zoom: number;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
      }
    ) => GoogleMap;
    Marker: new (options: {
      position: { lat: number; lng: number };
      map: GoogleMap;
      title?: string;
      animation?: number;
    }) => GoogleMarker;
    Animation: {
      DROP: number;
    };
  };
}

interface GoogleMap {
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMarker {
  setMap: (map: GoogleMap | null) => void;
}

declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
    REACT_APP_GOOGLE_MAPS_API_KEY?: string;
  }
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  height = '300px',
  className = '',
  onLocationChange,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Google Maps API
    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com"]'
        );
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () =>
            reject(new Error('Failed to load Google Maps'))
          );
          return;
        }

        // Get API key from environment variable or use a placeholder
        // You should set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

        // Load Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps()
      .then(() => {
        if (!window.google || !window.google.maps || !mapRef.current) {
          console.error('Google Maps API failed to load');
          return;
        }
        const { maps } = window.google;
        // Initialize map if not already initialized
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new maps.Map(mapRef.current, {
            center: { lat: 51.505, lng: -0.09 }, // Default center (London)
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });
        }
        const map = mapInstanceRef.current;
        // Update marker position if coordinates are provided
        if (
          latitude !== null &&
          longitude !== null &&
          !isNaN(latitude) &&
          !isNaN(longitude)
        ) {
          // Validate coordinates
          if (
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
          ) {
            const position = { lat: latitude, lng: longitude };

            // Remove existing marker
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // Add new marker
            markerRef.current = new maps.Marker({
              position,
              map,
              title: 'Asset Location',
            });

            // Center map on marker
            if (map) {
              map.setCenter(position);
              map.setZoom(15);
            }
          }
        } else {
          // Remove marker if coordinates are invalid
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
              <div style="text-align: center;">
                <p style="margin-bottom: 8px;">Failed to load map</p>
                <p style="font-size: 12px;">Please check your Google Maps API key configuration</p>
              </div>
            </div>
          `;
        }
      });

    return () => {
      // Cleanup marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      // Note: We don't remove the map instance as it's better to reuse it
    };
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(
          'Unable to retrieve your location. Please check your browser permissions.'
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className={`relative w-full rounded-lg border border-gray-300 overflow-hidden ${className}`}
    >
      <div ref={mapRef} style={{ height }} />
      {onLocationChange && (
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md shadow-md border border-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          title="Get current location"
        >
          <Navigation
            className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`}
          />
          {isGettingLocation ? 'Getting location...' : 'Use current location'}
        </button>
      )}
    </div>
  );
};
