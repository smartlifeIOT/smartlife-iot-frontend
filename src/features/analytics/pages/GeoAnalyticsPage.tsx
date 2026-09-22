import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { cn, formatBytes } from '@/lib/util';
import { useGeoAnalytics } from '@/features/analytics/hooks';
import { GeoAnalyticsData, GeoDevice, GeoRegionStat } from '@/services/api';
import { format } from 'date-fns';
import {
  MapPin,
  Radio,
  ShieldAlert,
  Layers,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

export default function GeoAnalyticsPage() {
  const { t } = useTranslation();
  const [region, setRegion] = useState('all');
  const [viewMode, setViewMode] = useState<'Heatmap' | 'Clusters'>('Clusters');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatmapLayerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  const {
    data: geoDataDetails,
    isLoading,
    refetch,
  } = useGeoAnalytics(region === 'all' ? undefined : region);

  const geoData = (geoDataDetails || {}) as GeoAnalyticsData;
  const devices = useMemo(() => geoData?.devices || [], [geoData?.devices]);
  const regionStats = useMemo(
    () => geoData?.regionStats || [],
    [geoData?.regionStats]
  );
  const summary = geoData?.summary;

  const locatedDevices = useMemo(
    () =>
      devices.filter(
        (d: GeoDevice) =>
          d.latitude !== null &&
          d.longitude !== null &&
          !isNaN(Number(d.latitude)) &&
          !isNaN(Number(d.longitude))
      ),
    [devices]
  );

  const totalDevices = summary?.totalDevices ?? devices.length;
  const totalLocated = summary?.locatedDevices ?? locatedDevices.length;
  const totalRegions = summary?.regions ?? regionStats.length;
  const totalAlarms = regionStats.reduce(
    (acc: number, r: GeoRegionStat) => acc + (r.activeAlarms || 0),
    0
  );

  // Helper to generate custom SVG pin icons for Google Maps
  const createMarkerIcon = (statusType: 'alarm' | 'online' | 'offline') => {
    const config = {
      alarm: {
        bg: '#ef4444',
        shadow: '#991b1b',
        inner: `
          <circle cx="16" cy="15" r="9" fill="#fee2e2" fill-opacity="0.25"/>
          <path d="M16 8.5l6 10.5H10l6-10.5z" fill="#ffffff"/>
          <path d="M16 12v3.5M16 17.2v.3" stroke="#ef4444" stroke-width="1.6" stroke-linecap="round"/>
        `,
      },
      online: {
        bg: '#10b981',
        shadow: '#065f46',
        inner: `
          <circle cx="16" cy="15" r="9" fill="#d1fae5" fill-opacity="0.25"/>
          <path d="M11.5 13.5a6.5 6.5 0 0 1 9 0M13.2 15.5a4 4 0 0 1 5.6 0M16 18.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" fill="none"/>
          <circle cx="16" cy="17.5" r="1.2" fill="#ffffff"/>
        `,
      },
      offline: {
        bg: '#64748b',
        shadow: '#334155',
        inner: `
          <circle cx="16" cy="15" r="9" fill="#f1f5f9" fill-opacity="0.2"/>
          <line x1="11" y1="10.5" x2="21" y2="20.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M18.8 12.8a6.5 6.5 0 0 0-5.8 0M13.2 15.5a4 4 0 0 0 1.2.6" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        `,
      },
    }[statusType];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 32 38">
      <defs>
        <filter id="marker-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 1C8.268 1 2 7.268 2 15c0 10.5 14 22 14 22s14-11.5 14-22C30 7.268 23.732 1 16 1z" fill="${config.bg}" filter="url(#marker-shadow)"/>
      ${config.inner}
    </svg>`;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(32, 38),
      anchor: new window.google.maps.Point(16, 38),
    };
  };

  // Initialize Map, Markers, and Heatmap
  useEffect(() => {
    if (!mapRef.current) return;

    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          existingScript.onload = () => resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps()
      .then(() => {
        if (!window.google || !window.google.maps || !mapRef.current) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 24.7136, lng: 46.6753 },
            zoom: 6,
            styles: [
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#7c93a3' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#f1f5f9' }],
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#ffffff' }],
              },
            ],
            disableDefaultUI: true,
            zoomControl: true,
          });

          infoWindowRef.current = new window.google.maps.InfoWindow();
        }

        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // Clear existing heatmap layer
        if (heatmapLayerRef.current) {
          heatmapLayerRef.current.setMap(null);
          heatmapLayerRef.current = null;
        }

        if (viewMode === 'Heatmap') {
          if (
            window.google.maps.visualization &&
            window.google.maps.visualization.HeatmapLayer
          ) {
            const heatmapPoints = locatedDevices.map(
              (dev: GeoDevice) =>
                new window.google.maps.LatLng(
                  Number(dev.latitude),
                  Number(dev.longitude)
                )
            );

            heatmapLayerRef.current =
              new window.google.maps.visualization.HeatmapLayer({
                data: heatmapPoints,
                map,
                radius: 30,
                opacity: 0.8,
              });
          }
        } else {
          // Add custom icons for located devices
          locatedDevices.forEach((dev: GeoDevice) => {
            const isOnline =
              dev.status?.toLowerCase() === 'online' ||
              dev.status?.toLowerCase() === 'active';
            const alarmCount = dev.activeAlarms || 0;
            const hasAlarms = alarmCount > 0;

            const markerStatus: 'alarm' | 'online' | 'offline' = hasAlarms
              ? 'alarm'
              : isOnline
                ? 'online'
                : 'offline';

            const marker = new window.google.maps.Marker({
              position: {
                lat: Number(dev.latitude),
                lng: Number(dev.longitude),
              },
              map,
              title: `${dev.name} (${dev.type})`,
              icon: createMarkerIcon(markerStatus),
            });

            marker.addListener('click', () => {
              if (infoWindowRef.current) {
                const formattedDate = dev.lastSeenAt
                  ? format(new Date(dev.lastSeenAt), 'yyyy-MM-dd HH:mm:ss')
                  : 'N/A';

                const statusBadge = hasAlarms
                  ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      ${alarmCount} Active Alarm${alarmCount > 1 ? 's' : ''}
                    </span>`
                  : isOnline
                    ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                        Online
                      </span>`
                    : `<span style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                        Offline
                      </span>`;

                const content = `
                  <div style="font-family: inherit; padding: 6px 8px; min-width: 200px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                      <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${dev.name}</span>
                      ${statusBadge}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Type: <span style="font-weight: 500; color: #334155;">${dev.type}</span></div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Location: <span style="font-weight: 500; color: #334155;">${dev.location || 'N/A'}</span></div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; border-top: 1px solid #f1f5f9; padding-top: 4px;">Last Seen: ${formattedDate}</div>
                  </div>
                `;
                infoWindowRef.current.setContent(content);
                infoWindowRef.current.open(map, marker);
              }
            });

            markersRef.current.push(marker);
          });
        }

        // Fit map bounds if devices with location exist
        if (locatedDevices.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          locatedDevices.forEach((d: GeoDevice) => {
            bounds.extend({
              lat: Number(d.latitude),
              lng: Number(d.longitude),
            });
          });
          map.fitBounds(bounds);

          const listener = window.google.maps.event.addListener(
            map,
            'idle',
            () => {
              if (map.getZoom() > 14) map.setZoom(14);
              window.google.maps.event.removeListener(listener);
            }
          );
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
      });
  }, [locatedDevices, viewMode]);

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={t('analytics.geo.title', 'Geographical Analytics')}
          description={t(
            'analytics.geo.subtitle',
            'Real-time geographic distribution, device health, and regional performance'
          )}
        />
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            Export Map
          </Button>
          <Button variant="primary" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex bg-primary text-white items-center justify-between">
          <div>
            <p className="text-xs font-medium   uppercase tracking-wider">
              Total Devices
            </p>
            <h3 className="text-2xl font-bold   mt-1">{totalDevices}</h3>
          </div>
          <div className="p-3   text-white rounded-xl">
            <Radio className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-secondary text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-medium   uppercase tracking-wider">
              Located Devices
            </p>
            <h3 className="text-2xl font-bold   mt-1">{totalLocated}</h3>
          </div>
          <div className="p-3   text-white rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-success text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-medium  uppercase tracking-wider">
              Active Regions
            </p>
            <h3 className="text-2xl font-bold   mt-1">{totalRegions}</h3>
          </div>
          <div className="p-3   text-emerald-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4  bg-white text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Alarms
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {totalAlarms}
            </h3>
          </div>
          <div
            className={cn(
              'p-3 rounded-xl',
              totalAlarms > 0
                ? 'bg-rose-50 text-rose-600'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={region} onValueChange={setRegion} className="w-40">
          <SelectTrigger className="w-[200px] h-10 bg-gray-100 border-none rounded-md">
            <SelectValue placeholder="Filter: All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regionStats.map((r: GeoRegionStat, idx: number) => (
              <SelectItem key={idx} value={r.region}>
                {r.region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Map & Regional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Card */}
        <Card className="lg:col-span-2 rounded-xl">
          <CardHeader className="p-5 flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t('analytics.geo.mapTitle', 'Device Geographic Map')}
            </CardTitle>
            {/* Status Legend with rich icons */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                Offline
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Alarm
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 w-full h-[520px]">
            <div
              ref={mapRef}
              className="w-full h-full border border-gray-100 dark:border-gray-800 rounded-xl"
            />
          </CardContent>
        </Card>

        {/* Regional Statistics Card */}
        <Card className="rounded-xl flex flex-col">
          <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t('analytics.geo.stats.title', 'Regional Statistics')}
            </CardTitle>
            <Badge variant="default">{totalRegions} Regions</Badge>
          </CardHeader>
          <CardContent className="px-4 space-y-3 flex-1 overflow-y-auto max-h-[420px]">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-gray-500">
                Loading regional stats...
              </div>
            ) : regionStats.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No region data available
              </div>
            ) : (
              regionStats.map((r: GeoRegionStat, idx: number) => {
                const isOnline =
                  r.status?.toLowerCase() === 'online' ||
                  r.status?.toLowerCase() === 'active';
                const hasAlarms = (r.activeAlarms || 0) > 0;

                return (
                  <div
                    key={idx}
                    className="p-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100/60 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-medium text-sm text-gray-800 dark:text-white">
                        {r.region}
                      </h4>
                      <Badge
                        variant={isOnline ? 'success' : 'secondary'}
                        className="text-[10px] px-2 py-0.5 capitalize inline-flex items-center gap-1"
                      >
                        {isOnline ? (
                          <Wifi className="w-2.5 h-2.5" />
                        ) : (
                          <WifiOff className="w-2.5 h-2.5" />
                        )}
                        {r.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {r.deviceCount} Devices
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <Wifi className="w-3 h-3" />
                          {r.onlineCount}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <WifiOff className="w-3 h-3" />
                          {r.offlineCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Data: {formatBytes(r.dataGeneratedBytes)}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-medium',
                          hasAlarms
                            ? 'text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded'
                            : 'text-gray-500'
                        )}
                      >
                        {hasAlarms ? (
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                        ) : (
                          <BellRing className="w-3 h-3 text-gray-400" />
                        )}
                        Alarms: {r.activeAlarms} (
                        {Math.round(r.alertRate * 100)}%)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          <CardFooter className="border-t border-gray-100 dark:border-gray-800 p-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                {t('analytics.geo.stats.viewMode', 'View Mode')}
              </span>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                <Button
                  size="sm"
                  className="h-7 text-xs rounded-r-none"
                  onClick={() => setViewMode('Heatmap')}
                  variant={viewMode === 'Heatmap' ? 'secondary' : 'ghost'}
                >
                  {t('analytics.geo.stats.heatmap', 'Heatmap')}
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs rounded-l-none"
                  onClick={() => setViewMode('Clusters')}
                  variant={viewMode === 'Clusters' ? 'secondary' : 'ghost'}
                >
                  {t('analytics.geo.stats.clusters', 'Markers')}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="p-5">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {t('analytics.geo.table.title', 'Regional Performance & Telemetry')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Table>
            <TableHeader className="bg-primary text-white rounded-md">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-white font-medium">Region</TableHead>
                <TableHead className="text-white font-medium">
                  Total Devices
                </TableHead>
                <TableHead className="text-white font-medium">
                  Online / Offline
                </TableHead>
                <TableHead className="text-white font-medium">
                  Messages
                </TableHead>
                <TableHead className="text-white font-medium">
                  Data Generated
                </TableHead>
                <TableHead className="text-white font-medium">
                  Active Alarms
                </TableHead>
                <TableHead className="text-white font-medium">
                  Alert Rate
                </TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-sm text-gray-500"
                  >
                    Loading performance data...
                  </TableCell>
                </TableRow>
              ) : regionStats.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-sm text-gray-500"
                  >
                    No region statistics found
                  </TableCell>
                </TableRow>
              ) : (
                regionStats.map((row: GeoRegionStat, index: number) => {
                  const isOnline =
                    row.status?.toLowerCase() === 'online' ||
                    row.status?.toLowerCase() === 'active';
                  const hasAlarms = (row.activeAlarms || 0) > 0;

                  return (
                    <TableRow
                      key={index}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 h-14"
                    >
                      <TableCell className="text-sm font-semibold text-gray-700">
                        {row.region}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-medium">
                        {row.deviceCount}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Wifi className="w-3 h-3 text-emerald-600" />
                            {row.onlineCount}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <WifiOff className="w-3 h-3 text-slate-400" />
                            {row.offlineCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {row.messages.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatBytes(row.dataGeneratedBytes)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {hasAlarms ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            {row.activeAlarms}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50/70 px-2 py-0.5 rounded-md border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            0
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-medium">
                        {Math.round(row.alertRate * 100)}%
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge
                          variant={isOnline ? 'success' : 'secondary'}
                          className="capitalize inline-flex items-center gap-1 px-2 py-0.5"
                        >
                          {isOnline ? (
                            <Wifi className="w-3 h-3" />
                          ) : (
                            <WifiOff className="w-3 h-3" />
                          )}
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
