import React, { lazy } from 'react';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';
import AutomationTemplatesPage from '@/features/automation/page/AutomationTemplatesPage';

// Import connectivity page components lazily
const Automation = Loadable(
  lazy(() => import('@/features/automation/page/AutomationPage'))
);
const Integrations = Loadable(
  lazy(() => import('@/features/integrations/page/IntegrationsPage'))
);
const IntegrationDetailsPage = Loadable(
  lazy(() => import('@/features/integrations/page/IntegrationDetailsPage'))
);
const AddIntegrationPage = Loadable(
  lazy(() => import('@/features/integrations/page/AddIntegrationPage'))
);
const EdgeManagement = Loadable(
  lazy(() => import('@/features/Edge-managment/page/EdgeManagementPage'))
);
const ScheduleManagement = Loadable(
  lazy(() => import('@/pages/ScheduleManagementPage.tsx'))
);
const SharingCenter = Loadable(
  lazy(() => import('@/pages/SharingCenterPage.tsx'))
);
const CreateRuleChainTemplate = Loadable(
  lazy(() => import('@/pages/CreateRuleChainTemplatePage.tsx'))
);
const MQTTTemplatePage = Loadable(
  lazy(() => import('@/pages/MQTTTemplatePage.tsx'))
);
const RuleChainTemplates = Loadable(
  lazy(() => import('@/pages/RuleChainTemplatesPage.tsx'))
);
const CreateConverterTemplate = Loadable(
  lazy(() => import('@/pages/CreateConverterTemplatePage.tsx'))
);
const JsonUplinkConverterConfig = Loadable(
  lazy(() => import('@/pages/JsonUplinkConverterConfigPage.tsx'))
);
const ConverterTemplates = Loadable(
  lazy(() => import('@/pages/ConverterTemplatesPage.tsx'))
);

export const connectivityRoutes = [
  // ------------------ automation ------------------------
  {
    path: '/automation',
    element: <FeatureRoute feature="automations" />,
    children: [
      {
        index: true,
        element: <Automation />,
      },
      {
        path: 'automation-templates',
        element: <AutomationTemplatesPage />,
      },
    ],
  },

  {
    path: '/edge-management',
    element: <FeatureRoute feature="edge" />,
    children: [
      {
        index: true,
        element: <EdgeManagement />,
      },
      {
        path: 'create-rule-chain',
        element: <CreateRuleChainTemplate />,
      },
      {
        path: 'rule-chain-templates',
        element: <RuleChainTemplates />,
      },
      {
        path: 'mqtt-template/:id',
        element: <MQTTTemplatePage />,
      },
      {
        path: 'create-converter-template',
        element: <CreateConverterTemplate />,
      },
      {
        path: 'converter-config/:id',
        element: <JsonUplinkConverterConfig />,
      },
      {
        path: 'converter-templates',
        element: <ConverterTemplates />,
      },
    ],
  },
  {
    path: '/schedule-management',
    element: <FeatureRoute feature="scheduleManagement" />,
    children: [
      {
        index: true,
        element: <ScheduleManagement />,
      },
    ],
  },
  {
    path: '/sharing-center',
    element: <FeatureRoute feature="sharingCenter" />,
    children: [
      {
        index: true,
        element: <SharingCenter />,
      },
    ],
  },
];
