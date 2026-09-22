import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plug,
  Plus,
  CheckCircle2,
  Trash2,
  Zap,
  Activity,
  Edit,
  Eye,
} from 'lucide-react';
import {
  useIntegrations,
  useIntegrationStats,
  useToggleIntegration,
  useDeleteIntegration,
  useRecentActivity,
} from '@/features/integrations/Hooks';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

export default function Integrations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string>('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: integrationsResponse, isLoading: integrationsLoading } =
    useIntegrations({
      page: currentPage,
      limit: itemsPerPage,
    });
  const { data: stats, isLoading: statsLoading } = useIntegrationStats();

  const { mutate: toggleStatus } = useToggleIntegration();
  const deleteMutation = useDeleteIntegration();
  const { data: recentactivity, isLoading: recentLoading } =
    useRecentActivity();
  // useRecentActivity already unwraps the API envelope (response.data.data),
  // so `recentactivity` is the activity list itself. The `.data` fallback is
  // kept only as a defensive guard against a paginated-wrapped payload.
  const activityList = recentactivity?.data ?? recentactivity ?? [];

  const handleStatusToggle = async (id: string) => {
    await toggleStatus(id);
  };

  const handleAction = async (action: string, id: string) => {
    if (action === 'delete') {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Integration deleted');
      } catch (error) {
        toast.error('Failed to delete integration');
      }
    } else if (action === 'view') {
      navigate(`/integrations/${id}`);
    }
  };

  const paginationInfo = useMemo(() => {
    return {
      currentPage: integrationsResponse?.page || 1,
      totalPages: integrationsResponse?.totalPages || 0,
      totalItems: integrationsResponse?.total || 0,
      itemsPerPage: integrationsResponse?.limit || 10,
    };
  }, [integrationsResponse]);

  const totalIntegrations = stats?.total || 0;
  const activeIntegrations = stats?.active || 0;
  const inactiveIntegrations = stats?.inactive || 0;
  const errorIntegrations = stats?.error || 0;
  const mqttCount = stats?.byType?.mqtt ?? 0;
  const toyaCount = stats?.byType?.tuya ?? 0;
  const cloudCount = stats?.byType?.cloud ?? 0;
  const webhookCount = stats?.byType?.webhook ?? 0;
  if (integrationsLoading || statsLoading) return <LoadingOverlay />;

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('integrations.title')}
        description={t('integrations.description')}
        actions={[
          {
            label: t('integrations.add'),
            onClick: () => navigate('/integrations/add-integration'),
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('integrations.stats.total')}
            </CardTitle>
            <Plug className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntegrations}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('integrations.stats.active')}
            </CardTitle>
            <CheckCircle2 className="h-6 w-6  " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  ">{activeIntegrations}</div>
          </CardContent>
        </Card>

        <Card className="bg-success text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('integrations.stats.inactive')}
            </CardTitle>
            <Activity className="h-6 w-6 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveIntegrations}</div>
          </CardContent>
        </Card>

        <Card className="text-white bg-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('integrations.stats.error')}
            </CardTitle>
            <Zap className="h-6 w-6  " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  ">{errorIntegrations}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('integrations.title')}</CardTitle>
          <CardDescription>{t('integrations.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-white">
                <TableHead>{t('integrations.table.name')}</TableHead>
                <TableHead>{t('integrations.table.type')}</TableHead>
                <TableHead>{t('integrations.table.status')}</TableHead>
                <TableHead>{t('integrations.table.protocol')}</TableHead>
                <TableHead>{t('integrations.table.lastActivity')}</TableHead>
                <TableHead className="text-right">
                  {t('integrations.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrationsResponse?.data?.map((integration: any) => (
                <TableRow key={integration.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Plug className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {integration.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {integration.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {integration.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => handleStatusToggle(integration.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-muted-foreground">
                      {integration.config?.protocol || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {integration.updatedAt
                        ? new Date(integration.updatedAt).toLocaleString()
                        : 'Never'}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-secondary hover:text-white"
                      onClick={() => handleAction('view', integration.id)}
                    >
                      <Eye className="  h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-secondary hover:text-white"
                      onClick={() => handleAction('edit', integration.id)}
                    >
                      <Edit className="  h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-secondary hover:text-white"
                      onClick={() => handleDelete(integration.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!integrationsResponse?.data ||
                integrationsResponse?.data?.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No integrations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pagination
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPages}
              totalItems={paginationInfo.totalItems}
              itemsPerPage={paginationInfo.itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2  gap-4">
        <Card className=" ">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Integration Service:</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Message Queue:</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Database:</span>
                <span className="text-orange-500 font-medium">High Load</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">External APIs:</span>
                <span className="text-green-600 font-medium">Responding</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Integratoin Counts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">MQTT: </span>
                <span className="text-green-600 font-medium">{mqttCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Cloud:</span>
                <span className="text-green-600 font-medium">{cloudCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Toya :</span>
                <span className="text-orange-500 font-medium">{toyaCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Webhooks:</span>
                <span className="text-green-600 font-medium">
                  {webhookCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {activityList.length === 0 ? (
              <p className="text-sm text-slate-400">
                {recentLoading
                  ? 'Loading recent activity...'
                  : 'No recent activity found.'}
              </p>
            ) : (
              activityList.map((item: any, index: number) => (
                <div
                  key={
                    item.id ??
                    `${item.integrationName}-${item.timestamp}-${index}`
                  }
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 flex justify-between items-start gap-2">
                    <span className="text-sm text-slate-600">
                      {item.integrationName ?? 'Unknown integration'} - Status:{' '}
                      {item.status ?? 'N/A'}
                    </span>
                    {item.timestamp && (
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {format(new Date(item.timestamp), 'PPP')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => handleAction('delete', deleteId)}
        title="Delete Integration"
        description="Are you sure you want to delete this integration?"
      />
    </div>
  );
}
