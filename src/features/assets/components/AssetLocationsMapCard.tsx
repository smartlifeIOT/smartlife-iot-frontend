import { useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssets } from '@/features/assets/hooks';
import type { Asset } from '@/services/api/assets.api';
import { useTranslation } from 'react-i18next';

interface GoogleMarker {
  setMap: (map: unknown | null) => void;
  setVisible: (visible: boolean) => void;
  getVisible: () => boolean;
}

interface GoogleMapsApi {
  maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: { lat: number; lng: number };
        zoom: number;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        styles?: Array<Record<string, unknown>>;
      }
    ) => {
      fitBounds: (bounds: unknown) => void;
      setCenter: (center: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
    };
    Marker: new (options: {
      position: { lat: number; lng: number };
      map: unknown;
      title?: string;
      icon?: string | Record<string, unknown>;
    }) => GoogleMarker;
    LatLngBounds: new () => {
      extend: (latLng: { lat: number; lng: number }) => void;
    };
  };
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function AssetLocationsMapCard() {
  const { t } = useTranslation();
  const { data: assetsResponse, isLoading: isAssetsLoading } = useAssets({
    page: 1,
    limit: 200,
  });

  const assets: Asset[] = useMemo(
    () => assetsResponse?.data?.data?.data || [],
    [assetsResponse]
  );
  const mapAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          typeof asset.location?.latitude === 'number' &&
          typeof asset.location?.longitude === 'number'
      ),
    [assets]
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const blinkIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadGoogleMaps = () =>
      new Promise<void>((resolve, reject) => {
        if (window.google?.maps) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () =>
            reject(new Error('Failed to load Google Maps'))
          );
          return;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
      });

    loadGoogleMaps()
      .then(() => {
        if (!mapRef.current || !window.google?.maps) return;
        const { maps } = window.google;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new maps.Map(mapRef.current, {
            center: { lat: 24.7136, lng: 46.6753 },
            zoom: 5,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            disableDefaultUI: true,
            styles: [
              {
                featureType: 'administrative',
                elementType: 'all',
                stylers: [
                  { hue: '#000000' },
                  { lightness: -100 },
                  { visibility: 'off' },
                ],
              },
              {
                featureType: 'administrative.locality',
                elementType: 'all',
                stylers: [
                  { visibility: 'on' },
                  { saturation: '-3' },
                  { gamma: '1.81' },
                  { weight: '0.01' },
                  { hue: '#ff0000' },
                  { lightness: '17' },
                ],
              },
              {
                featureType: 'administrative.land_parcel',
                elementType: 'all',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [
                  { hue: '#dddddd' },
                  { saturation: -100 },
                  { lightness: -3 },
                  { visibility: 'on' },
                ],
              },
              {
                featureType: 'landscape',
                elementType: 'labels',
                stylers: [
                  { hue: '#000000' },
                  { saturation: -100 },
                  { lightness: -100 },
                  { visibility: 'off' },
                ],
              },
              {
                featureType: 'poi',
                elementType: 'all',
                stylers: [
                  { hue: '#000000' },
                  { saturation: -100 },
                  { lightness: -100 },
                  { visibility: 'off' },
                ],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [
                  { hue: '#bbbbbb' },
                  { saturation: -100 },
                  { lightness: 26 },
                  { visibility: 'on' },
                ],
              },
              {
                featureType: 'road',
                elementType: 'labels',
                stylers: [
                  { hue: '#ffffff' },
                  { saturation: -100 },
                  { lightness: 100 },
                  { visibility: 'off' },
                ],
              },
              {
                featureType: 'road.arterial',
                elementType: 'labels.text',
                stylers: [{ visibility: 'on' }, { color: '#797979' }],
              },
              {
                featureType: 'road.arterial',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#868686' }],
              },
              {
                featureType: 'road.arterial',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#ffffff' }],
              },
              {
                featureType: 'road.local',
                elementType: 'all',
                stylers: [
                  { hue: '#ff0000' },
                  { saturation: -100 },
                  { lightness: 100 },
                  { visibility: 'on' },
                ],
              },
              {
                featureType: 'road.local',
                elementType: 'labels.text',
                stylers: [{ visibility: 'on' }],
              },
              {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#b6b2b2' }],
              },
              {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [
                  { hue: '#ff0000' },
                  { lightness: -100 },
                  { visibility: 'off' },
                ],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [
                  { hue: '#ff0000' },
                  { saturation: -100 },
                  { lightness: 100 },
                  { visibility: 'on' },
                ],
              },
              {
                featureType: 'water',
                elementType: 'labels',
                stylers: [
                  { hue: '#000000' },
                  { saturation: -100 },
                  { lightness: -100 },
                  { visibility: 'off' },
                ],
              },
            ],
          });
        }

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        if (blinkIntervalRef.current) {
          clearInterval(blinkIntervalRef.current);
        }

        if (!mapAssets.length) return;

        const bounds = new maps.LatLngBounds();

        mapAssets.forEach((asset) => {
          const lat = asset.location?.latitude;
          const lng = asset.location?.longitude;
          if (typeof lat !== 'number' || typeof lng !== 'number') return;

          const blackPinSvg =
            'data:image/svg+xml;utf-8,%3Csvg%20width%3D%2224%22%20height%3D%2234%22%20viewBox%3D%220%200%2024%2034%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12%200C5.37258%200%200%205.37258%200%2012C0%2021%2012%2034%2012%2034C12%2034%2024%2021%2024%2012C24%205.37258%2018.6274%200%2012%200Z%22%20fill%3D%22black%22%20%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%226%22%20fill%3D%22white%22%20%2F%3E%3C%2Fsvg%3E';

          const marker = new maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            title: asset.name,
            icon: blackPinSvg,
          });
          markersRef.current.push(marker);
          bounds.extend({ lat, lng });
        });

        const mapInstance = mapInstanceRef.current as {
          fitBounds: (bounds: unknown) => void;
          setCenter: (center: { lat: number; lng: number }) => void;
          setZoom: (zoom: number) => void;
        };

        if (markersRef.current.length === 1) {
          const first = mapAssets[0];
          if (
            typeof first.location?.latitude === 'number' &&
            typeof first.location?.longitude === 'number'
          ) {
            mapInstance.setCenter({
              lat: first.location.latitude,
              lng: first.location.longitude,
            });
            mapInstance.setZoom(12);
          }
        } else {
          mapInstance.fitBounds(bounds);
        }

        blinkIntervalRef.current = setInterval(() => {
          markersRef.current.forEach((marker) => {
            if (marker.setVisible && marker.getVisible) {
              marker.setVisible(!marker.getVisible());
            }
          });
        }, 700);
      })
      .catch(() => {
        if (mapRef.current) {
          mapRef.current.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;">Map unavailable</div>';
        }
      });

    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
    };
  }, [mapAssets]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-600">
          {t('dashboard.projectsLocations')}
        </CardTitle>
        <CardDescription>
          Showing {mapAssets.length} Projects on map
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAssetsLoading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : (
          <div
            ref={mapRef}
            className="h-[220px] w-full rounded-lg border border-gray-200"
          />
        )}
      </CardContent>
    </Card>
  );
}
