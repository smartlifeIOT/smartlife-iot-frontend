import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCustomerById } from '@/features/customer/hooks';
import type { Customer } from '@/features/customer/types';
import CustomerUsersList from '@/features/customer/components/CustomerUsersList';
import CustomerActivityLog from '@/features/customer/components/CustomerActivityLog';
import { usePermissions } from '@/features/permissions/hooks';
import DevicesListCustomers from '@/features/users/components/DevicesListCustomers';
import { CustomerDetailsCard } from '@/features/customer/components/CustomerDetailsCard';
import { useTranslation } from 'react-i18next';

interface Permission {
  id: string;
  label: string;
  granted: boolean;
  category: string;
}

const PermissionCheckbox: React.FC<{ granted: boolean }> = ({ granted }) => {
  return (
    <div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        granted
          ? 'bg-green-500 border-green-500'
          : 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
      }`}
    >
      {granted && (
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
    </div>
  );
};

export default function CustomerDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data } = useCustomerById(id);
  const customer = data?.data as Customer | undefined;

  // get permissions for the customer
  const { data: permissionsData } = usePermissions();
  const UserPermissionsdata = permissionsData;

  const [activeTab, setActiveTab] = useState('permissions');

  // Group permissions by category
  const permissionsByCategory = useMemo(
    () =>
      UserPermissionsdata?.reduce(
        (acc, permission) => {
          if (!acc[permission.resource]) {
            acc[permission.resource] = [];
          }
          acc[permission.resource].push({
            id: permission.id,
            label: permission.action,
            granted: true,
            category: permission.resource,
          });
          return acc;
        },
        {} as Record<string, Permission[]>
      ),
    [UserPermissionsdata]
  );

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto space-y-6">
        {/* Customer Details Card Extracted */}
        <CustomerDetailsCard customer={customer} id={id} />

        {/* Tabs */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <CardContent className="p-0">
            <Tabs
              defaultValue="permissions"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 h-auto p-0 gap-8 justify-start">
                <TabsTrigger
                  value="permissions"
                  className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:text-secondary text-gray-500 dark:text-gray-400 font-medium"
                >
                  {t('usersManagement.customer_details.tabs.permissions')}
                </TabsTrigger>
                <TabsTrigger
                  value="assigned-users"
                  className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:text-secondary text-gray-500 dark:text-gray-400 font-medium"
                >
                  {t('usersManagement.customer_details.tabs.assignedUsers')}
                </TabsTrigger>
                <TabsTrigger
                  value="devices"
                  className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:text-secondary text-gray-500 dark:text-gray-400 font-medium"
                >
                  {t('usersManagement.customer_details.tabs.devices')}
                </TabsTrigger>
                <TabsTrigger
                  value="activity-logs"
                  className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:text-secondary text-gray-500 dark:text-gray-400 font-medium"
                >
                  {t('usersManagement.customer_details.tabs.activityLogs')}
                </TabsTrigger>
              </TabsList>

              {/* Devices Tab */}
              <TabsContent value="devices" className="p-4 space-y-4 ">
                <DevicesListCustomers customerId={id || ''} />
              </TabsContent>
              {/* Permissions Tab */}
              <TabsContent value="permissions" className="p-4 space-y-4 ">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('usersManagement.customer_details.matrixTitle')}
                  </h2>
                </div>

                {/* Permission Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(permissionsByCategory || {}).map(
                    ([category, categoryPermissions]) => (
                      <Card
                        key={category}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-secondary/30 transition-colors"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg capitalize font-semibold text-gray-900 dark:text-white">
                            {category.replace(/-/g, ' ')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center gap-3"
                            >
                              <PermissionCheckbox
                                granted={permission.granted}
                              />
                              <span className="text-sm capitalize text-gray-700 dark:text-gray-300 flex-1">
                                {permission.label} {category.replace(/-/g, ' ')}
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('usersManagement.customer_details.legend.granted')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('usersManagement.customer_details.legend.denied')}
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* Assigned Users Tab */}
              <TabsContent value="assigned-users" className="p-2">
                <CustomerUsersList
                  customerId={id}
                  searchQuery=""
                  title={t('usersManagement.customer_details.tabs.assignedUsers')}
                />
              </TabsContent>

              {/* Activity Log Tab */}
              <TabsContent value="activity-logs" className="p-2 space-y-4">
                <CustomerActivityLog
                  customerId={id || ''}
                  title={t('usersManagement.customer_details.tabs.activityLogs')}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
