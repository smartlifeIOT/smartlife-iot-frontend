import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DetailPageHeader,
  type Tab,
} from '@/components/common/DetailPageHeader';
import { useAssetProfile } from '@/features/profiles/hooks';
import AssetsProfileDetailsTab from '@/features/profiles/components/AssetsProfileDetailsTab';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

type TabType = 'details' | 'auditLogs';

export default function AssetProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const {
    data: assetData,
    isLoading: isLoadingAssetProfile,
    isError: isErrorAssetProfile,
    error: errorAssetProfile,
  } = useAssetProfile(id || '');
  if (isLoadingAssetProfile) {
    return (
      <div>
        <LoadingOverlay />
      </div>
    );
  }
  if (isErrorAssetProfile) {
    return (
      <ErrorMessage
        title="Failed to load asset profile"
        error={errorAssetProfile}
        onRetry={() => window.location.reload()}
      />
    );
  }
  // API response structure: response.data.data.data
  const apiResponse = assetData?.data as
    | {
        data?: {
          data?: {
            name?: string;
            description?: string;
            defaultQueueName?: string;
            defaultRuleChain?: string;
            defaultEdgeRuleChain?: string;
          };
        };
      }
    | undefined;
  const asset = apiResponse?.data?.data;

  const tabs: Tab[] = [
    { id: 'details', label: 'Details' },
    { id: 'auditLogs', label: 'Audit Logs' },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backRoute="/asset-profiles"
        title={asset?.name || 'Asset Profile Details'}
        description={asset?.description || 'Asset Profile Details'}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      {/* Details/General Tab */}
      {activeTab === 'details' && id && (
        <AssetsProfileDetailsTab profileId={id} profileData={asset} />
      )}
    </div>
  );
}
