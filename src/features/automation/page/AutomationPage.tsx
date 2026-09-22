import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { AutomationStats } from '@/features/automation/AutomationStats';
import { AutomationDialog } from '@/features/automation/AutomationDialog';
import { Automation } from '@/features/automation/types';
import {
  useAutomationStats,
  useAutomations,
  useCreateAutomation,
  useDeleteAutomation,
  useToggleAutomation,
  useUpdateAutomation,
} from '@/features/automation/hooks/useAutomation';
import toast from 'react-hot-toast';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog/DeleteConfirmationDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SkeltonLoader from '@/components/ui/SkeltonLoader';

export default function AutomationPage() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [automationToDelete, setAutomationToDelete] = useState<string | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAutomation, setSelectedAutomation] =
    useState<Automation | null>(null);
  const currentPage = 1;
  const itemsPerPage = 10;

  const { register, watch } = useForm({
    defaultValues: {
      search: '',
    },
  });
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();
  const toggleAutomation = useToggleAutomation();

  const searchQuery = watch('search');

  const { data: automationsData, isLoading } = useAutomations({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
  });

  const responseData = automationsData?.data;
  const automations = responseData?.data || [];
  const { data: stats, isLoading: statsLoading } = useAutomationStats();

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedAutomation(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (automation: Automation) => {
    setDialogMode('edit');
    setSelectedAutomation(automation);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAutomationToDelete(id);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!automationToDelete) return;

    deleteAutomation.mutate(automationToDelete, {
      onSuccess: () => {
        setIsConfirmDeleteDialogOpen(false);
        setAutomationToDelete(null);
        toast.success('Automation deleted successfully');
      },
      onError: (error) => {
        toast.error('Error deleting automation');
        console.error('Error deleting automation:', error);
      },
    });
  };

  const handleToggle = (id: string, enabled: boolean) => {
    toggleAutomation.mutate(id, {
      onSuccess: () => {
        toast.success(enabled ? 'Automation enabled' : 'Automation disabled');
      },
      onError: (error) => {
        toast.error('Error toggling automation');
        console.error('Error toggling automation:', error);
      },
    });
  };

  const handleDialogSubmit = (data: Partial<Automation>) => {
    if (dialogMode === 'edit' && selectedAutomation?.id) {
      updateAutomation.mutate(
        { id: selectedAutomation.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast.success('Automation updated successfully');
          },
          onError: (error: any) => {
            toast.error(error?.message || 'Failed to update automation');
          },
        }
      );
    } else {
      createAutomation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('Automation created successfully');
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to create automation');
        },
      });
    }
  };
  if (isLoading || statsLoading) {
    return <SkeltonLoader />;
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('automation.title')}
        description={t('automation.description')}
        actions={[
          {
            label: t('automation.buttons.create'),
            onClick: handleCreate,
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      {/* Stats */}
      <AutomationStats stats={stats} />

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>{t('automation.table.title')}</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('search')}
                placeholder={t('automation.table.searchPlaceholder')}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automations.map((automation) => (
                <TableRow key={automation.id}>
                  <TableCell>{automation.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={automation.enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(automation.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {automation.lastTriggered
                      ? format(automation.lastTriggered, 'yyyy-MM-dd HH:mm:ss')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {automation.enabled ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(automation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className="ms-2"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(automation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/*  */}
      <AutomationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        initialData={selectedAutomation}
        onSubmit={handleDialogSubmit}
      />

      <DeleteConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteAutomation.isPending}
        title={t('automation.delete.title', 'Delete Automation')}
        description={t(
          'automation.delete.description',
          'Are you sure you want to delete this automation? This action cannot be undone.'
        )}
        itemName={automations.find((a) => a.id === automationToDelete)?.name}
      />
    </div>
  );
}
