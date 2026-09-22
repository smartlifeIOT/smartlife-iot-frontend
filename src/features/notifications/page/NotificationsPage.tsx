import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useNotifications,
  useMarkAsRead,
  DeleteNotificationById,
} from '@/features/notifications/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginatedNotificationsResponse } from '@/services/api';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const {
    data: notificationsData,
    isLoading,
  }: { data: any; isLoading: boolean } = useNotifications();

  const { mutate: deleteNotificationById } = DeleteNotificationById();
  const markAsRead = useMarkAsRead();
  const notifications: PaginatedNotificationsResponse | any =
    notificationsData?.data || [];
  console.log(notificationsData);
  return (
    <div className="space-y-6">
      <PageHeader
        title="All Notifications"
        description={`(${notificationsData?.total}) notifications found`}
      />
      <Card className="shadow-lg rounded-xl pt-4 border-secondary/50">
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : notificationsData.total === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500">
                {t('notifications.noNotifications')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificationsData.data.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 transition-colors ${
                    !notification.read
                      ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.isRead && (
                          <Badge variant="default" className="h-5">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead.mutate(notification.id)}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotificationById(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
