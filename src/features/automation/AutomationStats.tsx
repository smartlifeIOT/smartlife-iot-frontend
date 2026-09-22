import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Play, AlertTriangle } from 'lucide-react';
import { AutomationStatistics } from '@/services/api/automation.api';

export interface AutomationStatsProps {
  stats?: AutomationStatistics['data'];
}

export const AutomationStats: React.FC<AutomationStatsProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="bg-primary text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            {t('automation.stats.total')}
          </CardTitle>
          <Zap className="h-8 w-8 text-white " />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-white ">
            {t('automation.stats.totalDesc')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-secondary text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            {t('automation.stats.active')}
          </CardTitle>
          <Play className="h-8 w-8 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.active || 0}</div>
          <p className="text-xs text-white ">
            {t('automation.stats.activeDesc')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-rose-700/80 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            {t('automation.stats.errors')}
          </CardTitle>
          <AlertTriangle className="h-8 w-8 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.error || 0}</div>
          <p className="text-xs text-white ">
            {t('automation.stats.errorsDesc')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('automation.stats.executions')}
          </CardTitle>
          <Zap className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalExecutions || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('automation.stats.executionsDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
