import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Radio } from '@/components/ui/radio';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/util';

export default function CreateGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    groupTitle1: '',
    groupTitle2: '',
    description: '',
    shareGroup: true,
    shareGroupInput: '',
    selectedCustomers: [] as string[],
    allUser: true,
    userGroup: '',
    permission: 'other' as 'read' | 'write' | 'other',
    roles: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const customers = ['Customer A', 'Customer B', 'Customer C'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRadioChange = (value: 'read' | 'write' | 'other') => {
    setFormData((prev) => ({ ...prev, permission: value }));
  };

  const handleCustomerToggle = (customer: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedCustomers.includes(customer);
      return {
        ...prev,
        selectedCustomers: isSelected
          ? prev.selectedCustomers.filter((c) => c !== customer)
          : [...prev.selectedCustomers, customer],
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userGroup.trim() && formData.allUser) {
      newErrors.userGroup = t('createGroup.userGroupRequired') || 'Target user group is required*';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await groupsApi.create(formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(t('createGroup.success') || 'Group created successfully');
      navigate('/groups'); // Adjust route as needed
    } catch (error: unknown) {
      console.error('Failed to create group:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('createGroup.error') || 'Failed to create group';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('createGroup.title') || 'Create New Group'}
        </h1>

        {/* Form Card */}
        <Card className="shadow-lg rounded-xl border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createGroup.groupTitle') || 'Group Title'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="groupTitle1"
                    value={formData.groupTitle1}
                    onChange={handleInputChange}
                    placeholder={t('createGroup.groupTitlePlaceholder') || 'Enter group title'}
                    className="w-full"
                  />
                  <Input
                    name="groupTitle2"
                    value={formData.groupTitle2}
                    onChange={handleInputChange}
                    placeholder={t('createGroup.groupTitlePlaceholder') || 'Enter group title'}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createGroup.description') || 'Description'}
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('createGroup.descriptionPlaceholder') || 'Enter description'}
                  className="min-h-[100px] w-full"
                />
              </div>

              {/* Share Group */}
              <div className="space-y-4">
                <Checkbox
                  checked={formData.shareGroup}
                  onChange={(e) => handleCheckboxChange('shareGroup', e.target.checked)}
                  label={t('createGroup.shareGroup') || 'Share Group'}
                />
                <Input
                  name="shareGroupInput"
                  value={formData.shareGroupInput}
                  onChange={handleInputChange}
                  placeholder={t('createGroup.shareGroupPlaceholder') || 'Enter share group details'}
                  className="w-full"
                />
              </div>

              {/* Customer and All User Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Customer Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {t('createGroup.customer') || 'Customer'}
                  </h3>
                  <div className="space-y-2">
                    {customers.map((customer) => (
                      <label
                        key={customer}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedCustomers.includes(customer)}
                          onChange={() => handleCustomerToggle(customer)}
                          className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                        />
                        <span className="text-sm text-gray-700">{customer}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* All User Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {t('createGroup.allUser') || 'All User'}
                  </h3>
                  <div className="space-y-4">
                    <Checkbox
                      checked={formData.allUser}
                      onChange={(e) => handleCheckboxChange('allUser', e.target.checked)}
                      label={t('createGroup.allUser') || 'All User'}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('createGroup.selectUserGroup') || 'Select User Group'} *
                      </label>
                      <Input
                        name="userGroup"
                        value={formData.userGroup}
                        onChange={handleInputChange}
                        placeholder={t('createGroup.userGroupPlaceholder') || 'Enter user group'}
                        className={cn(
                          'w-full',
                          errors.userGroup && 'border-red-500'
                        )}
                      />
                      {errors.userGroup && (
                        <p className="mt-1 text-sm text-red-500">{errors.userGroup}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('createGroup.permissions') || 'Permissions'}
                      </label>
                      <div className="space-y-2">
                        <Radio
                          name="permission"
                          value="read"
                          checked={formData.permission === 'read'}
                          onChange={() => handleRadioChange('read')}
                          label={t('createGroup.read') || 'Read'}
                        />
                        <Radio
                          name="permission"
                          value="write"
                          checked={formData.permission === 'write'}
                          onChange={() => handleRadioChange('write')}
                          label={t('createGroup.write') || 'Write'}
                        />
                        <Radio
                          name="permission"
                          value="other"
                          checked={formData.permission === 'other'}
                          onChange={() => handleRadioChange('other')}
                          label={t('createGroup.other') || 'Other'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createGroup.roles') || 'Roles'}
                </label>
                <Textarea
                  name="roles"
                  value={formData.roles}
                  onChange={handleInputChange}
                  placeholder={t('createGroup.rolesPlaceholder') || 'Enter roles'}
                  className="min-h-[100px] w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('createGroup.cancel') || 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-secondary hover:bg-secondary/90 text-white"
                  isLoading={isSubmitting}
                >
                  {t('createGroup.save') || 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}

