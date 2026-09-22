import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/pop-over';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/util';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useManufacturers,
  useModels,
  useCategories,
  useFamilies,
} from '../hooks/useDevices';
import type {
  DeviceFormData,
  DeviceFamily,
  DeviceVariant,
} from '../types/device.types';

export interface DeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<DeviceFormData>;
  onSubmit: (data: DeviceFormData) => void | Promise<void>;
  isLoading?: boolean;
}

const deviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  type: z.string().min(1, 'Device type is required'),
  description: z.string().optional(),
  gatewayId: z.string().optional(),
  connectionType: z.string().min(1, 'Connection type is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  category: z.string().optional(),
  family: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  codecId: z.string().optional(),
  protocol: z.string().optional(),
});

type DeviceSchema = z.infer<typeof deviceSchema>;

export const DeviceDialog: React.FC<DeviceDialogProps> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [enableGatewayAssignment, setEnableGatewayAssignment] = useState(false);
  const [isManufacturersOpen, setIsManufacturersOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isFamiliesOpen, setIsFamiliesOpen] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [manufacturersSearch, setManufacturersSearch] = useState('');
  const [categoriesSearch, setCategoriesSearch] = useState('');
  const [familiesSearch, setFamiliesSearch] = useState('');
  const [modelsSearch, setModelsSearch] = useState('');
  const [manufacturerWidth, setManufacturerWidth] = useState(0);
  const [categoryWidth, setCategoryWidth] = useState(0);
  const [familyWidth, setFamilyWidth] = useState(0);
  const [modelWidth, setModelWidth] = useState(0);
  const [selectionMethod, setSelectionMethod] = useState<
    'hierarchy' | 'direct'
  >('hierarchy');
  const manufacturerRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef<HTMLButtonElement>(null);
  const familyRef = useRef<HTMLButtonElement>(null);
  const modelRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeviceSchema>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      gatewayId: '',
      connectionType: '',
      manufacturer: '',
      category: '',
      family: '',
      model: '',
      codecId: '',
      protocol: 'lorawan_milesight',
    },
  });

  const watchManufacturer = watch('manufacturer');
  const watchCategory = watch('category');
  const watchFamily = watch('family');
  const watchModel = watch('model');

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        type: initialData?.type || '',
        description: initialData?.description || '',
        gatewayId: initialData?.gatewayId || '',
        connectionType: initialData?.connectionType || '',
        manufacturer: initialData?.manufacturer || '',
        category: initialData?.category || '',
        family: initialData?.family || '',
        model: initialData?.model || '',
        codecId: initialData?.codecId || '',
        protocol: initialData?.protocol || 'lorawan_milesight',
      });
      setEnableGatewayAssignment(!!initialData?.gatewayId);
      setManufacturersSearch('');
      setCategoriesSearch('');
      setFamiliesSearch('');
      setModelsSearch('');
    }
  }, [open, initialData, reset]);

  const { data: manufacturersResponse, isLoading: isLoadingManufacturers } =
    useManufacturers();
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useCategories(watchManufacturer || '');
  const { data: familiesResponse, isLoading: isLoadingFamilies } = useFamilies(
    watchManufacturer || '',
    watchCategory || ''
  );
  const { data: modelsResponse, isLoading: isLoadingDirectModels } = useModels(
    watchManufacturer || ''
  );

  const manufacturers = manufacturersResponse?.data?.data.data || [];
  const categories = categoriesResponse?.data?.data.data || [];
  const families: DeviceFamily[] = familiesResponse?.data?.data.data || [];
  const directModels = modelsResponse?.data?.data.data || [];

  const selectedFamilyData = families.find((f) => f.family === watchFamily);
  const hierarchicalModels = selectedFamilyData?.variants || [];

  const onFormSubmit = async (data: DeviceSchema) => {
    await onSubmit(data as DeviceFormData);
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
    setEnableGatewayAssignment(false);
  };

  const isCreateMode = mode === 'create';

  const filteredManufacturers = manufacturers.filter((m) =>
    m.toLowerCase().includes(manufacturersSearch.toLowerCase())
  );
  const filteredCategories = categories.filter((c: string) =>
    c.toLowerCase().includes(categoriesSearch.toLowerCase())
  );
  const filteredFamilies = families.filter((f: DeviceFamily) =>
    f.family.toLowerCase().includes(familiesSearch.toLowerCase())
  );

  const currentModelsList =
    selectionMethod === 'direct' ? directModels : hierarchicalModels;

  const filteredModels = currentModelsList.filter((m: DeviceVariant) =>
    m.model.toLowerCase().includes(modelsSearch.toLowerCase())
  );

  useEffect(() => {
    if (isManufacturersOpen && manufacturerRef.current) {
      setManufacturerWidth(manufacturerRef.current.offsetWidth);
    }
  }, [isManufacturersOpen]);

  useEffect(() => {
    if (isCategoriesOpen && categoryRef.current) {
      setCategoryWidth(categoryRef.current.offsetWidth);
    }
  }, [isCategoriesOpen]);

  useEffect(() => {
    if (isFamiliesOpen && familyRef.current) {
      setFamilyWidth(familyRef.current.offsetWidth);
    }
  }, [isFamiliesOpen]);

  useEffect(() => {
    if (isModelsOpen && modelRef.current) {
      setModelWidth(modelRef.current.offsetWidth);
    }
  }, [isModelsOpen]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-lg border-none gap-  overflow-hidden shadow-none dark:bg-gray-950 dark:border-gray-700 ">
        <DialogHeader className="dark:text-white dark:bg-gray-950 dark:border-gray-700 dark:border-b">
          <DialogTitle>
            {isCreateMode ? t('devices.addDevice') : t('devices.editDevice')}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? t('devices.form.addDescription')
              : t('devices.form.editDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="max-h-[80vh] px-6 pb-6 overflow-y-auto"
        >
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="device-name">{t('devices.deviceName')} *</Label>
              <Input
                id="device-name"
                {...register('name')}
                placeholder={t('devices.form.namePlaceholder')}
                className={cn(
                  'border-2  rounded-md',
                  errors.name && 'border-destructive'
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="device-type-select">
                {t('devices.deviceType')} *
              </Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toLowerCase() || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={cn(errors.type && 'border-destructive')}
                    >
                      <SelectValue placeholder={t('devices.form.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sensor">
                        {t('devices.form.types.sensor')}
                      </SelectItem>
                      <SelectItem value="actuator">
                        {t('devices.form.types.actuator')}
                      </SelectItem>
                      <SelectItem value="gateway">
                        {t('devices.form.types.gateway')}
                      </SelectItem>
                      <SelectItem value="controller">
                        {t('devices.form.types.controller')}
                      </SelectItem>
                      <SelectItem value="camera">
                        {t('devices.form.types.camera')}
                      </SelectItem>
                      <SelectItem value="tracker">
                        {t('devices.form.types.tracker')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="device-connection-select">
                {t('devices.connectionType')} *
              </Label>
              <Controller
                name="connectionType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toLowerCase() || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={cn(
                        errors.connectionType && 'border-destructive'
                      )}
                    >
                      <SelectValue
                        placeholder={t('devices.form.selectConnectionType')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wifi">
                        {t('devices.form.connections.wifi')}
                      </SelectItem>
                      <SelectItem value="ethernet">
                        {t('devices.form.connections.ethernet')}
                      </SelectItem>
                      <SelectItem value="bluetooth">
                        {t('devices.form.connections.bluetooth')}
                      </SelectItem>
                      <SelectItem value="cellular">
                        {t('devices.form.connections.cellular')}
                      </SelectItem>
                      <SelectItem value="zigbee">
                        {t('devices.form.connections.zigbee')}
                      </SelectItem>
                      <SelectItem value="lora">
                        {t('devices.form.connections.lora')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.connectionType && (
                <p className="text-xs text-destructive mt-1">
                  {errors.connectionType.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="device-manufacturer-select">
                {t('devices.manufacturer')}
              </Label>
              <Controller
                name="manufacturer"
                control={control}
                render={({ field }) => (
                  <Popover
                    open={isManufacturersOpen}
                    onOpenChange={setIsManufacturersOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        ref={manufacturerRef}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between font-normal rounded-md border-2 h-10 px-3 hover:bg-transparent'
                        )}
                      >
                        <span className="truncate">
                          {field.value || t('devices.selectManufacturer')}
                        </span>
                        <div className="flex items-center">
                          {isLoadingManufacturers && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                          )}
                          <ChevronDown
                            className={cn(
                              'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
                              isManufacturersOpen && 'rotate-180'
                            )}
                          />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 border-primary/10"
                      style={{ width: manufacturerWidth }}
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder={t('common.search')}
                          value={manufacturersSearch}
                          onInput={(e: any) =>
                            setManufacturersSearch(e.target.value)
                          }
                          autoFocus
                        />
                        <CommandList className="max-h-[250px]">
                          {filteredManufacturers.length === 0 && (
                            <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
                              {t('common.noResults')}
                            </CommandEmpty>
                          )}
                          <CommandGroup>
                            {filteredManufacturers.map((m) => (
                              <CommandItem
                                key={m}
                                onClick={() => {
                                  field.onChange(m);
                                  setValue('category', '');
                                  setValue('family', '');
                                  setValue('model', '');
                                  setValue('codecId', '');
                                  setIsManufacturersOpen(false);
                                  setManufacturersSearch('');
                                }}
                                className="cursor-pointer hover:bg-primary/5 transition-colors"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4 text-primary',
                                    field.value === m
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {m}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <Tabs
              defaultValue="hierarchy"
              value={selectionMethod}
              onValueChange={(val: any) => {
                setSelectionMethod(val);
                // Clear fields when switching
                if (val === 'direct') {
                  setValue('category', '');
                  setValue('family', '');
                }
                setValue('model', '');
                setValue('codecId', '');
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hierarchy" className="w-full">
                  {t('devices.selection.byCategory', 'By Category')}
                </TabsTrigger>
                <TabsTrigger value="direct" className="w-full">
                  {t('devices.selection.byModel', 'By Model')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hierarchy" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="device-category-select">
                    {t('devices.category', 'Category')}
                  </Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Popover
                        open={isCategoriesOpen}
                        onOpenChange={setIsCategoriesOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            ref={categoryRef}
                            variant="outline"
                            role="combobox"
                            disabled={!watchManufacturer}
                            className={cn(
                              'w-full justify-between font-normal rounded-md border-2 h-10 px-3 hover:bg-transparent',
                              !watchManufacturer &&
                                'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <span className="truncate">
                              {field.value ||
                                t('devices.selectCategory', 'Select Category')}
                            </span>
                            <div className="flex items-center">
                              {isLoadingCategories && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                              )}
                              <ChevronDown
                                className={cn(
                                  'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
                                  isCategoriesOpen && 'rotate-180'
                                )}
                              />
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0 border-primary/10"
                          style={{ width: categoryWidth }}
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder={t('common.search')}
                              value={categoriesSearch}
                              onInput={(e: any) =>
                                setCategoriesSearch(e.target.value)
                              }
                              autoFocus
                            />
                            <CommandList className="max-h-[250px]">
                              {filteredCategories.length === 0 && (
                                <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
                                  {t('common.noResults')}
                                </CommandEmpty>
                              )}
                              <CommandGroup>
                                {filteredCategories.map((c) => (
                                  <CommandItem
                                    key={c}
                                    onClick={() => {
                                      field.onChange(c);
                                      setValue('family', '');
                                      setValue('model', '');
                                      setValue('codecId', '');
                                      setIsCategoriesOpen(false);
                                      setCategoriesSearch('');
                                    }}
                                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4 text-primary',
                                        field.value === c
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {c}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="device-family-select">
                    {t('devices.family', 'Family')}
                  </Label>
                  <Controller
                    name="family"
                    control={control}
                    render={({ field }) => (
                      <Popover
                        open={isFamiliesOpen}
                        onOpenChange={setIsFamiliesOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            ref={familyRef}
                            variant="outline"
                            role="combobox"
                            disabled={!watchCategory}
                            className={cn(
                              'w-full justify-between font-normal rounded-md border-2 h-10 px-3 hover:bg-transparent',
                              !watchCategory && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <span className="truncate">
                              {field.value ||
                                t('devices.selectFamily', 'Select Family')}
                            </span>
                            <div className="flex items-center">
                              {isLoadingFamilies && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                              )}
                              <ChevronDown
                                className={cn(
                                  'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
                                  isFamiliesOpen && 'rotate-180'
                                )}
                              />
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0 border-primary/10"
                          style={{ width: familyWidth }}
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder={t('common.search')}
                              value={familiesSearch}
                              onInput={(e: any) =>
                                setFamiliesSearch(e.target.value)
                              }
                              autoFocus
                            />
                            <CommandList className="max-h-[250px]">
                              {filteredFamilies.length === 0 && (
                                <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
                                  {t('common.noResults')}
                                </CommandEmpty>
                              )}
                              <CommandGroup>
                                {filteredFamilies.map((f: DeviceFamily) => (
                                  <CommandItem
                                    key={f.family}
                                    onClick={() => {
                                      field.onChange(f.family);
                                      setValue('model', '');
                                      setValue('codecId', '');
                                      setIsFamiliesOpen(false);
                                      setFamiliesSearch('');
                                    }}
                                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4 text-primary',
                                        field.value === f.family
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {f.family}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="direct" className="space-y-4 mt-4">
                {/* Manufacturer is shared, so we don't repeat it here. Just the model. */}
              </TabsContent>
            </Tabs>

            <div>
              <Label htmlFor="device-model-select">
                {t('devices.modelNumber')}
              </Label>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <Popover open={isModelsOpen} onOpenChange={setIsModelsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        ref={modelRef}
                        variant="outline"
                        role="combobox"
                        disabled={
                          selectionMethod === 'direct'
                            ? !watchManufacturer
                            : !watchFamily
                        }
                        className={cn(
                          'w-full justify-between rounded-md font-normal border-2 h-10 px-3 hover:bg-transparent',
                          (selectionMethod === 'direct'
                            ? !watchManufacturer
                            : !watchFamily) &&
                            'bg-gray-100 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        <span className="truncate">
                          {field.value || t('devices.selectModelNumber')}
                        </span>
                        <div className="flex items-center">
                          {(selectionMethod === 'direct'
                            ? isLoadingDirectModels
                            : isLoadingFamilies) && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          <ChevronDown
                            className={cn(
                              'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
                              isModelsOpen && 'rotate-180'
                            )}
                          />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 border-primary/20"
                      style={{ width: modelWidth }}
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder={t('common.search')}
                          value={modelsSearch}
                          onInput={(e: any) => setModelsSearch(e.target.value)}
                          autoFocus
                        />
                        <CommandList className="max-h-[250px]">
                          {filteredModels.length === 0 && (
                            <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
                              {t('common.noResults')}
                            </CommandEmpty>
                          )}
                          <CommandGroup>
                            {filteredModels.map((m: DeviceVariant) => {
                              return (
                                <CommandItem
                                  key={m.model + m.codecId}
                                  onClick={() => {
                                    field.onChange(m.model);
                                    setValue('codecId', m.codecId);
                                    setValue('protocol', m.protocol);
                                    setIsModelsOpen(false);
                                    setModelsSearch('');
                                  }}
                                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4 text-primary',
                                      field.value === m.model
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {m.model}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {selectionMethod === 'hierarchy' && selectedFamilyData && (
              <div className="bg-slate-50 flex gap-4 p-4 rounded-lg border border-slate-200">
                <div className="w-32 h-32 flex-shrink-0 bg-white rounded-md border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={selectedFamilyData.imageUrl}
                    alt={selectedFamilyData.family}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-slate-800">
                    {watchModel || selectedFamilyData.family}
                  </h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold">
                        {t('common.family')}:
                      </span>{' '}
                      {selectedFamilyData.family}
                    </p>
                    {watchModel && (
                      <>
                        <p>
                          <span className="font-semibold">
                            {t('devices.codecId', 'Codec ID')}:
                          </span>{' '}
                          {
                            hierarchicalModels.find(
                              (m: DeviceVariant) => m.model === watchModel
                            )?.codecId
                          }
                        </p>
                        <p>
                          <span className="font-semibold">
                            {t('common.protocol')}:
                          </span>{' '}
                          {
                            hierarchicalModels.find(
                              (m: DeviceVariant) => m.model === watchModel
                            )?.protocol
                          }
                        </p>
                      </>
                    )}
                    <p className="mt-2 line-clamp-3">
                      <span className="font-semibold">
                        {t('common.description')}:
                      </span>{' '}
                      {selectedFamilyData.description ||
                        t('devices.noDescription', 'No description available')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectionMethod === 'direct' && watchModel && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-slate-800">{watchModel}</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold">
                        {t('devices.manufacturer')}:
                      </span>{' '}
                      {watchManufacturer}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {t('devices.codecId', 'Codec ID')}:
                      </span>{' '}
                      {
                        directModels.find(
                          (m: DeviceVariant) => m.model === watchModel
                        )?.codecId
                      }
                    </p>
                    <p>
                      <span className="font-semibold">
                        {t('common.protocol')}:
                      </span>{' '}
                      {
                        directModels.find(
                          (m: DeviceVariant) => m.model === watchModel
                        )?.protocol
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="device-description">
                {t('devices.form.description')}
              </Label>
              <Textarea
                id="device-description"
                {...register('description')}
                placeholder={t('devices.form.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="gateway-assignment"
                  checked={enableGatewayAssignment}
                  // onCheckedChange={(checked) => {
                  //   setEnableGatewayAssignment(!!checked);
                  //   if (!checked) {
                  //     setValue('gatewayId', '');
                  //   }
                  // }}
                />
                <Label htmlFor="gateway-assignment" className="cursor-pointer">
                  {t('devices.form.gatewayAssignment')}
                </Label>
              </div>
              <Controller
                name="gatewayId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    // disabled={!enableGatewayAssignment}
                  >
                    <SelectTrigger
                      className={cn(
                        !enableGatewayAssignment &&
                          'bg-gray-100 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      <SelectValue
                        placeholder={t('devices.form.selectGatewayPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gateway-1">
                        {t('devices.form.gateways.gateway1')}
                      </SelectItem>
                      <SelectItem value="gateway-2">
                        {t('devices.form.gateways.gateway2')}
                      </SelectItem>
                      <SelectItem value="gateway-3">
                        {t('devices.form.gateways.gateway3')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter className=" pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreateMode ? t('common.create') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
