import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, Sprout, Building, Car, Home, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/common/PageHeader';
import { useUsage } from '@/features/Subscription/hooks';
import { UsageDonutChart } from '@/components/common/UsageDonutChart';
import { SolutionSelectionBar } from '@/components/common/SolutionSelectionBar';
import { COLORSCHART } from '@/utils/constants/colors';
import DashboardNavigation from '@/components/ui/DashboardNavigation';
import AssetLocationsMapCard from '@/features/assets/components/AssetLocationsMapCard';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('smartCity');
  const { data: SubscriptionUsage } = useUsage();

  // Solution Categories with localization
  const solutions = [
    { key: 'smartCity', icon: Building2, active: true },
    { key: 'smartAgriculture', icon: Sprout, active: false },
    { key: 'smartBuilding', icon: Building, active: false },
    { key: 'smartTransportation', icon: Car, active: false },
    { key: 'smartHome', icon: Home, active: false },
    { key: 'smartFactory', icon: Factory, active: false },
  ];

  // Donut chart data for Connected Devices
  const deviceUsageData = [
    {
      name: t('dashboard.deviceUsage.used'),
      value: SubscriptionUsage?.current?.devices || 0,
    },
    {
      name: t('dashboard.deviceUsage.remaining'),
      value:
        (SubscriptionUsage?.limits?.devices || 0) -
        (SubscriptionUsage?.current?.devices || 0),
    },
  ];
  const devicePercentage = Math.round(
    SubscriptionUsage?.percentage?.devices || 0
  );
  const userUsageData = [
    {
      name: t('dashboard.userUsage.used'),
      value: SubscriptionUsage?.current?.users || 0,
    },
    {
      name: t('dashboard.userUsage.remaining'),
      value:
        (SubscriptionUsage?.limits?.users || 0) -
        (SubscriptionUsage?.current?.users || 0),
    },
  ];

  const userPercentage = Math.round(SubscriptionUsage?.percentage?.users || 0);
  // Dashboard preview data
  const dashboardPreviews = [
    {
      title: t('dashboard.dashboardPreview'),
      subtitle: t('dashboard.dashboardSubtitles.smartBuildingOverview'),
      gradient: 'from-secondary to-secondary',
      textColor: 'text-white',
    },
    {
      title: t('dashboard.dashboardPreview'),
      subtitle: t('dashboard.dashboardSubtitles.smartBuildingMetrics'),
      gradient: 'from-gray-100 to-gray-300',
      textColor: 'text-gray-900',
    },
    {
      title: t('dashboard.dashboardPreview'),
      subtitle: t('dashboard.dashboardSubtitles.smartHomeControl'),
      gradient: 'from-secondary-main to-secondary-main',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Headers */}
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      <div className="border dark:border-gray-700 p-4 rounded-3xl  border-secondary shadow-xl">
        <SolutionSelectionBar
          solutions={solutions}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Main Content Grid - 3 Columns */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1 - Left */}
          <div className="space-y-6">
            {/* Usage Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-600">
                  {t('dashboard.usageSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {t('dashboard.customers')}
                      </span>
                      <span className="font-semibold">
                        {SubscriptionUsage?.current?.customers || 0}/
                        {SubscriptionUsage?.limits?.customers || 0}
                      </span>
                    </div>
                    <Progress
                      value={SubscriptionUsage?.percentage?.customers || 0}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm  mb-1">
                      <span className="text-gray-600">
                        {t('dashboard.floorPlans')}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {SubscriptionUsage?.current?.floorPlans || 0}/
                        {SubscriptionUsage?.limits?.floorPlans || 0}
                      </span>
                    </div>
                    <Progress
                      value={SubscriptionUsage?.percentage?.floorPlans || 0}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm  mb-1">
                      <span className="text-gray-600">
                        {t('dashboard.automations')}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {SubscriptionUsage?.current?.automations || 0}/
                        {SubscriptionUsage?.limits?.automations || 0}
                      </span>
                    </div>
                    <Progress
                      value={SubscriptionUsage?.percentage?.automations || 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="col-span-">
              <AssetLocationsMapCard />
            </div>
          </div>

          {/* Column 2 - Middle */}
          <div className="space-y-6">
            {/* Connected Devices Card */}
            <Card className="flex items-center  justify-between pt-2 pb-10">
              <CardHeader className="">
                <CardTitle className="text-lg font-semibold text-gray-600 dark:text-white">
                  {t('dashboard.connectedDevices')}
                </CardTitle>
                <CardDescription className="text-sm  text-gray-500 dark:text-white">
                  {t('dashboard.connections', {
                    count: SubscriptionUsage?.current?.devices || 0,
                  })}
                </CardDescription>
                <Link
                  to="/devices"
                  className="  p-3     text-xs  rounded-md bg-secondary-main hover:bg-secondary-main/90 text-white"
                >
                  {t('dashboard.addNewDevice')}
                </Link>
              </CardHeader>

              <CardContent>
                <UsageDonutChart
                  data={deviceUsageData}
                  percentage={devicePercentage}
                  colors={COLORSCHART}
                />
              </CardContent>
            </Card>
            {/* Storage & Assets Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-600">
                    {t('dashboard.storageAndAssets')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t('dashboard.storage')}
                    </span>
                    <span className="font-semibold">
                      {SubscriptionUsage?.current?.storageGB || 0} /{' '}
                      {SubscriptionUsage?.limits?.storageGB || 0} GB
                    </span>
                  </div>
                  <Progress
                    value={SubscriptionUsage?.percentage?.storageGB || 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t('dashboard.assets')}
                    </span>
                    <span className="font-semibold">
                      {SubscriptionUsage?.current?.assets || 0} /{' '}
                      {SubscriptionUsage?.limits?.assets || 0}
                    </span>
                  </div>
                  <Progress
                    value={SubscriptionUsage?.percentage?.assets || 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3 - Right */}
          <div className="space-y-6">
            {/* Total Users Card */}
            <Card className="flex items-center  justify-between pt-2 pb-10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-600">
                  {t('dashboard.totalUsers')}
                </CardTitle>
                <CardDescription className="text-sm  text-gray-500">
                  {t('dashboard.users', {
                    count: SubscriptionUsage?.current?.users || 0,
                  })}
                </CardDescription>
                <Link
                  to="/users-management"
                  className=" p-3 text-xs rounded-md bg-secondary-main hover:bg-secondary-main/90 text-white"
                >
                  {t('dashboard.manageUsers')}
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageDonutChart
                  data={userUsageData}
                  percentage={userPercentage}
                  colors={COLORSCHART}
                />
              </CardContent>
            </Card>
            {/* Active Dashboards Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold  text-gray-600">
                    {t('dashboard.activeDashboards')}
                  </CardTitle>
                </div>

                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <div className="text-2xl pb-3 font-bold text-gray-900  ">
                    {SubscriptionUsage?.current?.dashboards || 0}/
                    {SubscriptionUsage?.limits?.dashboards || 0}
                  </div>

                  <div className="flex justify-between text-xs pb-2 text-gray-500">
                    <span>{t('dashboard.usage', 'Usage')}</span>
                    <span>
                      {SubscriptionUsage?.percentage?.dashboards || 0}%
                    </span>
                  </div>
                  <Progress
                    value={SubscriptionUsage?.percentage?.dashboards || 0}
                    className="h-2"
                  />
                  <Link
                    to="/dashboards"
                    className="text-secondary  block text-end   pt-2 dark:text-white text-xs mt-1 hover:underline"
                  >
                    {t('dashboard.viewAll')}
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recently Accessed Dashboards */}
        <div className="mt-4 p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.recentlyAccessedDashboards')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {dashboardPreviews.map((dashboard, index) => (
              <Card
                key={index}
                className={`cursor-pointer rounded-xl overflow-hidden  hover:shadow-lg transition border-0`}
              >
                <CardHeader
                  className={`text-lg font-semibold mb-2 ${dashboard.textColor}  bg-gradient-to-br ${dashboard.gradient} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                >
                  <p>{dashboard.title}</p>
                </CardHeader>
                <CardContent className="p-6">
                  <p
                    className={`text-sm  text-center text-gray-500 dark:text-white`}
                  >
                    {dashboard.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <DashboardNavigation
          previousRoute="/dashboard"
          nextRoute="/dashboard/overview-2"
        />
      </div>
    </div>
  );
};
