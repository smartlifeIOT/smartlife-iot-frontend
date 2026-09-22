import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './AppProviders.tsx';
import { router } from './routes.tsx';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import '../styles/globals.css';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App-level error:', error, errorInfo);
      }}
    >
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
