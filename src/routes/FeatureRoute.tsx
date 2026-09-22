import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { SubscriptionFeatures } from '@/types/authentication';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

interface FeatureRouteProps {
  feature: keyof SubscriptionFeatures;
}

/**
 * FeatureRoute component to restrict access to routes based on subscription features.
 * If the user has the required feature enabled, it renders the child routes (Outlet).
 * Otherwise, it shows the UnauthorizedPage.
 */
export const FeatureRoute: React.FC<FeatureRouteProps> = ({ feature }) => {
  const { features } = useAppStore();

  if (!features || features[feature] !== true) {
    // If feature is disabled or features object is not available, show unauthorized page
    return <UnauthorizedPage />;
  }

  return <Outlet />;
};
