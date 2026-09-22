import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { DASHBOARD_ROUTES } from '@/utils/constants/routes';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen bg-gray-50 flex flex-col items-center  ">
      <Card className="w-full max-w-xl   text-center   ">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-transparent bg-clip-text  text-secondary">
            403
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16   bg-secondary rounded-full flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            Access Denied
          </h2>
          <p className="text-gray-600  ">
            You don't have the permission to access this page. Please Upgrade
            your subscription or contact your administrator if you believe this
            is a mistake.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <Button
              onClick={() => navigate(DASHBOARD_ROUTES.OVERVIEW)}
              className="bg-secondary hover:bg-secondary text-white px-6 py-3 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-xl text-sm font-medium shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
