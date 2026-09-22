import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '@/assets/images/smartlife-text-black.png';
/**
 * Error page component for React Router route errors
 * This catches errors that occur during route rendering/loading
 */
export function RouteErrorPage() {
  const error = useRouteError();
  
  let errorMessage = 'An unexpected error occurred';
  let errorStatus: number | undefined;
  let errorStack: string | undefined;

  if (isRouteErrorResponse(error)) {
    // Error from route loader/action
    errorMessage = error.statusText || error.data?.message || `Error ${error.status}`;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    // Standard JavaScript error
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary  p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <CardTitle className="text-2xl"> <img src={logo} width={100} height={100} alt="" /></CardTitle>
          </div>
          <CardDescription>
            An error occurred while loading this route
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorStatus && (
            <div className="text-sm text-gray-600">
              <strong>Status:</strong> {errorStatus}
            </div>
          )}
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>

          {errorStack && process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Stack Trace (Development Only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                {errorStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
            <Button
              asChild
              variant="default"
              className="flex items-center gap-2"
            >
              <Link to="/dashboard">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

