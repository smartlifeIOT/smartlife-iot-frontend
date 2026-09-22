import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';
import DeviceAnalyticsPage from '@/features/analytics/pages/DeviceAnalyticsPage';

// Import dashboard page components lazily
const DashboardPage = Loadable(
  lazy(() =>
    import('@/features/dashboard/page/DashboardPage').then((module) => ({
      default: module.DashboardPage,
    }))
  )
);
const AlarmsPage = Loadable(
  lazy(() => import('@/features/alarms/page/AlarmsPage'))
);
const AlertAnalyticsPage = Loadable(
  lazy(() => import('@/features/alarms/page/AlertAnalyticsPage'))
);
const AlertRulesPage = Loadable(
  lazy(() => import('@/features/alarms/page/AlertRulesPage'))
);
const CreateAlarmRulePage = Loadable(
  lazy(() => import('@/features/alarms/page/createAlarmRule'))
);
const AlertsNotificationPage = Loadable(
  lazy(() => import('@/features/alarms/page/AlertsNotificationPage'))
);
const AlertDetailsPage = Loadable(
  lazy(() => import('@/features/alarms/page/AlertDetailsPage'))
);
const NotificationsPage = Loadable(
  lazy(() => import('@/features/notifications/page/NotificationsPage'))
);

const AnalyticsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/AnalyticsPage'))
);
const DashboardAnalyticsDetailsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/DevicesAnalyticsPage'))
);
const SystemPerformanceAnalyticsPage = Loadable(
  lazy(
    () => import('@/features/analytics/pages/SystemPerformanceAnalyticsPage')
  )
);
const DataConsumptionAnalyticsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/DataConsumptionAnalyticsPage'))
);

const GeoAnalyticsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/GeoAnalyticsPage'))
);

const DeviceAnalyticsMainPage = Loadable(
  lazy(() => import('@/features/analytics/pages/DeviceAnalyticsMainPage'))
);
const DeviceanalyticsDetailsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/DeviceanalyticsDetailsPage'))
);
const AnalyticsDashboardDetailsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/AnalyticsDashboardDetailsPage'))
);
const DashboardAnalyticsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/DashboardsAnalyticsPage'))
);
const ProductionOverviewPage = Loadable(
  lazy(() => import('@/features/analytics/pages/ProductionOverviewPage'))
);
const AnalyticsOverviewPage = Loadable(
  lazy(() => import('@/features/analytics/pages/AnalyticsOverviewPage'))
);
const Overview2Page = Loadable(lazy(() => import('@/pages/Overview2Page.tsx')));
const SettingsPage = Loadable(
  lazy(() => import('@/features/settings/pages/SettingsPage'))
);
const GeneralSettingsTab = Loadable(
  lazy(() =>
    import('@/features/settings/components/GeneralSettingsTab').then(
      (module) => ({ default: module.GeneralSettingsTab })
    )
  )
);
const NotificationsTab = Loadable(
  lazy(() =>
    import('@/features/settings/components/NotificationsTab').then(
      (module) => ({ default: module.NotificationsTab })
    )
  )
);
const SecurityTab = Loadable(
  lazy(() =>
    import('@/features/settings/components/SecurityTab').then((module) => ({
      default: module.SecurityTab,
    }))
  )
);
const AccountTab = Loadable(
  lazy(() =>
    import('@/features/settings/components/AccountTab').then((module) => ({
      default: module.AccountTab,
    }))
  )
);

export const mainDashboardRoutes = [
  {
    path: '/dashboard',
    element: <FeatureRoute feature="overview" />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'overview-2',
        element: <Overview2Page />,
      },
    ],
  },
  {
    path: '/alarms',
    element: <FeatureRoute feature="alerts" />,
    children: [
      {
        index: true,
        element: <AlarmsPage />,
      },
      {
        path: 'rules',
        element: <AlertRulesPage />,
      },
      {
        path: 'rules/create',
        element: <CreateAlarmRulePage />,
      },
      {
        path: 'notifications',
        element: <AlertsNotificationPage />,
      },
      {
        path: 'details/:id',
        element: <AlertDetailsPage />,
      },
      {
        path: 'analytics',
        element: <AlertAnalyticsPage />,
      },
    ],
  },
  {
    path: '/notifications',
    element: <FeatureRoute feature="notifications" />,
    children: [
      {
        index: true,
        element: <NotificationsPage />,
      },
    ],
  },
  {
    path: '/analytics',
    element: <FeatureRoute feature="analytics" />,
    children: [
      {
        path: 'devices',
        element: <DeviceAnalyticsMainPage />,
      },
      {
        path: 'overview',
        element: <AnalyticsOverviewPage />,
      },
      //ab
      {
        path: 'devices-2',
        element: <DeviceAnalyticsPage />,
      },
      {
        path: 'devices/:id',
        element: <DeviceanalyticsDetailsPage />,
      },
      //
      {
        path: 'dashboard-analytics',
        element: <DashboardAnalyticsPage />,
      },
      {
        path: 'dashboard-analytics/:id',
        element: <AnalyticsDashboardDetailsPage />,
      },
      {
        path: 'dashboard-analytics/:id',
        element: <DashboardAnalyticsDetailsPage />,
      },
      {
        path: 'device-analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'product-overview',
        element: <ProductionOverviewPage />,
      },
      {
        path: 'data-consumption',
        element: <DataConsumptionAnalyticsPage />,
      },
      {
        path: 'system',
        element: <SystemPerformanceAnalyticsPage />,
      },
      {
        path: 'geo-analytics',
        element: <GeoAnalyticsPage />,
      },
    ],
  },
  {
    path: '/settings',
    element: <FeatureRoute feature="settings" />,
    children: [
      {
        path: '',
        element: <SettingsPage />,
        children: [
          { index: true, element: <Navigate to="general" replace /> },
          { path: 'general', element: <GeneralSettingsTab /> },
          { path: 'notifications', element: <NotificationsTab /> },
          { path: 'security', element: <SecurityTab /> },
          { path: 'account', element: <AccountTab /> },
        ],
      },
    ],
  },
];
