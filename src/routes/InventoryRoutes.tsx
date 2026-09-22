import { lazy } from 'react';
import { FeatureRoute } from '@/routes/FeatureRoute.tsx';
import { Loadable } from '@/components/common/Loadable';
import DeviceDetailsPage from '@/features/devices/page/DeviceDetailsPage';

const DevicesPage = Loadable(
  lazy(() => import('@/features/devices/page/DevicesPage'))
);
const AssetsPage = Loadable(
  lazy(() => import('@/features/assets/page/AssetsPage'))
);
const AssetDetailsPage = Loadable(
  lazy(() => import('@/features/assets/page/AssetDetailsPage'))
);
const AssetProfiles = Loadable(
  lazy(() => import('@/pages/AssetProfilesPage.tsx'))
);
const AssetProfileDetails = Loadable(
  lazy(() => import('@/features/profiles/Pages/AssetProfileDetails'))
);
const DeviceProfiles = Loadable(
  lazy(() => import('@/pages/DeviceProfilesPage.tsx'))
);
const DeviceProfileDetails = Loadable(
  lazy(() => import('@/pages/DeviceProfileDetails.tsx'))
);

export const inventoryRoutes = [
  {
    path: '/devices',
    element: <FeatureRoute feature="devices" />,
    children: [
      {
        index: true,
        element: <DevicesPage />,
      },
      {
        path: ':id',
        element: <DeviceDetailsPage />,
      },
    ],
  },
  //  ----------------------- routes for assets -----------------------
  {
    path: '/assets',
    element: <FeatureRoute feature="assets" />,
    children: [
      {
        index: true,
        element: <AssetsPage />,
      },
      {
        path: ':id',
        element: <AssetDetailsPage />,
      },
    ],
  },
  // ------------------ assets-profiles routes ------------------
  {
    path: '/asset-profiles',
    element: <FeatureRoute feature="assetProfiles" />,
    children: [
      {
        index: true,
        element: <AssetProfiles />,
      },
      {
        path: ':id',
        element: <AssetProfileDetails />,
      },
    ],
  },
  // ------------------ Device-profiles routes ------------------
  {
    path: '/device-profiles',
    element: <FeatureRoute feature="deviceProfiles" />,
    children: [
      {
        index: true,
        element: <DeviceProfiles />,
      },
      {
        path: ':id',
        element: <DeviceProfileDetails />,
      },
    ],
  },
];
