import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status') || '';
  const isSuccess = paymentStatus.toLowerCase() === 'paid';
  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-[url('@assets/images/bg-auth-2.png')] bg-cover bg-center">
      <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-lg text-center animate-fadeIn">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="text-base text-gray-600 mb-6">
          {isSuccess ? (
            <>
              Your payment has been processed successfully. Your subscription
              has been activated and you can now enjoy all the features of your
              selected plan.
            </>
          ) : (
            <>
              Unfortunately, your payment could not be processed. Please try
              again or contact support if the problem persists.
            </>
          )}
        </p>
        <Button
          onClick={() => navigate('/subscription-plans')}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          Go to Subscription Plans
        </Button>
      </div>
    </div>
  );
};
