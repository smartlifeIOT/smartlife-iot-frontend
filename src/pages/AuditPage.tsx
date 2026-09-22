import { useTranslation } from 'react-i18next';
import { FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuditLogs } from '@/features/audit/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { AuditLog } from '@/services/api/audit.api';
import { PageHeader } from '@/components/common/PageHeader';

export default function AuditPage() {
  const { t } = useTranslation();

  const { data: auditData, isLoading } = useAuditLogs();

  const apiResponse = auditData?.data as unknown as
    | { data?: { data?: AuditLog[] } }
    | undefined;

  const logs = apiResponse?.data?.data || [];

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'destructive',
      LOGIN: 'default',
      LOGOUT: 'secondary',
    };
    return colors[action] || 'default';
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('audit.title')} description={t('audit.subtitle')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('audit.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.table.action')}</TableHead>
                  <TableHead>{t('audit.table.entityType')}</TableHead>
                  <TableHead>{t('audit.table.entityName')}</TableHead>
                  <TableHead>{t('audit.table.user')}</TableHead>
                  <TableHead>{t('audit.table.timestamp')}</TableHead>
                  <TableHead>{t('audit.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant={
                          getActionColor(log.action) as
                            | 'default'
                            | 'destructive'
                            | 'secondary'
                            | 'outline'
                            | 'success'
                        }
                      >
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>{log.entityName}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.success ? 'success' : 'destructive'}>
                        {log.success
                          ? t('audit.table.success')
                          : t('audit.table.failed')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
