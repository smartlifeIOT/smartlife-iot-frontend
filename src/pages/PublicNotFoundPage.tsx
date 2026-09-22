import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PublicNotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center items-center h-screen bg-[url('@assets/images/auth-bg.png')] bg-cover bg-center">
      <div className="w-full max-w-lg text-center p-6 space-y-6">
        {/* Centered Card */}
        <Card className="w-full text-center shadow-lg border-gray-200">
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
              The page you're looking for doesn't exist or may have been moved.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Go to Login
              </Button>

              <Button
                variant="ghost"
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
         
      </div>
    </div>
  );
}

