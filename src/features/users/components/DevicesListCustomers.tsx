import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { useDevicesByCustomerId } from '../hooks';
import { useTranslation } from 'react-i18next';

const DevicesListCustomers = ({ customerId }: { customerId: string }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          {t('devices.title') || 'Devices List'}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default DevicesListCustomers;
