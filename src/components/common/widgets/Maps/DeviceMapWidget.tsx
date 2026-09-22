import { Copy, ExternalLink, MapPin, Navigation } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { Widget } from '../../WidgetCanvas';
import { flattenObject } from '@/utils/helpers/FlattenObject';
import {
  EmptyDeviceState,
  LiveStatusBadge,
} from '../../WidgetCanvas/WidgetRenderer';
interface DeviceMapWidgetProps {
  widget: Widget;
  telemetryData: any;
  deviceDetailResponse: any;
  resolvedDeviceName?: string;
  isLiveTelemetry: boolean;
  isConnectingTelemetry: boolean;
  isPollingFallback: boolean;
  isValidDevice: boolean;
}
function extractDeviceCoordinates(
  telemetryData: any,
  deviceDetailResponse: any,
  widget: Widget
): { lat: number; lon: number; isFallback: boolean } {
  const tData = telemetryData?.data || {};

  let lat: number | null = null;
  let lon: number | null = null;

  // 1. Direct root telemetry
  if (
    typeof telemetryData?.latitude === 'number' &&
    !isNaN(telemetryData.latitude)
  ) {
    lat = telemetryData.latitude;
  }
  if (
    typeof telemetryData?.longitude === 'number' &&
    !isNaN(telemetryData.longitude)
  ) {
    lon = telemetryData.longitude;
  }
  if (typeof telemetryData?.lat === 'number' && !isNaN(telemetryData.lat)) {
    lat = telemetryData.lat;
  }
  if (typeof telemetryData?.lng === 'number' && !isNaN(telemetryData.lng)) {
    lon = telemetryData.lng;
  }

  // 2. Telemetry payload data
  if (
    lat === null &&
    typeof tData.latitude === 'number' &&
    !isNaN(tData.latitude)
  ) {
    lat = tData.latitude;
  }
  if (
    lon === null &&
    typeof tData.longitude === 'number' &&
    !isNaN(tData.longitude)
  ) {
    lon = tData.longitude;
  }
  if (lat === null && typeof tData.lat === 'number' && !isNaN(tData.lat)) {
    lat = tData.lat;
  }
  if (lon === null && typeof tData.lng === 'number' && !isNaN(tData.lng)) {
    lon = tData.lng;
  }
  if (lon === null && typeof tData.long === 'number' && !isNaN(tData.long)) {
    lon = tData.long;
  }

  // String parsing in telemetry payload
  if (lat === null && tData.latitude) {
    const p = parseFloat(String(tData.latitude));
    if (!isNaN(p)) lat = p;
  }
  if (lon === null && tData.longitude) {
    const p = parseFloat(String(tData.longitude));
    if (!isNaN(p)) lon = p;
  }

  // 3. Deep search inside flattened telemetry data
  if (lat === null || lon === null) {
    const flat = flattenObject(tData);
    for (const [k, v] of flat) {
      const lowerKey = k.toLowerCase();
      const numVal = typeof v === 'number' ? v : parseFloat(String(v));
      if (!isNaN(numVal)) {
        if (
          lat === null &&
          (lowerKey.endsWith('latitude') || lowerKey.endsWith('lat'))
        ) {
          lat = numVal;
        }
        if (
          lon === null &&
          (lowerKey.endsWith('longitude') ||
            lowerKey.endsWith('lng') ||
            lowerKey.endsWith('lon') ||
            lowerKey.endsWith('long'))
        ) {
          lon = numVal;
        }
      }
    }
  }

  // 4. Device detail API response
  const deviceObj =
    (deviceDetailResponse?.data as any)?.data ||
    (deviceDetailResponse?.data as any);
  if (deviceObj) {
    if (lat === null && typeof deviceObj.latitude === 'number')
      lat = deviceObj.latitude;
    if (lon === null && typeof deviceObj.longitude === 'number')
      lon = deviceObj.longitude;
    if (lat === null && typeof deviceObj.attributes?.latitude === 'number')
      lat = deviceObj.attributes.latitude;
    if (lon === null && typeof deviceObj.attributes?.longitude === 'number')
      lon = deviceObj.attributes.longitude;
    if (lat === null && typeof deviceObj.additionalInfo?.latitude === 'number')
      lat = deviceObj.additionalInfo.latitude;
    if (lon === null && typeof deviceObj.additionalInfo?.longitude === 'number')
      lon = deviceObj.additionalInfo.longitude;

    if (
      (lat === null || lon === null) &&
      typeof deviceObj.location === 'string'
    ) {
      const parts = deviceObj.location
        .split(',')
        .map((s: string) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (lat === null) lat = parts[0];
        if (lon === null) lon = parts[1];
      }
    }
  }

  // 5. Widget config
  if (lat === null && widget.config?.latitude)
    lat = parseFloat(String(widget.config.latitude));
  if (lon === null && widget.config?.longitude)
    lon = parseFloat(String(widget.config.longitude));
  if (lat === null && widget.config?.lat)
    lat = parseFloat(String(widget.config.lat));
  if (lon === null && widget.config?.lng)
    lon = parseFloat(String(widget.config.lng));

  const isFallback = lat === null || lon === null;
  const finalLat = lat !== null && !isNaN(lat) ? lat : 24.7136;
  const finalLon = lon !== null && !isNaN(lon) ? lon : 46.6753;

  return { lat: finalLat, lon: finalLon, isFallback };
}
export default function DeviceMapWidget({
  widget,
  telemetryData,
  deviceDetailResponse,
  resolvedDeviceName,
  isLiveTelemetry,
  isConnectingTelemetry,
  isPollingFallback,
  isValidDevice,
}: DeviceMapWidgetProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);
  const infoWindowRef = React.useRef<any>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [mapLoadError, setMapLoadError] = React.useState(false);
  const [showMarkerCard, setShowMarkerCard] = React.useState(true);

  const { lat, lon, isFallback } = extractDeviceCoordinates(
    telemetryData,
    deviceDetailResponse,
    widget
  );

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load & initialize Google Maps JS API script if key exists
  React.useEffect(() => {
    if (!isValidDevice || !mapRef.current) return;

    let isMounted = true;

    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com"]'
        );
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () =>
            reject(new Error('Failed to load Google Maps script'))
          );
          return;
        }

        if (!GOOGLE_MAPS_API_KEY) {
          reject(new Error('No Google Maps API Key found'));
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error('Failed to load Google Maps script'));
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !mapRef.current || !window.google?.maps) return;
        const { maps } = window.google;

        const position = { lat, lng: lon };

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new maps.Map(mapRef.current, {
            center: position,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          });
        } else {
          mapInstanceRef.current.setCenter(position);
        }

        const map = mapInstanceRef.current;

        // Custom red pin marker SVG
        const pinSvg = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 1.8,
          anchor: new maps.Point(12, 22),
        };

        if (markerRef.current) {
          markerRef.current.setPosition(position);
        } else {
          markerRef.current = new maps.Marker({
            position,
            map,
            title: resolvedDeviceName || 'Device Location',
            icon: pinSvg,
            animation: maps.Animation?.DROP,
          });

          const contentString = `
            <div style="padding:6px; font-family:sans-serif;">
              <h4 style="margin:0 0 4px 0; font-weight:bold; font-size:13px; color:#0f172a;">${
                resolvedDeviceName || 'Target Device'
              }</h4>
              <p style="margin:0; font-size:11px; color:#475569; font-family:monospace;">
                Lat: ${lat.toFixed(5)}<br/>
                Lon: ${lon.toFixed(5)}
              </p>
              <div style="margin-top:6px; display:inline-block; font-size:9px; font-weight:bold; color:#059669; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 6px; border-radius:10px;">
                ● GPS Locked
              </div>
            </div>
          `;

          infoWindowRef.current = new maps.InfoWindow({
            content: contentString,
          });

          markerRef.current.addListener('click', () => {
            infoWindowRef.current?.open({
              anchor: markerRef.current,
              map,
              shouldFocus: false,
            });
          });
        }

        setMapLoaded(true);
        setMapLoadError(false);
      })
      .catch(() => {
        if (isMounted) {
          setMapLoadError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lon, isValidDevice, resolvedDeviceName, GOOGLE_MAPS_API_KEY]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setCenter({ lat, lng: lon });
      mapInstanceRef.current.setZoom(15);
      toast.success('Centered map on device');
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  // Standard fallback map URL with location marker (works with or without API key)
  const embedFallbackUrl = GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lon}&zoom=15`
    : `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden bg-slate-100 text-white flex flex-col   shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 z-10      shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0 animate-bounce" />
          <span className="text-xs font-bold   truncate">
            {widget.title || 'Device Location Radar'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>
      </div>

      {!isValidDevice ? (
        <EmptyDeviceState widget={widget} icon={MapPin} />
      ) : (
        <div className="relative flex-1 min-h-0 w-full overflow-hidden">
          {/* Google Maps JS Container */}
          {!mapLoadError && <div ref={mapRef} className="w-full h-full" />}

          {/* Fallback Embed with Marker */}
          {mapLoadError && (
            <iframe
              title="device-location-map-fallback"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={embedFallbackUrl}
            />
          )}

          {/* Location Marker Info HUD Overlay */}
          {showMarkerCard && (
            <div className="absolute bottom-3 left-3 z-10 max-w-[240px] shadow shadow-[rgba(0,0,0,0.5)]    bg-white backdrop-blur-md p-2.5 rounded-xl shadow-xl flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 truncate">
                    {resolvedDeviceName || 'Target Device'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMarkerCard(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs px-1"
                  title="Hide info card"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-800 bg-slate-200/40 px-2 py-1 rounded-md  ">
                <span>Lat: {lat.toFixed(4)}°</span>
                <span>Lon: {lon.toFixed(4)}°</span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-800 font-medium">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isFallback ? 'Default Location' : 'Live GPS Pin'}
                </span>
                <span className="text-slate-400">Locked</span>
              </div>
            </div>
          )}

          {!showMarkerCard && (
            <button
              type="button"
              onClick={() => setShowMarkerCard(true)}
              className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-cyan-400 flex items-center gap-1 shadow-md hover:bg-slate-900 transition-all"
            >
              <MapPin className="w-3 h-3 text-red-500" /> Location Details
            </button>
          )}
        </div>
      )}

      {/* Footer Bar */}
      <div className="flex justify-between items-center text-[10px] z-10 px-3 py-1.5 font-mono   text-black shrink-0">
        <span className="truncate max-w-[120px]">
          {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
        </span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Marker Active
        </span>
      </div>
    </div>
  );
}
