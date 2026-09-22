import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  email: z.string().email('Email must be valid'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  customer: z.string().optional(),
  role: z.string().optional(),
  status: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const customers = ['Acme Corporation', 'Globex', 'Initech'];
const roles = ['Customer User', 'Customer Admin', 'System Administrator'];

export default function ProfileSettingsPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      customer: 'Acme Corporation',
      role: 'Customer User',
      status: true,
    },
    mode: 'onChange',
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Placeholder submit handler
    console.log('Profile update:', data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Profile Settings
        </h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Profile Information
            </h2>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-semibold">
                JD
              </div>
              <div className="flex gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Change Photo
                </Button>
                <Button variant="secondary">Remove</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Input placeholder="Search users..." className="pr-10" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <Button variant="outline" className="gap-2">
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input {...register('email')} />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input {...register('firstName')} />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input {...register('lastName')} />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer
                      </label>
                      <Controller
                        name="customer"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem
                                  key={customer}
                                  value={customer}
                                  textValue={customer}
                                >
                                  {customer}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem
                                  key={role}
                                  value={role}
                                  textValue={role}
                                >
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="flex items-center  gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Status
                      </span>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm text-gray-600">
                              {field.value ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="secondary" type="button">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-slate-900 text-white">
                        Update User
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-2">
                    <h3 className="font-semibold text-slate-900">
                      Account Information
                    </h3>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-500">USER ID</p>
                      <p>1234567890abcdef</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-500">ROLE</p>
                      <p>System Administrator</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-500">CREATED</p>
                      <p>Jan 15, 2024</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-500">LAST LOGIN</p>
                      <p>2 hours ago</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-2">
                    <h3 className="font-semibold text-slate-900">
                      Activity Summary
                    </h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>Total Sessions: 143</p>
                      <p>28 Dashboards Created</p>
                      <p>12 Users Created</p>
                      <p>8 Last Action</p>
                      <p>User created Status: Active</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="p-4 text-sm text-slate-600">
            Security settings coming soon.
          </div>
        </TabsContent>
        <TabsContent value="preferences">
          <div className="p-4 text-sm text-slate-600">
            Preferences coming soon.
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="p-4 text-sm text-slate-600">
            Notifications coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
