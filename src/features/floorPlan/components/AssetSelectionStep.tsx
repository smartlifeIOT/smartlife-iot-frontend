import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssetOption, FilterFormValues } from '@/features/floorPlan/types';
import { Badge } from '@/components/ui/badge';
import { floorPlansApi } from '@/features/floorPlan/services/floor-plans.api';
import { useFloorMapStore } from '@/features/floorPlan/store';
import { Pagination } from '@/components/common/Pagination';
import { Asset } from '@/features/assets/hooks';
import { debounce } from '@/lib/util';
import { useTranslation } from 'react-i18next';

interface AssetSelectionStepProps {
  register: UseFormRegister<FilterFormValues>;
  control: Control<FilterFormValues>;
  setValue: UseFormSetValue<FilterFormValues>;
  filteredAssets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
  onCancel: () => void;
  onNext: () => void;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  handleSearchChange: (value: string) => void;
  searchQuery: string;
}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({
  control,
  setValue,
  filteredAssets,
  selectedAssetId,
  onSelectAsset,
  onCancel,
  onNext,
  totalPages,
  currentPage,
  itemsPerPage,
  onPageChange,
  totalItems,
  handleSearchChange,
  searchQuery,
}) => {
  const { t } = useTranslation();
  const [floorName, setFloorName] = useState('');
  const { setFloorPlanId } = useFloorMapStore();
  const [inputValue, setInputValue] = useState('');
  const { mutate: createFloorPlan, isPending } = useMutation({
    mutationFn: async (data: {
      assetId: string;
      name: string;
      status: string;
      building: string;
      floor: string;
      floorNumber: number;
      category: string;
      dimensions: { width: number; height: number; scale?: number };
    }) => {
      const response = await floorPlansApi.create({
        assetId: data.assetId,
        name: data.name,
        status: data.status,
        building: data.building,
        floor: data.floor,
        floorNumber: data.floorNumber,
        category: data.category,
        dimensions: data.dimensions,
      });
      return response;
    },
    onSuccess: (response) => {
      // Extract floor plan ID from response
      const floorPlanId = response.data?.data?.id;
      if (floorPlanId) {
        setFloorPlanId(floorPlanId);
      }
      toast.success('Floor plan created successfully');
      onNext();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Failed to create floor plan';
      toast.error(errorMessage);
    },
  });

  const handleNext = () => {
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }

    if (!floorName.trim()) {
      toast.error('Please enter a floor name');
      return;
    }

    createFloorPlan({
      assetId: selectedAssetId,
      name: floorName.trim(),
      building: 'Manufacturing Plant A',
      floor: 'Ground Floor',
      floorNumber: 0,
      category: 'Industrial',
      dimensions: {
        width: 100,
        height: 100,
      },
      status: 'draft',
    });
  };
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Create debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        handleSearchChange(value);
      }, 300),
    [handleSearchChange]
  );

  // Handle input change with immediate UI update and debounced search
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Select Asset for Floor Map
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose the asset (building/facility) for which you want to create a
          floor map.
        </p>
      </div>

      {/* Floor Name Input */}

      {/* Filters */}
      <form className="grid gap-4  md:grid-cols-4">
        <div>
          <Input
            type="text"
            placeholder={t('assets.searchPlaceholder')}
            value={inputValue}
            onChange={handleInputChange}
            className="w-96 pr-10"
          />
        </div>
      </form>

      {/* Asset cards */}
      <div className="grid gap-4 py-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets?.map((asset) => {
          const isSelected = asset.id === selectedAssetId;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelectAsset(asset.id)}
              className={`relative flex h-full flex-col overflow-hidden border-gray-300 justify-between rounded-e-xl border bg-white p-2 ps-10 text-left transition-shadow ${
                isSelected
                  ? '  shadow-md border-primary border-2'
                  : 'border-border  hover:shadow-sm'
              }`}
            >
              <div className="absolute left-0 top-0 h-full w-6 bg-primary" />
              <div className="space-y-1 text-xs">
                <p className="text-xs  ">
                  <b className="font-medium">Asset : </b>
                  <span className="font-semibold">{asset.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  <b className="font-medium">Type :</b> {asset.type}
                </p>
                <p className="">
                  <b className="font-medium">Description:</b>{' '}
                  <span>{asset?.description?.slice(0, 50)}</span>
                </p>
                <div className="text-xs text-muted-foreground">
                  <b className="font-medium"> Status : </b>
                  <Badge
                    className="py-0 px-1 text-xs"
                    variant={asset.active ? 'success' : 'destructive'}
                  >
                    {asset.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="">
        {totalPages > 1 && (
          <div className="mt-4  border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="floorName"
          className="text-sm text-black dark:text-white font-medium"
        >
          Floor Name * (Add a unique name for this floor)
        </Label>
        <Input
          id="floorName"
          placeholder="e.g., Factory Floor - Production Area"
          value={floorName}
          onChange={(e) => {
            setFloorName(e.target.value);
            setValue('floorName', e.target.value);
          }}
          className="bg-white border rounded-md"
        />
      </div>
      <div className="mt-4 flex items-center gap-2  ">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!selectedAssetId || !floorName.trim() || isPending}
        >
          {isPending ? 'Creating...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
