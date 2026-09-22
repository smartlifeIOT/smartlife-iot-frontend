import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

interface AccountBlockedFormProps {
  onClose?: () => void;
}

export const AccountBlockedForm: React.FC<AccountBlockedFormProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenSupportChat = () => {
    // TODO: Implement support chat functionality
    // This could open a chat widget, navigate to a support page, or trigger an action
    console.log('Open support chat');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default behavior: navigate to login
      navigate('/login');
    }
  };

  return (
    <div className="w-full max-w-lg animate-fadeIn relative">
      {/* Main Card */}
      <div
        className="bg-white rounded-2xl p-8 shadow-lg border border-pink-200 relative"
        style={{
          boxShadow:
            '0 4px 20px rgba(236, 72, 153, 0.15), 0 0 0 1px rgba(236, 72, 153, 0.1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase pr-8">
          {t('auth.accountBlocked.title')}
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-700 mb-8 leading-relaxed">
          {t('auth.accountBlocked.message')}
        </p>

        {/* Support Chat Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleOpenSupportChat}
            size="lg"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-3xl shadow-md"
          >
            {t('auth.accountBlocked.openSupportChat')}
          </Button>
        </div>
      </div>
    </div>
  );
};
