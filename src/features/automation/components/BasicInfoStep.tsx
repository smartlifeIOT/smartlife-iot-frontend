import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

export const BasicInfoStep: React.FC = () => {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = useState('');
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="border rounded-lg p-4 border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 ">
        {t('automation.dialog.sections.basicInfo', 'Basic Information')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 ">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rule-name">
              {t('automation.dialog.fields.name')}
            </Label>
            <Input
              id="rule-name"
              {...register('name')}
              className="border rounded-md"
              placeholder={t('automation.dialog.fields.namePlaceholder')}
              error={errors.name?.message as string}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t('automation.dialog.fields.description')}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="border rounded-md"
              placeholder={t('automation.dialog.fields.descriptionPlaceholder')}
              error={errors.description?.message as string}
              rows={4}
            />
          </div>

          <div className="space-y-4 pt-2">
            <Label className="font-medium">
              {t(
                'automation.dialog.fields.notifications',
                'Notification Settings'
              )}{' '}
              <p className="text-xs text-muted-foreground">
                (
                {t(
                  'automation.dialog.fields.statusDesc',
                  'Enable rule after creation'
                )}
                )
              </p>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Controller
                  name="settings.notifyEmail"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="notify-email"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor="notify-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t(
                    'automation.dialog.options.notifyEmail',
                    'Send email notifications on rule execution'
                  )}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="settings.notifyPush"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="notify-push"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor="notify-push"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t(
                    'automation.dialog.options.notifyPush',
                    'Send push notifications to mobile devices'
                  )}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="settings.logHistory"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="log-history"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor="log-history"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t(
                    'automation.dialog.options.logHistory',
                    'Record execution history for debugging'
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t('automation.dialog.fields.tags', 'Tags')}</Label>
            <Controller
              name="tags"
              control={control}
              defaultValue={[]}
              render={({ field }) => {
                const tags: string[] = Array.isArray(field.value)
                  ? field.value
                  : [];

                const addTag = (tagToAdd: string) => {
                  const trimmed = tagToAdd.trim();
                  if (trimmed && !tags.includes(trimmed)) {
                    field.onChange([...tags, trimmed]);
                  }
                };

                const removeTag = (indexToRemove: number) => {
                  field.onChange(
                    tags.filter((_, idx) => idx !== indexToRemove)
                  );
                };

                return (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 p-2 min-h-[42px] border border-gray-200 rounded-md bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in-95 duration-150"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeTag(idx);
                            }}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none"
                          >
                            <X className="w-3 h-3 text-primary" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder={
                          tags.length === 0
                            ? t(
                                'automation.dialog.fields.tagsPlaceholder',
                                'Type tag and press Enter...'
                              )
                            : 'Add tag...'
                        }
                        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-gray-400 focus:ring-0 p-0"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            if (tagInput.trim()) {
                              addTag(tagInput);
                              setTagInput('');
                            }
                          } else if (
                            e.key === 'Backspace' &&
                            !tagInput &&
                            tags.length > 0
                          ) {
                            e.preventDefault();
                            removeTag(tags.length - 1);
                          }
                        }}
                        onBlur={() => {
                          if (tagInput.trim()) {
                            addTag(tagInput);
                            setTagInput('');
                          }
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Press{' '}
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-[10px]">
                        Enter
                      </kbd>{' '}
                      or comma to add a tag badge
                    </p>
                  </div>
                );
              }}
            />
          </div>
          <div className="flex items-center border p-4 rounded-md border-gray-300 justify-between">
            <div>
              <Label htmlFor="status" className="font-medium">
                {t('automation.dialog.fields.status', 'Status')}
              </Label>
            </div>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="status"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
