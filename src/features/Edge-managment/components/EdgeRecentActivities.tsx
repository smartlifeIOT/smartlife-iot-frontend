import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  Server,
} from 'lucide-react';
import { EdgeActivity } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface EdgeRecentActivitiesProps {
  activities: EdgeActivity[];
}

export const EdgeRecentActivities: React.FC<EdgeRecentActivitiesProps> = ({
  activities,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between bg-primary text-white py-2 px-4 rounded">
          <CardTitle className="text-xl font-semibold flex text-white items-center gap-2">
            Recent Activities
          </CardTitle>
          <Badge variant="outline" className="font-normal text-white">
            Last 24 Hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 p-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className="relative flex border-b border-gray-200 items-start gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.action}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Server className="h-3 w-3" />
                    <span>{activity.instanceName}</span>
                  </div>

                  {activity.details && (
                    <p className="text-xs text-slate-500 bg-slate-50/50 p-2 rounded-md border border-slate-100 mt-2">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activities found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
