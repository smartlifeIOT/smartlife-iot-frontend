import React, { lazy } from 'react';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';

// Import resource page components lazily
const WidgetsBundle = Loadable(lazy(() => import('@/features/widgets/page/WidgetsBundle')));
const Widgets = Loadable(lazy(() => import('@/features/widgets/page/WidgetsPage')));
const ImageLibrary = Loadable(
  lazy(() => import('@/pages/ImageLibraryPage.tsx'))
);
const ScriptLibrary = Loadable(lazy(() => import('@/pages/ScriptLibrary.tsx')));
// rutes for resource
export const resourceRoutes = [
  {
    path: '/widgets-bundle',
    element: <FeatureRoute feature="resources" />,
    children: [
      {
        index: true,
        element: <WidgetsBundle />,
      },
    ],
  },
  {
    path: '/widgets',
    element: <FeatureRoute feature="resources" />,
    children: [
      {
        index: true,
        element: <Widgets />,
      },
    ],
  },
  {
    path: '/images',
    element: <FeatureRoute feature="imageLibrary" />,
    children: [
      {
        index: true,
        element: <ImageLibrary />,
      },
    ],
  },
  {
    path: '/javascript-library',
    element: <FeatureRoute feature="scriptLibrary" />,
    children: [
      {
        index: true,
        element: <ScriptLibrary />,
      },
    ],
  },
];
