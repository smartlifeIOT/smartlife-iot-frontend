import React, { Suspense, ElementType } from 'react';
import { LoadingOverlay, LoadingPage } from './LoadingSpinner';

/**
 * Higher-order component to wrap lazy-loaded components with a Suspense boundary.
 *
 * @param Component The lazy-loaded component to wrap.
 * @returns A component wrapped in Suspense with a loading fallback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<LoadingOverlay />}>
    <Component {...props} />
  </Suspense>
);
