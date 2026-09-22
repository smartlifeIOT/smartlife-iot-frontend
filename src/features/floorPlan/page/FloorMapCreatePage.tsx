import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FilterFormValues } from '@/features/floorPlan/types';
import { AssetSelectionStep } from '@/features/floorPlan/components/AssetSelectionStep';
import { DwgImportStep } from '@/features/floorPlan/components/DwgImportStep';
import { ZoneSetupStep } from '@/features/floorPlan/components/ZoneSetupStep';
import { DeviceLinkStep } from '@/features/floorPlan/components/DeviceLinkStep';
import { ReviewStep } from '@/features/floorPlan/components/ReviewStep';

import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { useFloorMapStore } from '@/features/floorPlan/store';
import type { StepId } from '@/features/floorPlan/store';
import { useAssetsPage } from '@/features/assets/hooks';

export default function FloorMapCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps: { id: StepId; label: string }[] = [
    { id: 1, label: t('floorplans.create.stepAsset') },
    { id: 2, label: t('floorplans.create.stepDwgImport') },
    { id: 3, label: t('floorplans.create.stepZoneSetup') },
    { id: 4, label: t('floorplans.create.stepDeviceLink') },
    { id: 5, label: t('floorplans.create.step3dView') },
  ];

  // Zustand store
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    selectedAssetId,
    setSelectedAssetId,

    formValues,
    setFormValues,
    reset,
  } = useFloorMapStore();

  const {
    searchQuery,
    isLoading,
    assets,
    isError,
    error,
    currentPage,
    totalPages,
    itemsPerPage,
    meta,

    handleSearchChange,
    handlePageChange,
  } = useAssetsPage();
  // Handle nested API response structure: response.data.data (PaginatedResponse.data)
  const totalItems = meta?.totalItems;
  const assetsdataa = assets;
  // Initialize form with store values
  const form = useForm<FilterFormValues>({
    defaultValues: formValues,
  });

  const { register, control, setValue } = form;

  const {
    search,
    type = 'all',
    status = 'all',
  } = useWatch({
    control,
  });

  // Sync form values with store
  useEffect(() => {
    const subscription = form.watch((values) => {
      setFormValues(values as FilterFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, setFormValues]);

  const handleNext = () => {
    nextStep();
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving floor map...', useFloorMapStore.getState());
    // After saving, reset store and navigate back
    reset();
    navigate('/floor-plans');
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/floor-plans');
    } else {
      previousStep();
    }
  };

  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;

  const progressPercent =
    steps.length <= 1
      ? 10 // or 90 if you consider a single step completed
      : 10 + (validIndex / (steps.length - 1)) * 80;

  if (isLoading) {
    return (
      <div>
        <LoadingOverlay />
      </div>
    );
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('floorplans.create.title')}
        actions={[
          {
            label: t('common.back'),
            onClick: handleBack,
          },
        ]}
      />
      <Card className="">
        <CardHeader className="py-4">
          <CardTitle className="dark:text-white">
            {t('floorplans.create.stepTitle', {
              current: currentStep,
              total: 5,
            })}
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 relative m-4 relative">
          <div className="   h-3 rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-3 rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex relative -top-9  items-center justify-between gap-4">
            {steps.map((step) => {
              return (
                <div
                  key={step.id}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${'bg-primary text-white'}`}
                  >
                    {step.id}
                  </div>
                  <span className="mt-1  text-xs font-medium text-muted-foreground">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="pt-4">
        <CardContent className="space-y-6">
          {/* Stepper */}

          {/* Step content */}
          {currentStep === 1 && (
            <AssetSelectionStep
              register={register}
              control={control}
              setValue={setValue}
              filteredAssets={assetsdataa}
              selectedAssetId={selectedAssetId}
              onSelectAsset={setSelectedAssetId}
              onCancel={() => {
                reset();
                navigate('/floor-plans');
              }}
              onNext={handleNext}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              handleSearchChange={handleSearchChange}
              searchQuery={searchQuery}
            />
          )}

          {currentStep === 2 && (
            <DwgImportStep
              register={register}
              control={control}
              onPrevious={() => setCurrentStep(1)}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && (
            <ZoneSetupStep
              register={register}
              control={control}
              onPrevious={() => setCurrentStep(2)}
              onNext={handleNext}
            />
          )}

          {currentStep === 4 && (
            <DeviceLinkStep
              register={register}
              control={control}
              onPrevious={() => setCurrentStep(3)}
              onNext={handleNext}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              register={register}
              control={control}
              onPrevious={() => setCurrentStep(4)}
              onSave={handleSave}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
