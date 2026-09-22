import { Badge } from '@/components/ui/badge';
import { useAuditLogsByCustomerId } from '@/features/audit/hooks';
import { useTranslation } from 'react-i18next';

export type CustomerActivityLogItem = {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'info' | 'success' | 'warning';
};

const statusStyles: Record<
  NonNullable<CustomerActivityLogItem['status']>,
  string
> = {
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
};

const CustomerActivityLog = ({
  customerId,
}: {
  customerId: string;
  title?: string;
}) => {
  const { t } = useTranslation();
  const { data: auditLogsData } = useAuditLogsByCustomerId(customerId, 1, 10);
  const auditLogs = auditLogsData?.data;

  if (auditLogs?.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center bg-gray-50/50 dark:bg-gray-800/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('usersManagement.activity_log.noActivity')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 p-3 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-gray-100 dark:border-gray-700">
        <div className="col-span-6 md:col-span-7">
          <p>{t('usersManagement.activity_log.headers.description')}</p>
        </div>
        <div className="col-span-3 md:col-span-2">
          <p>{t('usersManagement.activity_log.headers.action')}</p>
        </div>
        <div className="col-span-3">
          <p>{t('usersManagement.activity_log.headers.date')}</p>
        </div>
      </div>
      <div className="space-y-2">
        {auditLogs?.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-4 items-center bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/20 transition-all group"
          >
            <div className="col-span-6 md:col-span-7 space-y-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <div className="col-span-3 md:col-span-2">
              {item.action && (
                <Badge 
                  variant="outline" 
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5"
                >
                  {item.action}
                </Badge>
              )}
            </div>
            <div className="col-span-3">
              {item.timestamp && (
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerActivityLog;
