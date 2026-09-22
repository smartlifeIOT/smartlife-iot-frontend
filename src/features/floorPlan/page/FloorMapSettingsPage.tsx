import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';

interface FloorMapSettingsForm {
  measurementUnit: 'metric' | 'imperial';
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  gatewayColor: string;
  sensorColor: string;
  zoneColor: string;
  connectionColor: string;
}

const defaultSettings: FloorMapSettingsForm = {
  measurementUnit: 'metric',
  autoSaveEnabled: true,
  autoSaveInterval: 5,
  showGrid: true,
  snapToGrid: true,
  gridSize: 1,
  gatewayColor: '#10b981', // green
  sensorColor: '#f97316', // orange
  zoneColor: '#3b82f6', // blue
  connectionColor: '#a855f7', // purple
};

export default function FloorMapSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<FloorMapSettingsForm>({
      defaultValues: defaultSettings,
    });

  const measurementUnit = watch('measurementUnit');
  const autoSaveEnabled = watch('autoSaveEnabled');
  const showGrid = watch('showGrid');
  const snapToGrid = watch('snapToGrid');
  const gridSize = watch('gridSize');

  const onSubmit = async () => {
    try {
      // TODO: Implement API call to save settings
      toast.success(t('floorplans.settings.settingsAppliedSuccessfully'));
    } catch (error) {
      toast.error(t('floorplans.settings.failedToApplySettings'));
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = () => {
    setIsResetting(true);
    reset(defaultSettings);
    setTimeout(() => {
      setIsResetting(false);
      toast.success(t('floorplans.settings.settingsResetToDefaults'));
    }, 300);
  };

  const handleCancel = () => {
    navigate('/floor-plans');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('floorplans.settings.title')}
        actions={[
          {
            label: t('common.back'),
            onClick: () => navigate('/floor-plans'),
          },
        ]}
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* General Settings */}
            <div className="space-y-3 pt-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('floorplans.settings.generalSettings')}
              </h3>

              {/* Measurement Units */}
              <div className="space-y-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('floorplans.settings.measurementUnits')}
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={
                      measurementUnit === 'metric' ? 'default' : 'outline'
                    }
                    onClick={() => setValue('measurementUnit', 'metric')}
                    className={
                      measurementUnit === 'metric'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }
                  >
                    {t('floorplans.settings.metric')}
                  </Button>
                  <Button
                    type="button"
                    variant={
                      measurementUnit === 'imperial' ? 'default' : 'outline'
                    }
                    onClick={() => setValue('measurementUnit', 'imperial')}
                    className={
                      measurementUnit === 'imperial'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }
                  >
                    {t('floorplans.settings.imperial')}
                  </Button>
                </div>
              </div>

              {/* Auto-save Configuration */}
              <div className="space-y-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="autoSave"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('floorplans.settings.enableAutoSave')}
                  </Label>
                  <Switch
                    id="autoSave"
                    checked={autoSaveEnabled}
                    onCheckedChange={(checked) =>
                      setValue('autoSaveEnabled', checked)
                    }
                  />
                </div>
                {autoSaveEnabled && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 ml-0">
                    {t('floorplans.settings.interval', { minutes: watch('autoSaveInterval') })}
                  </div>
                )}
              </div>
            </div>

            {/* Grid Settings */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('floorplans.settings.gridSettings')}
              </h3>

              <div className="space-y-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="showGrid"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('floorplans.settings.showGrid')}
                  </Label>
                  <Switch
                    id="showGrid"
                    checked={showGrid}
                    onCheckedChange={(checked) => setValue('showGrid', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="snapToGrid"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('floorplans.settings.snapToGrid')}
                  </Label>
                  <Switch
                    id="snapToGrid"
                    checked={snapToGrid}
                    onCheckedChange={(checked) =>
                      setValue('snapToGrid', checked)
                    }
                  />
                </div>

                <div className="space-y-2 flex items-center justify-between">
                  <Label
                    htmlFor="gridSize"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('floorplans.settings.gridSize', { 
                      size: gridSize, 
                      unit: measurementUnit === 'metric' ? 'm' : 'ft' 
                    })}
                  </Label>
                  <Input
                    id="gridSize"
                    type="number"
                    min="0.1"
                    step="0.1"
                    {...register('gridSize', {
                      valueAsNumber: true,
                      min: 0.1,
                    })}
                    className="w-32 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('floorplans.settings.cancel')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isResetting}
              >
                {t('floorplans.settings.resetDefault')}
              </Button>
              <Button type="submit" variant="default">
                {t('floorplans.settings.applyChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
