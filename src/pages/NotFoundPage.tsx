import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { AppLayout } from '@/components/layout/AppLayout';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {/* Page Header */}
        <PageHeader title="Page Not Found" description="Oops! It seems you've reached an empty space." />

        {/* Centered Card */}
        <Card className="w-full max-w-lg text-center shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              404
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
                <Search className="w-8 h-8" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">Page Not Found</h2>
            <p className="text-gray-600">
              The page you’re looking for doesn’t exist or may have been moved.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
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

        {/* Subtle animated background icons */}
        <div className="flex gap-6 text-gray-400 text-lg mt-10">
          <span className="animate-bounce">✨</span>
          <span className="animate-bounce delay-150">🌙</span>
          <span className="animate-bounce delay-300">⭐</span>
        </div>
      </div>
  );
}
