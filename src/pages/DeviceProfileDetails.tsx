import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DetailPageHeader,
  type Tab,
} from '@/components/common/DetailPageHeader';
import { useDeviceProfile } from '@/features/profiles/hooks';
import {
  DeviceProfileDetailsTab,
  DeviceProfileTransportTab,
  DeviceProfileProvisioningTab,
  DeviceProfileAlarmRulesTab,
} from '@/features/profiles/components';
import type { DeviceProfileMultiStepFormData } from '@/features/profiles/types/device-profile-form.types';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

type TabType =
  | 'details'
  | 'Transport configuration'
  | 'Provisioning configuration'
  | 'Alarm rules'
  | 'auditLogs';

const DeviceProfileDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const {
    data: deviceData,
    isLoading: isLoadingDeviceProfile,
    isError: isErrorDeviceProfile,
    error: errorDeviceProfile,
  } = useDeviceProfile(id || '');

  if (isLoadingDeviceProfile) {
    return (
      <div>
        <LoadingOverlay />
      </div>
    );
  }

  if (isErrorDeviceProfile) {
    return (
      <ErrorMessage
        title="Failed to load device profile"
        error={errorDeviceProfile}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // API response structure: response.data.data.data
  const apiResponse = deviceData?.data as
    | {
        data?: {
          data?: {
            name?: string;
            description?: string;
            type?: string;
            defaultRuleChain?: string;
            queue?: string;
            defaultEdgeRuleChain?: string;
            transportConfiguration?: Record<string, unknown>;
            alarmRules?: Array<{
              name: string;
              condition: string;
              severity: string;
            }>;
            provisionConfiguration?: Record<string, unknown>;
          };
        };
      }
    | undefined;
  const device = apiResponse?.data?.data;

  // Transform API data to form data format
  const transformTransportConfig = (
    transportConfig?: Record<string, unknown>
  ): DeviceProfileMultiStepFormData['transportConfiguration'] | undefined => {
    if (!transportConfig) return undefined;
    return {
      mqttConfig: transportConfig.deviceTelemetryTopic
        ? {
            deviceTelemetryTopic: String(transportConfig.deviceTelemetryTopic),
            deviceAttributesTopic: String(
              transportConfig.deviceAttributesTopic || ''
            ),
            deviceRpcRequestTopic: String(
              transportConfig.deviceRpcRequestTopic || ''
            ),
            deviceRpcResponseTopic: String(
              transportConfig.deviceRpcResponseTopic || ''
            ),
          }
        : undefined,
      httpConfig: transportConfig.baseUrl
        ? {
            baseUrl: String(transportConfig.baseUrl),
            timeout: Number(transportConfig.timeout) || undefined,
          }
        : undefined,
      coapConfig:
        transportConfig.port && !transportConfig.baudRate
          ? {
              port: Number(transportConfig.port) || undefined,
              timeout: Number(transportConfig.timeout) || undefined,
            }
          : undefined,
      modbusConfig: transportConfig.baudRate
        ? {
            port: Number(transportConfig.port) || undefined,
            baudRate: Number(transportConfig.baudRate) || undefined,
          }
        : undefined,
      loraWanConfig: transportConfig.region
        ? {
            region: String(transportConfig.region),
            appEui: String(transportConfig.appEui || ''),
          }
        : undefined,
    };
  };

  const transformProvisioningConfig = (
    provisionConfig?: Record<string, unknown>
  ): DeviceProfileMultiStepFormData['provisionConfiguration'] | undefined => {
    if (!provisionConfig) return undefined;
    const provisionType = String(
      provisionConfig.provisionType || 'Allow creating new devices'
    );
    return {
      provisionType: provisionType as
        | 'Allow creating new devices'
        | 'Check pre-provisioned devices'
        | 'Disabled',
      defaultRuleChain: String(provisionConfig.defaultRuleChain || ''),
      preProvisionedDevices: Array.isArray(
        provisionConfig.preProvisionedDevices
      )
        ? (provisionConfig.preProvisionedDevices as string[])
        : [],
    };
  };

  const tabs: Tab[] = [
    { id: 'details', label: 'Details' },
    { id: 'Transport configuration', label: 'Transport configuration' },
    { id: 'Provisioning configuration', label: 'Provisioning configuration' },
    { id: 'Alarm rules', label: 'Alarm rules' },
    { id: 'auditLogs', label: 'Audit Logs' },
  ];

  const handleSuccess = () => {
    // Optionally refetch data or show success message
  };

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backRoute="/device-profiles"
        title={device?.name || 'Device Profile Details'}
        description={device?.description || 'Device Profile Details'}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      {activeTab === 'details' && id && (
        <DeviceProfileDetailsTab
          profileId={id}
          profileData={{
            name: device?.name,
            description: device?.description,
            type: device?.type,
            defaultRuleChain: device?.defaultRuleChain,
            queue: device?.queue,
            defaultEdgeRuleChain: device?.defaultEdgeRuleChain,
          }}
          onSuccess={handleSuccess}
        />
      )}

      {activeTab === 'Transport configuration' && id && (
        <DeviceProfileTransportTab
          profileId={id}
          profileData={{
            transportConfiguration: transformTransportConfig(
              device?.transportConfiguration
            ),
          }}
          onSuccess={handleSuccess}
        />
      )}

      {activeTab === 'Provisioning configuration' && id && (
        <DeviceProfileProvisioningTab
          profileId={id}
          profileData={{
            provisionConfiguration: transformProvisioningConfig(
              device?.provisionConfiguration
            ),
          }}
          onSuccess={handleSuccess}
        />
      )}

      {activeTab === 'Alarm rules' && id && (
        <DeviceProfileAlarmRulesTab
          profileId={id}
          profileData={{
            alarmRules: device?.alarmRules?.map((rule) => ({
              name: rule.name,
              condition: rule.condition,
              severity: rule.severity as
                | 'CRITICAL'
                | 'MAJOR'
                | 'MINOR'
                | 'WARNING'
                | 'INDETERMINATE',
            })),
          }}
          onSuccess={handleSuccess}
        />
      )}

      {activeTab === 'auditLogs' && (
        <div className="text-center py-8 text-gray-500">
          Audit logs coming soon...
        </div>
      )}
    </div>
  );
};

export default DeviceProfileDetails;
