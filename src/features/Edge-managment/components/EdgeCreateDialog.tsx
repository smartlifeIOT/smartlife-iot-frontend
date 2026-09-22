import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateEdge } from '../hooks';
import type { EdgePayload, EdgeType } from '../hooks/edge.types';
import { edgePayloadSchema } from '../schema/edge.schema';

interface EdgeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string; // supplied by the parent (current customer context)
}

const EMPTY_FORM: EdgePayload = {
  name: '',
  description: '',
  type: 'GATEWAY',
  location: '',
  latitude: 0,
  longitude: 0,
  syncConfig: {
    syncRules: true,
    syncDashboards: true,
    syncDevices: true,
    syncInterval: 300,
    offlineBufferHours: 24,
  },
  tags: [],
  additionalInfo: {},
  customerId: '',
};

export const EdgeCreateDialog: React.FC<EdgeCreateDialogProps> = ({
  open,
  onOpenChange,
  customerId,
}) => {
  const [form, setForm] = useState<EdgePayload>({ ...EMPTY_FORM, customerId });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createEdge = useCreateEdge();

  const updateField = <K extends keyof EdgePayload>(
    key: K,
    value: EdgePayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSyncConfig = <K extends keyof EdgePayload['syncConfig']>(
    key: K,
    value: EdgePayload['syncConfig'][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      syncConfig: { ...prev.syncConfig, [key]: value },
    }));
  };

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (value && !form.tags.includes(value)) {
      updateField('tags', [...form.tags, value]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateField(
      'tags',
      form.tags.filter((t) => t !== tag)
    );
  };

  const validate = (): EdgePayload | null => {
    const result = edgePayloadSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    // Map each Zod issue to its field path, e.g. "syncConfig.syncInterval",
    // so the right input can show the right message.
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    setErrors(fieldErrors);
    return null;
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, customerId });
    setTagInput('');
    setErrors({});
  };

  const handleSubmit = async () => {
    const parsed = validate();
    if (!parsed) return;
    try {
      await createEdge.mutateAsync(parsed);
      handleReset();
      onOpenChange(false);
    } catch {
      // createEdge.error is surfaced in the UI below
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleReset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col h-full">
          <DialogHeader className="bg-primary px-6 py-4">
            <DialogTitle className="text-xl font-medium text-white">
              Create New Edge Instance
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Register a new edge gateway and configure how it syncs with the
              cloud platform
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-0 border-t h-[90vh] overflow-y-auto">
            {/* Left Column: Form */}
            <div className="px-8 py-6 space-y-8 bg-white">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-slate-600 font-medium"
                    >
                      Instance Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Riyadh Factory Gateway"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="bg-slate-50/50 border rounded-md border-slate-200"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-slate-600 font-medium"
                    >
                      Instance Type *
                    </Label>
                    <Select
                      value={form.type}
                      onValueChange={(value) =>
                        updateField('type', value as EdgeType)
                      }
                    >
                      <SelectTrigger
                        id="type"
                        className="bg-slate-50/50 border-slate-200"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GATEWAY">Edge Gateway</SelectItem>
                        <SelectItem value="PROCESSOR">
                          Edge Processor
                        </SelectItem>
                        <SelectItem value="RELAY">Edge Relay</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-xs text-rose-500">{errors.type}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-slate-600 font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g. Industrial edge gateway for plant A"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="bg-slate-50/50 border-slate-200 border rounded-md"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  Location
                </h3>
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-slate-600 font-medium"
                  >
                    Site Address *
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Riyadh Industrial City, Building A"
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="bg-slate-50/50 border-slate-200 border rounded-md"
                  />
                  {errors.location && (
                    <p className="text-xs text-rose-500">{errors.location}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="latitude"
                      className="text-slate-600 font-medium"
                    >
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="24.7136"
                      value={form.latitude}
                      onChange={(e) =>
                        updateField('latitude', parseFloat(e.target.value) || 0)
                      }
                      className="bg-slate-50/50 border-slate-200 border rounded-md"
                    />
                    {errors.latitude && (
                      <p className="text-xs text-rose-500">{errors.latitude}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="longitude"
                      className="text-slate-600 font-medium"
                    >
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="46.6753"
                      value={form.longitude}
                      onChange={(e) =>
                        updateField(
                          'longitude',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="bg-slate-50/50 border-slate-200 border rounded-md"
                    />
                    {errors.longitude && (
                      <p className="text-xs text-rose-500">
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sync Configuration */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  Sync Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-md px-4 py-3">
                    <Label
                      htmlFor="syncRules"
                      className="text-slate-600 font-medium"
                    >
                      Sync Rules
                    </Label>
                    <Switch
                      id="syncRules"
                      checked={form.syncConfig.syncRules}
                      onCheckedChange={(checked) =>
                        updateSyncConfig('syncRules', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-md px-4 py-3">
                    <Label
                      htmlFor="syncDashboards"
                      className="text-slate-600 font-medium"
                    >
                      Sync Dashboards
                    </Label>
                    <Switch
                      id="syncDashboards"
                      checked={form.syncConfig.syncDashboards}
                      onCheckedChange={(checked) =>
                        updateSyncConfig('syncDashboards', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-md px-4 py-3">
                    <Label
                      htmlFor="syncDevices"
                      className="text-slate-600 font-medium"
                    >
                      Sync Devices
                    </Label>
                    <Switch
                      id="syncDevices"
                      checked={form.syncConfig.syncDevices}
                      onCheckedChange={(checked) =>
                        updateSyncConfig('syncDevices', checked)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="syncInterval"
                      className="text-slate-600 font-medium"
                    >
                      Sync Interval (seconds)
                    </Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      min={1}
                      value={form.syncConfig.syncInterval}
                      onChange={(e) =>
                        updateSyncConfig(
                          'syncInterval',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="bg-slate-50/50 border-slate-200 border rounded-md"
                    />
                    {errors['syncConfig.syncInterval'] && (
                      <p className="text-xs text-rose-500">
                        {errors['syncConfig.syncInterval']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="offlineBufferHours"
                      className="text-slate-600 font-medium"
                    >
                      Offline Buffer (hours)
                    </Label>
                    <Input
                      id="offlineBufferHours"
                      type="number"
                      min={0}
                      value={form.syncConfig.offlineBufferHours}
                      onChange={(e) =>
                        updateSyncConfig(
                          'offlineBufferHours',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="bg-slate-50/50 border-slate-200 border rounded-md"
                    />
                    {errors['syncConfig.offlineBufferHours'] && (
                      <p className="text-xs text-rose-500">
                        {errors['syncConfig.offlineBufferHours']}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-slate-600 font-medium">
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="e.g. factory, riyadh"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="bg-slate-50/50 border-slate-200 border rounded-md"
                  />
                  <Button type="button" variant="secondary" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {createEdge.isError && (
                <p className="text-sm text-rose-500">
                  Could not create the edge instance. Please try again.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 pb-16">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createEdge.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createEdge.isPending}>
                  {createEdge.isPending ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </div>

            {/* Right Column: Quick Help */}
            <div className="px-10 py-6 bg-slate-50/50 border-l text-sm border-slate-100 space-y-8">
              <h3 className="text-2xl font-semibold text-slate-800">
                Quick Help
              </h3>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">Instance Types</h4>
                <ul className="space-y-2 text-slate-500">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-600">Edge Gateway</strong> —
                      connects and manages field devices
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-600">Edge Processor</strong>{' '}
                      — runs data processing at the site
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-600">Edge Relay</strong> —
                      forwards messages to the cloud
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-slate-700">Location</h4>
                <p className="text-slate-500 leading-relaxed">
                  The site address plus its coordinates, used to place this
                  instance on the map view.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-slate-700">
                  Sync Configuration
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Choose what this instance keeps in sync with the cloud, how
                  often (in seconds), and how many hours of data it buffers
                  locally if the connection drops.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-slate-700">Tags</h4>
                <p className="text-slate-500 leading-relaxed">
                  Free-form labels to group and filter instances, e.g. by site
                  or purpose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
