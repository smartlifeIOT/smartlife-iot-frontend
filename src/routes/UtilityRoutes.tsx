import React, { lazy } from 'react';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';

const WidgetEditorPage = Loadable(
  lazy(() => import('@/features/solution-Dashboards/pages/WidgetEditorPage'))
);
const PrivateNotFoundPage = Loadable(
  lazy(() => import('@/pages/PrivateNotFoundPage.tsx'))
);

export const utilityRoutes = [
  {
    path: '/dashboards/:id',
    element: <FeatureRoute feature="widgetEditor" />,
    children: [
      {
        index: true,
        element: <WidgetEditorPage />,
      },
    ],
  },

  {
    path: '*',
    element: <PrivateNotFoundPage />,
  },
];
