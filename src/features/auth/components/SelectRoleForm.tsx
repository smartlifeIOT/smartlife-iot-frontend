import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

type Role = 'owner' | 'employee';

export const SelectRoleForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { mutate: submitRole, isPending } = useMutation({
    mutationFn: async (role: Role) => {
      // TODO: Replace with actual API call when service method is available
      // return authService.selectRole({ role });
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ message: 'Role selected successfully' });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success(t('auth.selectRole.roleSelectedSuccessfully'));
      // Navigate to next step (e.g., dashboard or complete registration)
      navigate('/login');
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data &&
         typeof error.response.data.message === 'string')
          ? error.response.data.message
          : t('auth.selectRole.failedToSelectRole');
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    if (!selectedRole) {
      toast.error(t('auth.selectRole.roleRequired'));
      return;
    }

    submitRole(selectedRole);
  };

  return (
    <div className="w-full max-w-lg animate-fadeIn">
      {/* Role Selection Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setSelectedRole('owner')}
          className={`flex-1 h-16 rounded-xl font-semibold text-lg transition-all shadow-md ${
            selectedRole === 'owner'
              ? 'bg-primary text-white  '
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('auth.selectRole.owner')}
        </button>
        
        <button
          type="button"
          onClick={() => setSelectedRole('employee')}
          className={`flex-1 h-16 rounded-xl font-semibold text-lg transition-all shadow-md ${
            selectedRole === 'employee'
              ? 'bg-primary text-white  '
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('auth.selectRole.employee')}
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 shadow-xl"
          isLoading={isPending}
          disabled={!selectedRole}
        >
          {isPending ? t('auth.selectRole.submitting') : t('auth.selectRole.submit')}
        </Button>
      </div>

      {/* Back to Sign up Link */}
      <div className="flex justify-start">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.selectRole.backToSignUp')}
        </Link>
      </div>
    </div>
  );
};

