import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import Roles from '@/features/users/components/Roles';
import Users from '@/features/users/components/Users';
import CustomerPage from '@/features/users/components/Customer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebouncedValue } from '@/utils/helpers/Debounce';
import { useAppStore } from '@/stores/useAppStore';
import { PageHeader } from '@/components/common/PageHeader';

export default function UsersAndRolesManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'Users');

  useEffect(() => {
    if (location.state?.tab) {
      console.log(location.state.tab);
      setActiveTab(location.state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.tab]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const { user } = useAppStore();
  const isCustomer = user?.role === 'customer';

  const handleAddAction = () => {
    if (activeTab === 'Users') {
      navigate('/users-management/add-new-user');
      return;
    }
    if (activeTab === 'Customers') {
      navigate('/users-management/create-customer');
      return;
    }
    if (activeTab === 'Roles') {
      navigate('/users-management/create-role');
    }
  };

  const addButtonLabel =
    activeTab === 'Users'
      ? t('usersManagement.add.user')
      : activeTab === 'Customers'
        ? t('usersManagement.add.customer')
        : t('usersManagement.add.role');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto space-y-4">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <PageHeader
              title={t('usersManagement.title')}
              description={t('usersManagement.description')}
            />
            <Button onClick={handleAddAction} variant="secondary">
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          </div>

          {/* Navigation Tabs and Search */}
          <div className="flex items-center  justify-between mt-6 gap-4">
            <Tabs
              defaultValue="Users"
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                setSearchQuery('');
              }}
            >
              <TabsList className="p-1">
                <TabsTrigger value="Users">
                  {t('usersManagement.tabs.users')}
                </TabsTrigger>
                {!isCustomer && (
                  <TabsTrigger value="Customers">
                    {t('usersManagement.tabs.customers')}
                  </TabsTrigger>
                )}
                <TabsTrigger value="Roles">
                  {t('usersManagement.tabs.roles')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                iconPosition="right"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {activeTab === 'Users' && <Users searchQuery={debouncedSearchQuery} />}
        {activeTab === 'Roles' && <Roles searchQuery={debouncedSearchQuery} />}
        {activeTab === 'Customers' && (
          <CustomerPage searchQuery={debouncedSearchQuery} />
        )}
      </div>
    </div>
  );
}
