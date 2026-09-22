import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';

interface Permission {
  id: string;
  label: string;
  enabled: boolean;
}

interface RoleFormData {
  roleName: string;
  description: string;
  permissions: {
    viewDashboards: boolean;
    createDashboards: boolean;
    deleteDashboards: boolean;
    viewDevices: boolean;
    manageDevices: boolean;
    deleteDevices: boolean;
    viewUsers: boolean;
    createUsers: boolean;
    editUsers: boolean;
    viewTelemetry: boolean;
    exportData: boolean;
    deleteTelemetry: boolean;
  };
}

const defaultValues: RoleFormData = {
  roleName: 'Customer Administrator',
  description: 'Full access to customer resources and user management',
  permissions: {
    viewDashboards: true,
    createDashboards: true,
    deleteDashboards: true,
    viewDevices: true,
    manageDevices: true,
    deleteDevices: false,
    viewUsers: true,
    createUsers: true,
    editUsers: true,
    viewTelemetry: true,
    exportData: false,
    deleteTelemetry: false,
  },
};

// Custom Permission Checkbox Component
interface PermissionCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const PermissionCheckbox = ({
  checked,
  onChange,
  label,
}: PermissionCheckboxProps) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-green-500 border-green-500'
            : 'bg-gray-200 border-gray-300'
        }`}
        aria-label={`Toggle ${label}`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <Label
        htmlFor={label}
        className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
        onClick={() => onChange(!checked)}
      >
        {label}
      </Label>
    </div>
  );
};

export default function EditRolePage() {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch } = useForm<RoleFormData>({
    defaultValues,
  });

  const permissions = watch('permissions');

  const onSubmit = async (data: RoleFormData) => {
    try {
      // TODO: Implement API call to update role
      console.log('Updating role:', data);
      toast.success('Role updated successfully');
      // Optionally navigate back
      // navigate('/roles');
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <PageHeader title="Edit Role" />
      <div className="  mx-auto space-y-2">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Basic Information
                </h2>

                <div className="space-y-2">
                  <Label
                    htmlFor="roleName"
                    className="text-sm font-medium text-gray-900"
                  >
                    Role Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="roleName"
                    {...register('roleName', {
                      required: 'Role name is required',
                    })}
                    className="w-full border-2 rounded-md"
                    placeholder="Enter role name"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-900"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    className="w-full min-h-[100px]"
                    placeholder="Enter role description"
                  />
                </div>
              </div>

              {/* Dashboard Management Section */}
              <div className="space-y-6    ">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Dashboard Management
                  </h2>
                </div>

                <div className="space-y-1 grid grid-cols-3 gap-2">
                  {/* Dashboard Permissions */}
                  <Controller
                    control={control}
                    name="permissions.viewDashboards"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="View Dashboards"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.createDashboards"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Create Dashboards"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.deleteDashboards"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Delete Dashboards"
                      />
                    )}
                  />

                  {/* Device Management Permissions */}
                  <Controller
                    control={control}
                    name="permissions.viewDevices"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="View Devices"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.manageDevices"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Manage Devices"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.deleteDevices"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Delete Devices"
                      />
                    )}
                  />

                  {/* User Management Permissions */}
                  <Controller
                    control={control}
                    name="permissions.viewUsers"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="View Users"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.createUsers"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Create Users"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.editUsers"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Edit Users"
                      />
                    )}
                  />

                  {/* Data Access Permissions */}
                  <Controller
                    control={control}
                    name="permissions.viewTelemetry"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="View Telemetry"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.exportData"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Export Data"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="permissions.deleteTelemetry"
                    render={({ field }) => (
                      <PermissionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Delete Telemetry"
                      />
                    )}
                  />
                </div>

                {/* Legend */}
                <div className="pt-4  ">
                  <p className="text-sm font-medium text-gray-900">Note :</p>
                  <p className="text-xs text-gray-500">
                    Green = Enabled <br /> Gray = Disabled
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6  ">
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90 text-white px-6"
                >
                  Update Role
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <p className="text-sm text-gray-400 mt-4">* Required fields</p>
      </div>
    </div>
  );
}
