import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAlarms,
  useCriticalAlarms,
  useActiveAlarms,
  useAcknowledgeAlarm,
  useClearAlarm,
  useGetStatsAlaram,
  useDeleteAlarm,
} from '@/features/alarms/hooks';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { NavLink, useNavigate } from 'react-router-dom';
import { CreateAlarmRuleDialog } from '@/features/alarms/components/CreateAlarmRuleDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function AlarmsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [editAlarmId, setEditAlarmId] = useState<string | undefined>(undefined);
  const [deleteAlarmId, setDeleteAlarmId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteAlarm = useDeleteAlarm();

  // --- Filters (CRITICAL severity & ACTIVE status use dedicated endpoints) ---
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const isCriticalFilter = severityFilter === 'CRITICAL';
  const isActiveFilter = statusFilter === 'ACTIVE';

  // --- Data fetching (endpoint based) ---
  const { data: alarmsData, isLoading: isLoadingAll } = useAlarms();
  const { data: criticalAlarms, isLoading: isLoadingCritical } =
    useCriticalAlarms({ enabled: isCriticalFilter });
  const { data: activeAlarms, isLoading: isLoadingActive } = useActiveAlarms({
    enabled: isActiveFilter,
  });
  const acknowledgeAlarm = useAcknowledgeAlarm();
  const clearAlarm = useClearAlarm();

  const isLoading = isCriticalFilter
    ? isLoadingCritical
    : isActiveFilter
      ? isLoadingActive
      : isLoadingAll;

  // /alarms/critical, /alarms/active, or /alarms accordingly
  const sourceAlarms: any[] = isCriticalFilter
    ? (criticalAlarms ?? [])
    : isActiveFilter
      ? (activeAlarms ?? [])
      : (alarmsData?.data?.data.data ?? []);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'destructive',
      MAJOR: 'warning',
      MINOR: 'info',
      WARNING: 'secondary',
    };
    return colors[severity.toUpperCase()] || 'default';
  };

  // --- Multi-select state ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Complementary client-side filter (e.g. CRITICAL ∩ ACTIVE)
  const filteredAlarms = useMemo(
    () =>
      sourceAlarms.filter((alarm: any) => {
        const matchesSeverity =
          severityFilter === 'ALL' || alarm.severity === severityFilter;
        const matchesStatus =
          statusFilter === 'ALL' || alarm.status === statusFilter;
        return matchesSeverity && matchesStatus;
      }),
    [sourceAlarms, severityFilter, statusFilter]
  );

  const allFilteredSelected =
    filteredAlarms.length > 0 &&
    filteredAlarms.every((alarm: any) => selectedIds.includes(alarm.id));

  const handleSelectOne = (
    alarmId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      setSelectedIds((prev) =>
        prev.includes(alarmId) ? prev : [...prev, alarmId]
      );
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== alarmId));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredAlarms.forEach((a: any) => next.add(a.id));
        return Array.from(next);
      });
    } else {
      const filteredIds = new Set(filteredAlarms.map((a: any) => a.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkAcknowledge = () => {
    selectedIds.forEach((id) => acknowledgeAlarm.mutate({ alarmId: id }));
    clearSelection();
  };

  const handleBulkClear = () => {
    selectedIds.forEach((id) => clearAlarm.mutate({ alarmId: id }));
    clearSelection();
  };

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedIds.length > 0 && !allFilteredSelected;
    }
  }, [selectedIds, allFilteredSelected]);

  const { data: stats } = useGetStatsAlaram();
  const statsDataByStatus = stats?.byStatus;

  const statusCards = [
    {
      key: 'active' as const,
      label: t('alarms.activeAlarms'),
      icon: <AlertTriangle className="h-6 w-6 text-white" />,
      cardClassName: 'bg-primary text-white',
    },
    {
      key: 'acknowledged' as const,
      label: t('alarms.acknowledgedAlarms'),
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      cardClassName: 'bg-secondary text-white',
    },
    {
      key: 'cleared' as const,
      label: t('alarms.clearedAlarms'),
      icon: <XCircle className="h-6 w-6 text-white" />,
      cardClassName: 'bg-success text-white',
    },
    {
      key: 'resolved' as const,
      label: t('alarms.resolvedAlarms'),
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      cardClassName: 'bg-neutral-500 text-white',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('alarms.title')}
        description={t('alarms.description')}
        actions={[
          {
            label: 'Create Alert Rule',
            onClick: () => {
              setEditAlarmId(undefined);
              setIsCreateRuleOpen(true);
            },
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />
      <div className="grid gap-6 md:grid-cols-4">
        {statusCards.map((card) => (
          <Card key={card.key} className={card.cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                {card.label}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsDataByStatus?.[card.key] || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-sm">Filter by:</span>
            <Select
              className="w-40"
              value={severityFilter}
              onValueChange={setSeverityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('alarms.table.severity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t('alarms.filter.all') || 'All'}
                </SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                <SelectItem value="MAJOR">MAJOR</SelectItem>
                <SelectItem value="MINOR">MINOR</SelectItem>
                <SelectItem value="WARNING">WARNING</SelectItem>
                <SelectItem value="INDETERMINATE">INDETERMINATE</SelectItem>
              </SelectContent>
            </Select>
            <span className="font-medium text-sm"> Status:</span>
            <Select
              className="w-40"
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('alarms.table.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t('alarms.filter.all') || 'All'}
                </SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="ACKNOWLEDGED">ACKNOWLEDGED</SelectItem>
                <SelectItem value="CLEARED">CLEARED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">
                {selectedIds.length} {t('alarms.selected') || 'selected'}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleBulkAcknowledge}
              >
                {t('alarms.acknowledge')}
              </Button>
              <Button size="sm" variant="success" onClick={handleBulkClear}>
                {t('alarms.clear')}
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                {t('alarms.filter.clearSelection') || 'Clear selection'}
              </Button>
            </div>
          )}
        </div>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader className="bg-primary text-white">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      ref={headerCheckboxRef}
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t('alarms.title')}</TableHead>
                  <TableHead>{t('alarms.table.severity')}</TableHead>
                  <TableHead className="text-center">
                    {t('alarms.table.status')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('alarms.table.triggeredTime')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('alarms.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlarms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-slate-500"
                    >
                      {t('alarms.table.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlarms.map((alarm: any) => (
                    <TableRow key={alarm.id}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={selectedIds.includes(alarm.id)}
                          onChange={(e) => handleSelectOne(alarm.id, e)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{alarm.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {alarm.deviceId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getSeverityColor(alarm.severity) as any}
                          className="capitalize"
                        >
                          {alarm.severity}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={
                            alarm.status === 'ACTIVE'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {alarm.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center capitalize">
                        {formatDistanceToNow(new Date(alarm?.triggeredAt))}
                      </TableCell>
                      <TableCell
                        className="text-right flex gap-1 items-end justify-end relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() => navigate(`details/${alarm.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bottom-[70%] max-w-36">
                            {t('alarms.view')}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() => {
                                setEditAlarmId(alarm.id);
                                setIsCreateRuleOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bottom-[70%] max-w-36">
                            {t('alarms.edit')}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-rose-500 hover:text-white"
                              onClick={() => {
                                setDeleteAlarmId(alarm.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bottom-[70%] max-w-36">
                            {t('alarms.deleted')}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateAlarmRuleDialog
        open={isCreateRuleOpen}
        onOpenChange={setIsCreateRuleOpen}
        alarmId={editAlarmId}
      />
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          if (deleteAlarmId) {
            deleteAlarm.mutate(deleteAlarmId);
            setIsDeleteDialogOpen(false);
            setDeleteAlarmId(null);
          }
        }}
        // add alaram name
        title={t('alarms.delete.title') || 'Delete Alarm'}
        description={
          t('alarms.delete.description') +
          ' "' +
          filteredAlarms.find((alarm: any) => alarm.id === deleteAlarmId)
            ?.name +
          '"'
        }
      />
    </div>
  );
}
