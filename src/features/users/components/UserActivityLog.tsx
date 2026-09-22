import { Badge } from '@/components/ui/badge';
import { useAuditLogs } from '@/features/audit/hooks';
import { AuditLog } from '@/services/api';
import { useTranslation } from 'react-i18next';

export const UserActivityLog = ({ userId, title }: { userId: string, title?: string }) => {
  const { t } = useTranslation();
  const { data: auditLogsData } = useAuditLogs({ userId, page: 1, limit: 10 });
  const auditLogs = auditLogsData?.data?.data;

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center bg-gray-50/50 dark:bg-gray-800/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('usersManagement.activity_log.noUserActivity')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
        {title || t('usersManagement.activity_log.noActivity')}
      </h2>
      <div className="space-y-3">
        {auditLogs?.map((item: AuditLog) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:bg-gray-800/50 dark:border-gray-700 hover:border-primary/20 transition-all group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                {item.status && (
                  <Badge 
                    variant="outline"
                    className="bg-secondary/5 text-secondary border-secondary/20 text-[10px] font-bold px-2 py-0.5"
                  >
                    {item.status}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              )}
            </div>
            {item.timestamp && (
              <div className="text-right flex flex-col min-w-fit">
                <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserActivityLog;
