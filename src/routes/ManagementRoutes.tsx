import React, { lazy } from 'react';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';
import CustomerDetailsPage from '@/pages/CustomerDetailsPage';
import MQTTIntegrationPage from '@/features/integrations/page/MQTTIntegrationPage';

// Import management page components lazily
const IntegrationDetailsPage = Loadable(
  lazy(() => import('@/features/integrations/page/IntegrationDetailsPage'))
);
const AddIntegrationPage = Loadable(
  lazy(() => import('@/features/integrations/page/AddIntegrationPage'))
);

const SubscriptionPlans = Loadable(
  lazy(() => import('@/features/Subscription/page/SubscriptionPlans'))
);
const Subscriptioninvoices = Loadable(
  lazy(() => import('@/features/Subscription/page/Subscriptioninvoices'))
);
const UsersAndRolesManagementPage = Loadable(
  lazy(() => import('@/features/users/page/UsersAndRolesManagementPage'))
);
const CustomerUserAssociationPage = Loadable(
  lazy(() => import('@/pages/CustomerUserAssociationPage.tsx'))
);
const CreateRolePage = Loadable(
  lazy(() => import('@/pages/CreateRolePage.tsx'))
);

const RolePermissionManagementPage = Loadable(
  lazy(() => import('@/features/users/page/RolePermissionManagementPage'))
);
const AssignPermissionsPage = Loadable(
  lazy(() => import('@/pages/AssignPermissionsPage.tsx'))
);
const SearchResultsPage = Loadable(
  lazy(() => import('@/pages/SearchResultsPage.tsx'))
);
const CreateCustomerPage = Loadable(
  lazy(() => import('@/pages/CreateCustomerPage.tsx'))
);

const CreateUserPage = Loadable(
  lazy(() => import('@/pages/CreateUserPage.tsx'))
);
const ProfileSettingsPage = Loadable(
  lazy(() => import('@/features/settings/pages/ProfileSettingsPage'))
);
const CompanyProfilePage = Loadable(
  lazy(() => import('@/pages/CompanyProfilePage.tsx'))
);
const BulkUserManagementPage = Loadable(
  lazy(() => import('@/pages/BulkUserManagementPage.tsx'))
);
const CustomerUserDetailsPage = Loadable(
  lazy(() => import('@/pages/CustomerUserDetailsPage.tsx'))
);

const CustomerPage = Loadable(
  lazy(() =>
    import('@/features/users/components/Customer.tsx').then((module) => ({
      default: module.default,
    }))
  )
);
const AuditPage = Loadable(lazy(() => import('@/pages/AuditPage.tsx')));
const APIMonitoring = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/APIMonitoringPage'))
);
const RequestAnalytics = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/RequestAnalyticsPage'))
);
const PerformanceMetrics = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/PerformanceMetricsPage'))
);
const ErrorAnalysis = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/ErrorAnalysisPage'))
);
const APIResponseOverview = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/APIResponseOverviewPage'))
);
const RateLimitingDashboard = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/RateLimitingDashboardPage'))
);
const APIHealth = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/APIHealthPage'))
);
const APILogs = Loadable(
  lazy(() => import('@/features/apiMonitoring/page/APILogsPage'))
);

const DataConvertersPage = Loadable(
  lazy(() => import('@/features/integrations/page/DataConvertersPage'))
);
const CreateDataConverterPage = Loadable(
  lazy(() => import('@/features/integrations/page/CreateDataConverterPage'))
);
const APIIntegrationLogsPage = Loadable(
  lazy(() => import('@/features/integrations/page/APIIntegrationLogsPage'))
);
const APIIntegrationStatisticsPage = Loadable(
  lazy(
    () => import('@/features/integrations/page/APIIntegrationStatisticsPage')
  )
);
const TestDataConverterPage = Loadable(
  lazy(() => import('@/features/integrations/page/TestDataConverterPage'))
);
const DecoderConfigPage = Loadable(
  lazy(() => import('@/features/integrations/page/DecoderConfigPage'))
);
const Integrations = Loadable(
  lazy(() => import('@/features/integrations/page/IntegrationsPage'))
);

export const managementRoutes = [
  //  -------------------Users Management Routes-------------------
  {
    path: '/users-management',
    element: <FeatureRoute feature="userRoles" />,
    children: [
      {
        index: true,
        element: <UsersAndRolesManagementPage />,
      },
      {
        path: 'assign-users/:id',
        element: <CustomerUserAssociationPage />,
      },
      {
        path: 'create-role',
        element: <CreateRolePage />,
      },
      {
        path: 'edit-role/:id',
        element: <CreateRolePage />,
      },
      {
        path: 'customer/:id',
        element: <CustomerDetailsPage />,
      },
      {
        path: 'role-permission-management/:id',
        element: <RolePermissionManagementPage />,
      },
      {
        path: 'customer-user-permissions/:id',
        element: <AssignPermissionsPage />,
      },
      {
        path: 'customer-user/:id',
        element: <CustomerUserDetailsPage />,
      },
      {
        path: 'search-results',
        element: <SearchResultsPage />,
      },
      {
        path: 'create-customer',
        element: <CreateCustomerPage />,
      },
      {
        path: 'edit-customer/:id',
        element: <CreateCustomerPage />,
      },
      {
        path: 'add-new-user',
        element: <CreateUserPage />,
      },
      {
        path: 'edit-user/:id',
        element: <CreateUserPage />,
      },

      {
        path: 'profile-settings',
        element: <ProfileSettingsPage />,
      },
      {
        path: 'company-profile',
        element: <CompanyProfilePage />,
      },
      {
        path: 'bulk-management',
        element: <BulkUserManagementPage />,
      },

      {
        path: 'customers',
        element: <CustomerPage searchQuery="" />,
      },
    ],
  },
  // --------------------Customer Management Routes--------------------
  {
    path: '/customer-management',
    element: <FeatureRoute feature="createCustomer" />,
    children: [
      {
        index: true,
        element: <CreateCustomerPage />,
      },
    ],
  },

  // -------- audit routes --------
  {
    path: '/audit',
    element: <FeatureRoute feature="auditLogs" />,
    children: [
      {
        index: true,
        element: <AuditPage />,
      },
    ],
  },
  // -------- api-monitoring --------

  {
    path: '/reports-apis',
    element: <FeatureRoute feature="apiAccess" />,
    children: [
      {
        index: true,
        element: <APIMonitoring />,
      },
      {
        path: 'request-analytics',
        element: <RequestAnalytics />,
      },
      {
        path: 'performance-metrics',
        element: <PerformanceMetrics />,
      },
      {
        path: 'error-analysis',
        element: <ErrorAnalysis />,
      },
      {
        path: 'api-response',
        element: <APIResponseOverview />,
      },
      {
        path: 'rate-limiting',
        element: <RateLimitingDashboard />,
      },
      {
        path: 'health',
        element: <APIHealth />,
      },
      {
        path: 'api-health',
        element: <APIHealth />,
      },
      {
        path: 'logs',
        element: <APILogs />,
      },
    ],
  },

  // -------- integrations --------
  {
    path: '/integrations',
    element: <FeatureRoute feature="integration" />,
    children: [
      {
        path: 'overview',
        element: <Integrations />,
        // element: <IntegrationCentreDashboard />,
      },

      {
        path: ':id',
        element: <IntegrationDetailsPage />,
      },
      {
        path: 'add-integration',
        element: <AddIntegrationPage />,
      },
      {
        path: 'data-converters',
        element: <DataConvertersPage />,
      },
      {
        path: 'data-converters/create',
        element: <CreateDataConverterPage />,
      },
      {
        path: 'mqtt-integration',
        element: <MQTTIntegrationPage />,
      },
      {
        path: 'api-logs',
        element: <APIIntegrationLogsPage />,
      },
      {
        path: 'api-statistics',
        element: <APIIntegrationStatisticsPage />,
      },
      {
        path: 'test-data-converter',
        element: <TestDataConverterPage />,
      },
      {
        path: 'decoder-config',
        element: <DecoderConfigPage />,
      },
    ],
  },

  // -------- subscription routes --------
  {
    path: '/subscription',
    element: <FeatureRoute feature="subscription" />,
    children: [
      {
        index: true,
        element: <SubscriptionPlans />,
      },
      {
        path: 'invoices',
        element: <Subscriptioninvoices />,
      },
    ],
  },
];
