import React, { lazy } from 'react';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';

// Import solution page components lazily
const DashboardsPage = Loadable(
  lazy(() => import('@/features/solution-Dashboards/pages/DashboardsPage'))
);
const CreateDashboardPage = Loadable(
  lazy(() => import('@/features/solution-Dashboards/pages/CreateDashboardPage'))
);
const CreateGroupPage = Loadable(
  lazy(() => import('@/features/solution-Dashboards/pages/CreateGroupPage'))
);
const WidgetConfigurationPage = Loadable(
  lazy(() => import('@/features/widgets/page/WidgetConfigurationPage'))
);
const WidgetEditorPage = Loadable(
  lazy(() => import('@/features/solution-Dashboards/pages/WidgetEditorPage'))
);
const MainDashboardPage = Loadable(
  lazy(() => import('@/features/solution-Dashboards/pages/MainDashboardPage'))
);
const MainControlPanelPage = Loadable(
  lazy(() => import('@/pages/MainControlPanelPage.tsx'))
);
const SolutionTemplates = Loadable(
  lazy(
    () => import('@/features/solution-templates/pages/SolutionTemplatesPage')
  )
);
const TemplatePreviewPage = Loadable(
  lazy(() => import('@/features/solution-templates/pages/TemplatePreviewPage'))
);
const CreateTemplatePage = Loadable(
  lazy(() => import('@/features/solution-templates/pages/CreateTemplatePage'))
);
const FloorPlans = Loadable(
  lazy(() => import('@/features/floorPlan/page/FloorPlanPage'))
);
const FloorMapCreatePage = Loadable(
  lazy(() => import('@/features/floorPlan/page/FloorMapCreatePage'))
);
const MultiFloorBuildingViewPage = Loadable(
  lazy(() => import('@/pages/MultiFloorBuildingViewPage.tsx'))
);
const FloorMapSettingsPage = Loadable(
  lazy(() => import('@/features/floorPlan/page/FloorMapSettingsPage'))
);
const AnalyticsPage = Loadable(
  lazy(() => import('@/features/analytics/pages/AnalyticsPage'))
);
const BuildingHierarchyChartPage = Loadable(
  lazy(() => import('@/pages/BuildingHierarchyChartPage.tsx'))
);
const AlertConfigurationPage = Loadable(
  lazy(() => import('@/features/alarms/page/AlertConfigurationPage'))
);
const FloorMapHistoryPage = Loadable(
  lazy(() => import('@/features/floorPlan/page/FloorMapHistoryPage'))
);
const ReportTemplatesPage = Loadable(
  lazy(() => import('@/pages/ReportTemplatesPage.tsx'))
);
const FloorPlanDetailPage = Loadable(
  lazy(() => import('@/features/floorPlan/page/FloorPlanDetailPage'))
);

export const solutionRoutes = [
  // --------------------Solutions dashboards Routes --------------------
  {
    path: '/solution-dashboards',
    element: <FeatureRoute feature="solutionDashboards" />,
    children: [
      {
        index: true,
        element: <DashboardsPage />,
      },
      {
        path: 'create',
        element: <CreateDashboardPage />,
      },
      {
        path: 'groups/create',
        element: <CreateGroupPage />,
      },
      {
        path: 'widgets/configure',
        element: <WidgetConfigurationPage />,
      },
      {
        path: ':id',
        element: <WidgetEditorPage />,
      },
      {
        path: 'main-dashboard',
        element: <MainDashboardPage />,
      },
      {
        path: 'main-control-panel',
        element: <MainControlPanelPage />,
      },
    ],
  },
  // --------------------Solutions templates Routes --------------------
  {
    path: '/solution-templates',
    element: <FeatureRoute feature="solutionTemplates" />,
    children: [
      {
        index: true,
        element: <SolutionTemplates />,
      },
      {
        path: 'preview/:id',
        element: <TemplatePreviewPage />,
      },
      {
        path: 'create',
        element: <CreateTemplatePage />,
      },
    ],
  },
  // ----------------------- floor plans ------------------------
  {
    path: '/floor-plans',
    element: <FeatureRoute feature="floorPlans" />,
    children: [
      {
        index: true,
        element: <FloorPlans />,
      },
      {
        path: 'create',
        element: <FloorMapCreatePage />,
      },
      {
        path: 'multifloor',
        element: <MultiFloorBuildingViewPage />,
      },
      {
        path: 'settings',
        element: <FloorMapSettingsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'hierarchy',
        element: <BuildingHierarchyChartPage />,
      },
      {
        path: 'alert-configuration',
        element: <AlertConfigurationPage />,
      },
      {
        path: 'history',
        element: <FloorMapHistoryPage />,
      },
      {
        path: 'report-templates',
        element: <ReportTemplatesPage />,
      },
      {
        path: ':id',
        element: <FloorPlanDetailPage />,
      },
    ],
  },
];
