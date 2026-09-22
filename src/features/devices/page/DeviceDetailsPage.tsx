import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDevice, useDeviceCredentials } from '@/features/devices/hooks';
import { DeviceTelemetryTab } from '@/features/devices/components/DeviceTelemetryTab';
import { DeviceAlarmsTab } from '@/features/devices/components/DeviceAlarmsTab';
import { DeviceGeneralTab } from '@/features/devices/components/DeviceGeneralTab';
import { DeviceCredentialsDialog } from '@/features/devices/components/DeviceCredentialsDialog';
import { DeviceAttributesTab } from '@/features/devices/components/DeviceAttributesTab';
import { DeviceControlTab } from '@/features/devices/components/DeviceControlTab';

type TabType =
  | 'details'
  | 'attributes'
  | 'telemetry'
  | 'alarms'
  | 'relations'
  | 'control';

export default function DeviceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [fetchCredentials, setFetchCredentials] = useState(false);
  const { data: deviceData } = useDevice(id || '');
  const { data: credentialsResponse, isLoading: isLoadingCredentials } =
    useDeviceCredentials(id || '', fetchCredentials);
  const credentials = credentialsResponse?.data?.data;
  const device = deviceData?.data?.data;
  const handleCredentialsClick = () => {
    setFetchCredentials(true);
    setIsCredentialsOpen(true);
  };

  const deviceStatus =
    device?.status === 'active' || device?.status === 'idle'
      ? 'ACTIVE'
      : 'INACTIVE';

  const tabs: { id: TabType; label: string }[] = [
    { id: 'details', label: t('devices.details.tabs.details') },
    { id: 'attributes', label: t('devices.details.tabs.attributes') },
    { id: 'telemetry', label: t('devices.details.tabs.telemetry') },
    { id: 'control', label: t('devices.details.tabs.control', 'Control') },
    { id: 'alarms', label: t('devices.details.tabs.alarms') },
    { id: 'relations', label: t('devices.details.tabs.relations') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/devices')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">
                {device?.name || t('devices.details.fallbackTitle')}
              </h1>
              <Badge
                variant={deviceStatus === 'ACTIVE' ? 'success' : 'secondary'}
                className="rounded-full px-3 py-1"
              >
                {deviceStatus === 'ACTIVE'
                  ? t('devices.details.statusActive')
                  : t('devices.details.statusInactive')}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1 text-sm">
              {t('devices.details.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleCredentialsClick}
            disabled={isLoadingCredentials}
          >
            <Key className="h-4 w-4 mr-2" />
            {isLoadingCredentials
              ? t('common.loading')
              : t('devices.details.credentials')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'attributes' && id && (
        <DeviceAttributesTab deviceId={id} />
      )}
      {/* Telemetry/Attributes Tab */}
      {activeTab === 'telemetry' && id && <DeviceTelemetryTab deviceId={id} />}

      {/* Alarms Tab */}
      {activeTab === 'alarms' && id && <DeviceAlarmsTab deviceId={id} />}

      {/* Control Tab */}
      {activeTab === 'control' && id && <DeviceControlTab deviceId={id} />}

      {/* Details/General Tab */}
      {activeTab === 'details' && id && <DeviceGeneralTab deviceId={id} />}

      {/* Credentials Dialog */}
      <DeviceCredentialsDialog
        open={isCredentialsOpen}
        onOpenChange={setIsCredentialsOpen}
        credentials={credentials || null}
      />
    </div>
  );
}
