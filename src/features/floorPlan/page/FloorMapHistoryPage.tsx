import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Trash2, GitCompare } from 'lucide-react';

interface FloorMapVersion {
  id: string;
  version: string;
  description: string;
  modifiedDate: string;
  modifiedBy: string;
  changes: string;
  isCurrent: boolean;
}

const mockVersions: FloorMapVersion[] = [
  {
    id: '1',
    version: '3.2',
    description: 'Ground Floor Complete Setup',
    modifiedDate: '2024-01-15 14:30',
    modifiedBy: 'John Doe',
    changes: '+3 devices, 2 zone modifications',
    isCurrent: true,
  },
  {
    id: '2',
    version: '3.1',
    description: 'Added sensors S-15, S-20 to kitchen and reception areas',
    modifiedDate: '2024-01-12 09:45',
    modifiedBy: 'Sarah Johnson',
    changes: '+2 devices, 1 zone modification',
    isCurrent: false,
  },
  {
    id: '3',
    version: '3.0',
    description: 'Added sensors S-15, S-20 to kitchen and reception areas',
    modifiedDate: '2024-01-10 11:20',
    modifiedBy: 'Sarah Johnson',
    changes: '+2 devices, 1 zone modification',
    isCurrent: false,
  },
  {
    id: '4',
    version: '2.5',
    description: 'Added sensors S-15, S-20 to kitchen and reception areas',
    modifiedDate: '2024-01-08 16:15',
    modifiedBy: 'Sarah Johnson',
    changes: '+2 devices, 1 zone modification',
    isCurrent: false,
  },
  {
    id: '5',
    version: '2.0',
    description: 'Added sensors S-15, S-20 to kitchen and reception areas',
    modifiedDate: '2024-01-05 10:00',
    modifiedBy: 'Sarah Johnson',
    changes: '+2 devices, 1 zone modification',
    isCurrent: false,
  },
  {
    id: '6',
    version: '1.0',
    description: 'Initial floor map setup',
    modifiedDate: '2024-01-01 08:00',
    modifiedBy: 'Admin User',
    changes: 'Initial creation',
    isCurrent: false,
  },
  {
    id: '62',
    version: '1.0',
    description: 'Initial floor map setup',
    modifiedDate: '2024-01-01 08:00',
    modifiedBy: 'Admin User',
    changes: 'Initial creation',
    isCurrent: false,
  },
  {
    id: '62',
    version: '1.0',
    description: 'Initial floor map setup',
    modifiedDate: '2024-01-01 08:00',
    modifiedBy: 'Admin User',
    changes: 'Initial creation',
    isCurrent: false,
  },
];

export default function FloorMapHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const currentVersion = mockVersions.find((v) => v.isCurrent);
  const historyVersions = mockVersions.filter((v) => !v.isCurrent);

  const handleSelectVersion = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedVersions(historyVersions.map((v) => v.id));
    } else {
      setSelectedVersions([]);
    }
  };

  const handleExportHistory = () => {
    // TODO: Implement export functionality
    console.log('Exporting history...');
  };

  const handleDeleteSelected = () => {
    // TODO: Implement delete functionality
    console.log('Deleting selected versions:', selectedVersions);
    setSelectedVersions([]);
  };

  const handleCompare = () => {
    if (selectedVersions.length !== 2) {
      // TODO: Show error message
      console.log(t('floorplans.history.pleaseSelectTwoVersions'));
      return;
    }
    // TODO: Navigate to compare page
    console.log('Comparing versions:', selectedVersions);
  };
  

  return (
    <div className="space-y-6">

      <PageHeader
        title={t('floorplans.history.title', { building: 'Building A' })}
        actions={[
          {
            label: t('common.back'),
            onClick: () => navigate('/floor-plans'),
          },
        ]}
      />

      {/* Current Version */}
      {currentVersion ? (
        <Card className="bg-purple-50 border-purple-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-purple-600 text-white mb-2">
                  {t('floorplans.history.currentVersion')}
                </Badge>
                <CardTitle className="font-semibold text-gray-900 dark:text-white">
                  {t('floorplans.history.version', { version: currentVersion.version })} -{' '}
                  {currentVersion.description}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('floorplans.history.version', { version: currentVersion.version })} -{' '}
                  {currentVersion.description}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : null}

      {/* Version History */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="dark:text-white">
              {t('floorplans.history.versionHistory')}
            </CardTitle>
            {historyVersions.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedVersions.length === historyVersions.length &&
                    historyVersions.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  {t('floorplans.history.selectAll')}
                </label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[900px] overflow-y-auto px-4">
            {historyVersions.map((version) => (
              <Card
                key={version.id}
                className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`version-${version.id}`}
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => handleSelectVersion(version.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {t('floorplans.history.version', { version: version.version })}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                        {version.description}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t('floorplans.history.modified', { 
                          date: version.modifiedDate, 
                          user: version.modifiedBy 
                        })}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('floorplans.history.changes', { changes: version.changes })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 overflow-x-auto">
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportHistory}>
            <Download className="mr-2 h-4 w-4" />
            {t('floorplans.history.exportHistory')}
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteSelected}
            disabled={selectedVersions.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('floorplans.history.deleteSelected')}
          </Button>
          <Button
            onClick={handleCompare}
            disabled={selectedVersions.length !== 2}
            className="bg-primary text-white"
          >
            <GitCompare className="mr-2 h-4 w-4" />
            {t('floorplans.history.compare')}
          </Button>
        </div>
        <div className="bg-gray-800 dark:bg-gray-900 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">
            {t('floorplans.history.totalVersions', { 
              total: mockVersions.length, 
              active: 1 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}




