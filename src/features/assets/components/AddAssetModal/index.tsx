import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, MapPin } from 'lucide-react';
import {
  useForm,
  Controller,
  useFieldArray,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationMap } from '@/components/common/LocationMap';
import { useAssetProfiles } from '@/features/profiles/hooks';
import { useAssets } from '@/features/assets/hooks';
import type { AssetProfile as ApiAssetProfile } from '@/services/api/profiles.api';
import type { Asset as ApiAsset } from '@/services/api/assets.api';
import type { Asset } from '@/features/assets/hooks';

export interface AdditionalAttribute {
  key: string;
  value: string;
}

export interface BuildingDetails {
  name: string;
  floors: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface AddAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    type: string;
    description: string;
    assetProfileId?: string;
    parentAssetId?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    attributes: AdditionalAttribute[];
    building?: BuildingDetails;
  }) => void;
  isLoading?: boolean;
  mode?: 'add' | 'edit';
  initialData?: Partial<Asset>;
}

const optionalNumber = z.preprocess((v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : undefined;
}, z.number().positive().optional());

const optionalPositiveInt = z.preprocess((v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return undefined;
  return n;
}, z.number().int().positive().optional());

const createSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(1, t('addAsset.nameRequired') || 'Asset name is required'),
      type: z
        .string()
        .min(1, t('addAsset.typeRequired') || 'Asset type is required'),
      description: z.string().optional().default(''),
      assetProfileId: z.string().optional().default(''),
      parentAssetId: z.string().optional().default(''),
      location: z
        .object({
          latitude: z.string().optional().default(''),
          longitude: z.string().optional().default(''),
        })
        .default({ latitude: '', longitude: '' }),
      building: z
        .object({
          name: z.string().optional().default(''),
          floors: optionalPositiveInt,
          dimensions: z
            .object({
              width: optionalNumber,
              height: optionalNumber,
            })
            .default({}),
        })
        .default({ name: '', floors: undefined, dimensions: {} }),
      attributes: z
        .array(
          z.object({
            key: z.string().optional().default(''),
            value: z.string().optional().default(''),
          })
        )
        .default([{ key: '', value: '' }]),
    })
    .superRefine((values, ctx) => {
      const latStr = (values.location.latitude ?? '').trim();
      const lngStr = (values.location.longitude ?? '').trim();
      const hasLat = latStr !== '';
      const hasLng = lngStr !== '';

      if (hasLat !== hasLng) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['location', 'latitude'],
          message:
            t('addAsset.bothCoordinatesRequired') ||
            'Both latitude and longitude are required',
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['location', 'longitude'],
          message:
            t('addAsset.bothCoordinatesRequired') ||
            'Both latitude and longitude are required',
        });
      }

      if (hasLat && hasLng) {
        const lat = Number(latStr);
        const lng = Number(lngStr);

        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['location', 'latitude'],
            message:
              t('addAsset.invalidLatitude') ||
              'Latitude must be between -90 and 90',
          });
        }

        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['location', 'longitude'],
            message:
              t('addAsset.invalidLongitude') ||
              'Longitude must be between -180 and 180',
          });
        }
      }

      if (values.type === 'building') {
        const buildingName = (values.building?.name ?? '').trim();
        if (!buildingName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['building', 'name'],
            message: 'Building name is required',
          });
        }

        const floors = values.building?.floors;
        if (!floors || floors < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['building', 'floors'],
            message: 'Floors must be at least 1',
          });
        }

        const width = values.building?.dimensions?.width;
        const height = values.building?.dimensions?.height;
        if (!width || width <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['building', 'dimensions', 'width'],
            message: 'Width is required',
          });
        }
        if (!height || height <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['building', 'dimensions', 'height'],
            message: 'Height is required',
          });
        }
      }
    });

type AddAssetFormValues = z.input<ReturnType<typeof createSchema>>;

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
  mode = 'add',
  initialData,
}) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);

  const form = useForm<AddAssetFormValues>({
    // NOTE: Some repos end up with duplicate `react-hook-form` type copies via dependencies.
    // Casting keeps types stable while still validating at runtime.
    resolver: zodResolver(schema) as unknown as Resolver<AddAssetFormValues>,
    defaultValues: {
      name: '',
      type: '',
      description: '',
      assetProfileId: '',
      parentAssetId: '',
      location: { latitude: '', longitude: '' },
      building: { name: '', floors: undefined, dimensions: {} },
      attributes: [{ key: '', value: '' }],
    },
    mode: 'onSubmit',
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
    trigger,
  } = form;

  const assetType = watch('type');

  const {
    fields: attributeFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'attributes',
  });

  const { data: assetProfilesData } = useAssetProfiles();
  const { data: assetsData } = useAssets({ limit: 200 });

  const assetProfilesResponse = assetProfilesData?.data as
    | { data?: { data?: ApiAssetProfile[] } }
    | undefined;
  const assetProfilesList = assetProfilesResponse?.data?.data ?? [];

  // assetsData similarly contains paginated assets list
  const assetsResponse = assetsData?.data as
    | { data?: { data?: ApiAsset[] } }
    | undefined;
  const parentAssetsList = assetsResponse?.data?.data ?? [];
  // Mock data for selects - keep assetTypes mocked
  const assetTypes = [
    'building',
    'floor',
    'room',
    'vehicle',
    'equipment',
    'infrastructure',
    'zone',
  ];

  // Clear building fields when not building
  useEffect(() => {
    if (assetType !== 'building') {
      setValue('building.name', '');
      setValue('building.floors', undefined);
      setValue('building.dimensions.width', undefined);
      setValue('building.dimensions.height', undefined);
    }
  }, [assetType, setValue]);

  // Populate form with initialData when in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      reset({
        name: initialData.name ?? '',
        type: initialData.type ?? '',
        description: initialData.description ?? '',
        assetProfileId: initialData.assetProfileId ?? '',
        parentAssetId: initialData.parentAssetId ?? '',
        location: {
          latitude:
            initialData.location?.latitude != null
              ? String(initialData.location.latitude)
              : '',
          longitude:
            initialData.location?.longitude != null
              ? String(initialData.location.longitude)
              : '',
        },
        building: {
          name: initialData.additionalInfo?.buildingName ?? '',
          floors: initialData.additionalInfo?.floors ?? undefined,
          dimensions: {
            width: initialData.additionalInfo?.width ?? undefined,
            height: initialData.additionalInfo?.height ?? undefined,
          },
        },
        attributes:
          initialData.attributes &&
          Array.isArray(initialData.attributes) &&
          initialData.attributes.length > 0
            ? initialData.attributes.map((attr: any) => ({
                key: attr.key || '',
                value: attr.value != null ? String(attr.value) : '',
              }))
            : [{ key: '', value: '' }],
      });
    } else if (open && mode === 'add') {
      reset({
        name: '',
        type: '',
        description: '',
        assetProfileId: '',
        parentAssetId: '',
        location: { latitude: '', longitude: '' },
        building: { name: '', floors: undefined, dimensions: {} },
        attributes: [{ key: '', value: '' }],
      });
    }
  }, [open, mode, initialData, reset]);

  const latitudeStr = watch('location.latitude');
  const longitudeStr = watch('location.longitude');

  const { latitudeNum, longitudeNum } = useMemo(() => {
    const lat = String(latitudeStr ?? '').trim();
    const lng = String(longitudeStr ?? '').trim();
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    return { latitudeNum: latNum, longitudeNum: lngNum };
  }, [latitudeStr, longitudeStr]);

  const handleLocationChange = async (lat: number, lng: number) => {
    setValue('location.latitude', lat.toString());
    setValue('location.longitude', lng.toString());
    // Trigger validation after both values are set to clear any errors
    await trigger(['location.latitude', 'location.longitude']);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: AddAssetFormValues) => {
    const validAttributes = (values.attributes ?? []).filter(
      (attr) => (attr.key ?? '').trim() && (attr.value ?? '').trim()
    ) as AdditionalAttribute[];

    const lat = String(values.location?.latitude ?? '').trim();
    const lng = String(values.location?.longitude ?? '').trim();
    const location =
      lat && lng
        ? { latitude: Number(lat), longitude: Number(lng) }
        : undefined;

    const building =
      values.type === 'building'
        ? ({
            name: String(values.building?.name ?? '').trim(),
            floors: Number(values.building?.floors ?? 1) || 1,
            dimensions: {
              width: Number(values.building?.dimensions?.width ?? 0) || 0,
              height: Number(values.building?.dimensions?.height ?? 0) || 0,
            },
          } satisfies BuildingDetails)
        : undefined;

    await onSave({
      name: values.name,
      type: values.type,
      description: values.description ?? '',
      assetProfileId: values.assetProfileId || undefined,
      parentAssetId: values.parentAssetId || undefined,
      location,
      attributes: validAttributes,
      ...(building ? { building } : {}),
    });

    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden dark:bg-gray-950 dark:border-gray-700 ">
        {/* Header */}
        <DialogHeader className="bg-primary text-white p-4 rounded-t-lg dark:bg-gray-950 dark:border-gray-700 dark:border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-semibold">
              {mode === 'edit'
                ? t('addAsset.editTitle') || 'Edit Asset'
                : t('addAsset.title') || 'Add New Asset'}
            </DialogTitle>
            <button
              onClick={handleCancel}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 bg-white max-h-[70vh] overflow-y-auto dark:bg-gray-950 dark:border-gray-700">
          <form
            className="space-y-4"
            onSubmit={handleSubmit(
              onSubmit as unknown as SubmitHandler<AddAssetFormValues>
            )}
          >
            {/* Asset Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addAsset.assetName') || 'Asset Name'} *
              </label>
              <Input
                {...register('name')}
                placeholder={
                  t('addAsset.assetNamePlaceholder') || 'Asset Name *'
                }
                className={
                  errors.name
                    ? 'border-red-500 border-2 rounded-md'
                    : 'border-2 rounded-md'
                }
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addAsset.assetType') || 'Asset Type'} *
              </label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={errors.type ? 'border-red-500' : ''}
                    >
                      <SelectValue
                        placeholder={
                          t('addAsset.assetTypePlaceholder') ||
                          'Select asset type...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Building Details */}
            {assetType === 'building' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Building Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Name *
                  </label>
                  <Input
                    {...register('building.name')}
                    placeholder="e.g., HQ Building"
                    className={
                      errors.building?.name
                        ? 'border-red-500 border-2 rounded-md'
                        : 'border-2 rounded-md'
                    }
                  />
                  {errors.building?.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.building.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floors *
                    </label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...register('building.floors')}
                      placeholder="e.g., 5"
                      className={
                        errors.building?.floors
                          ? 'border-red-500 border-2 rounded-md'
                          : 'border-2 rounded-md'
                      }
                    />
                    {errors.building?.floors && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.building.floors.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (m) *
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      {...register('building.dimensions.width')}
                      placeholder="e.g., 120"
                      className={
                        errors.building?.dimensions?.width
                          ? 'border-red-500 border-2 rounded-md'
                          : 'border-2 rounded-md'
                      }
                    />
                    {errors.building?.dimensions?.width && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.building.dimensions.width.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (m) *
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      {...register('building.dimensions.height')}
                      placeholder="e.g., 60"
                      className={
                        errors.building?.dimensions?.height
                          ? 'border-red-500 border-2 rounded-md'
                          : 'border-2 rounded-md'
                      }
                    />
                    {errors.building?.dimensions?.height && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.building.dimensions.height.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addAsset.description') || 'Description'}
              </label>
              <Textarea
                {...register('description')}
                placeholder={
                  t('addAsset.descriptionPlaceholder') || 'Enter description'
                }
                className="min-h-[80px] w-full"
              />
            </div>

            {/* Asset Profile and Parent Asset */}
            <div className="grid grid-cols-2 gap-4">
              {/* Asset Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('addAsset.assetProfile') || 'Asset Profile'}
                </label>
                <Controller
                  control={control}
                  name="assetProfileId"
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            t('addAsset.assetProfilePlaceholder') ||
                            'Select profile...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assetProfilesList.length === 0 ? (
                          <SelectItem value="">
                            {t('addAsset.noProfiles') || 'No profiles found'}
                          </SelectItem>
                        ) : (
                          assetProfilesList.map((profile: ApiAssetProfile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {/* Parent Asset */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('addAsset.parentAsset') || 'Parent Asset'}
                </label>
                <Controller
                  control={control}
                  name="parentAssetId"
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            t('addAsset.parentAssetPlaceholder') ||
                            'Select parent...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {parentAssetsList.length === 0 ? (
                          <SelectItem value="">
                            {t('addAsset.noParents') || 'No parent assets'}
                          </SelectItem>
                        ) : (
                          parentAssetsList.map((parent: ApiAsset) => (
                            <SelectItem key={parent.id} value={parent.id}>
                              {parent.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Location Coordinates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                {t('addAsset.location') || 'Location'}
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Latitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t('addAsset.latitude') || 'Latitude'}
                  </label>
                  <Input
                    type="text"
                    {...register('location.latitude')}
                    placeholder={
                      t('addAsset.latitudePlaceholder') || 'e.g., 40.7128'
                    }
                    className={
                      errors.location?.latitude
                        ? 'border-red-500 border-2 rounded-md'
                        : 'border-2 rounded-md'
                    }
                  />
                  {errors.location?.latitude && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.location.latitude.message}
                    </p>
                  )}
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t('addAsset.longitude') || 'Longitude'}
                  </label>
                  <Input
                    type="text"
                    {...register('location.longitude')}
                    placeholder={
                      t('addAsset.longitudePlaceholder') || 'e.g., -74.0060'
                    }
                    className={
                      errors.location?.longitude
                        ? 'border-red-500 border-2 rounded-md'
                        : 'border-2 rounded-md'
                    }
                  />
                  {errors.location?.longitude && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.location.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Display */}
              <div className="mt-2">
                <LocationMap
                  latitude={latitudeNum}
                  longitude={longitudeNum}
                  height="250px"
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>

            {/* Additional Attributes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addAsset.additionalAttributes') || 'Additional Attributes'}
              </label>
              <div className="space-y-2">
                {attributeFields.map((_field, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder={
                        t('addAsset.additionalAttributes') ||
                        'Additional Attributes'
                      }
                      {...register(`attributes.${index}.key` as const)}
                      className="flex-1"
                    />
                    <Input
                      placeholder={t('addAsset.value') || 'Value'}
                      {...register(`attributes.${index}.value` as const)}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      {index === attributeFields.length - 1 && (
                        <Button
                          type="button"
                          onClick={() => append({ key: '', value: '' })}
                          className="bg-secondary hover:bg-secondary/90 text-white px-3"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                          {t('addAsset.add') || 'Add'}
                        </Button>
                      )}
                      {attributeFields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="outline"
                          className="px-3"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('addAsset.remove') || 'Remove'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        {/* Footer */}
        <DialogFooter className="bg-gray-50 p-4 rounded-b-lg flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t('addAsset.cancel') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(
              onSubmit as unknown as SubmitHandler<AddAssetFormValues>
            )}
            disabled={isLoading}
            className="bg-black hover:bg-black/90 text-white"
            isLoading={isLoading}
          >
            {isLoading
              ? t('common.saving') || 'Saving...'
              : mode === 'edit'
                ? t('addAsset.update') || 'Update'
                : t('addAsset.save') || 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
