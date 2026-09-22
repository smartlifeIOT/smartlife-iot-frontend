import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Plus, Trash2, X } from 'lucide-react';
import {
  useCreateSolutionTemplate,
  CreateSolutionTemplatePayload,
} from '../hooks';

export default function CreateTemplatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: createTemplate, isPending } = useCreateSolutionTemplate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    visibility: 'public',
    defaultState: 'fullScreen',
    autoRefresh: 'every5Minutes',
    defaultTimeWindow: 'last24Hours',
    category: 'smart_factory',
    author: '',
    features: [] as string[],
    devices: 10,
    dashboards: 3,
    rules: 5,
    tags: [] as string[],
    isPremium: false,
  });

  const [tagInput, setTagInput] = useState('');

  // Map keys to translation keys for Select components
  const visibilityOptions = [
    { value: 'public', label: t('createTemplate.visibility.public') },
    { value: 'private', label: t('createTemplate.visibility.private') },
    { value: 'shared', label: t('createTemplate.visibility.shared') },
  ];

  const categoryOptions = [
    { value: 'smart_factory', label: 'Smart Factory' },
    { value: 'smart_home', label: 'Smart Home' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'smart_city', label: 'Smart City' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'energy', label: 'Energy' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'retail', label: 'Retail' },
    { value: 'smart_building', label: 'Smart Building' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'water', label: 'Water' },
    { value: 'climate', label: 'Climate' },
    { value: 'education', label: 'Education' },
  ];

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Feature multi-input handlers
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Tag handlers
  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateSolutionTemplatePayload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      icon: 'default-icon',
      author: formData.author || 'Anonymous',
      features: formData.features.filter((f) => f.trim() !== ''),
      devices: formData.devices,
      dashboards: formData.dashboards,
      rules: formData.rules,
      tags: formData.tags,
      isPremium: formData.isPremium,
      configuration: {
        visibility: formData.visibility,
        defaultState: formData.defaultState,
        autoRefresh: formData.autoRefresh,
        defaultTimeWindow: formData.defaultTimeWindow,
      },
      previewImage: imagePreview || '',
    };

    createTemplate(payload, {
      onSuccess: () => {
        navigate('/solution-templates');
      },
    });
  };

  const handleCancel = () => {
    navigate('/solution-templates');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('createTemplate.title')}
        </h1>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column - Template Details */}
                <div className="space-y-6">
                  {/* Template Title */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('createTemplate.templateTitle')}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('createTemplate.templateTitlePlaceholder')}
                      className="w-full"
                    />
                  </div>

                  {/* Category & Author Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleSelectChange('category', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label
                        htmlFor="author"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Author
                      </label>
                      <Input
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Author / Organization"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('createTemplate.description')}
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t('createTemplate.descriptionPlaceholder')}
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  {/* Features Multi-Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Features
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddFeature}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Feature
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={feature}
                            onChange={(e) =>
                              handleFeatureChange(index, e.target.value)
                            }
                            placeholder={`Feature ${index + 1}`}
                            className="w-full"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-gray-400 hover:text-red-500 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {formData.features.length === 0 && (
                        <p className="text-xs text-gray-400 italic">
                          No features added yet. Click "Add Feature" above.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Template Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('createTemplate.templateImage')}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {imagePreview ? (
                          <div className="w-full h-full rounded-lg overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                {t('createTemplate.dropImageOrClick')}
                              </span>
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Settings & Counts */}
                <div className="space-y-6">
                  {/* Settings (Visibility) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('createTemplate.settingsVisibility')}
                    </label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) =>
                        handleSelectChange('visibility', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('createTemplate.selectVisibility')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Counts Grid (Devices, Dashboards, Rules) */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="devices"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Devices
                      </label>
                      <Input
                        id="devices"
                        name="devices"
                        type="number"
                        min={0}
                        value={formData.devices}
                        onChange={handleNumberChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dashboards"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Dashboards
                      </label>
                      <Input
                        id="dashboards"
                        name="dashboards"
                        type="number"
                        min={0}
                        value={formData.dashboards}
                        onChange={handleNumberChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="rules"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Rules
                      </label>
                      <Input
                        id="rules"
                        name="rules"
                        type="number"
                        min={0}
                        value={formData.rules}
                        onChange={handleNumberChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Tags Input & Chips */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add a tag..."
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        className="shrink-0"
                      >
                        Add Tag
                      </Button>
                    </div>

                    {/* Tag Badges */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="flex items-center gap-1 bg-slate-100 text-slate-800 border-slate-300 py-1 px-2.5 text-xs font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-gray-400 hover:text-red-500 rounded-full focus:outline-none"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Is Premium Checkbox */}
                  <div className="pt-2">
                    <Checkbox
                      id="isPremium"
                      name="isPremium"
                      label="Is Premium Template ?"
                      checked={formData.isPremium}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPremium: e.target.checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancel}
                      className="px-6"
                    >
                      {t('createTemplate.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-primary hover:bg-primary/90 text-white px-6"
                    >
                      {isPending ? 'Saving...' : t('createTemplate.save')}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
