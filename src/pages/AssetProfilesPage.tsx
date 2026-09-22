import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Plus,
  Factory,
  Home,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import { AssetProfileForm } from '@/features/profiles/components';
import type { AssetProfileFormData } from '@/features/profiles/types';
import {
  useAssetProfileAssets,
  useAssetProfiles,
  useCreateAssetProfile,
  useDeleteAssetProfile,
} from '@/features/profiles/hooks';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { AssetProfile } from '@/features/assets/types';

export default function AssetProfiles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: assetProfiles, isLoading: isAssetProfilesLoading } =
    useAssetProfiles({
      page: currentPage,
      limit: itemsPerPage,
    });

  const { total, limit, totalPages } = assetProfiles?.data?.data?.meta || {};
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // API response structure: response.data.data.data (nested response)
  const assetProfilesData: AssetProfile[] = useMemo(() => {
    const apiResponse = assetProfiles?.data as
      | { data?: { data?: AssetProfile[] } }
      | undefined;
    return apiResponse?.data?.data ?? [];
  }, [assetProfiles]);
  // assets by profile ids
  const assetProfileIds = useMemo(
    () => assetProfilesData.map((profile) => profile.id),
    [assetProfilesData]
  );
  const { data: assetsByProfile } = useAssetProfileAssets(assetProfileIds);
  const totalAssets = useMemo(() => {
    return assetProfileIds.reduce((sum, id) => {
      return sum + (assetsByProfile?.[id]?.length ?? 0);
    }, 0);
  }, [assetProfileIds, assetsByProfile]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AssetProfile | null>(
    null
  );
  const createAssetProfileMutation = useCreateAssetProfile();
  const deleteAssetProfileMutation = useDeleteAssetProfile();

  const handleCreateProfile = async (data: AssetProfileFormData) => {
    try {
      await createAssetProfileMutation.mutateAsync(data);
      toast.success(t('assetProfiles.messages.createSuccess'));
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating asset profile:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t('assetProfiles.messages.createError');
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (profile: AssetProfile) => {
    setSelectedProfile(profile);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProfile) return;

    try {
      await deleteAssetProfileMutation.mutateAsync(selectedProfile.id);
      toast.success(t('assetProfiles.messages.deleteSuccess'));
      setDeleteDialogOpen(false);
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error deleting asset profile:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t('assetProfiles.messages.deleteError');
      toast.error(errorMessage);
    }
  };

  const tableHeaders = [
    t('assetProfiles.table.name'),
    t('assetProfiles.table.default'),
    t('assetProfiles.table.created'),
  ];

  if (isAssetProfilesLoading) {
    return <LoadingOverlay />;
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('assetProfiles.title')}
        description={t('assetProfiles.subtitle')}
        actions={[
          {
            label: t('assetProfiles.createProfile'),
            onClick: () => setIsCreateOpen(true),
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm  text-white font-medium">
              {t('assetProfiles.totalProfiles')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetProfilesData.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('assetProfiles.assetConfigurations')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('assetProfiles.totalAssets')}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {t('assetProfiles.usingTheseProfiles')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-success text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('assetProfiles.industrial')}
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                assetProfilesData.filter(
                  (p: AssetProfile) => p.category === 'Industrial'
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {t('assetProfiles.facilities')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white text-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('assetProfiles.commercial')}
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                assetProfilesData.filter(
                  (p: AssetProfile) => p.category === 'Commercial'
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {t('assetProfiles.buildings')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader className="bg-primary    text-white">
              <TableRow className="bg-primary hover:bg-primary">
                {tableHeaders.map((val, i) => {
                  return <TableHead key={i}>{val}</TableHead>;
                })}
                <TableHead className="text-right">
                  {t('assetProfiles.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetProfilesData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t('assetProfiles.noProfiles')}
                  </TableCell>
                </TableRow>
              ) : (
                assetProfilesData.map((assetProfile: AssetProfile) => (
                  <TableRow key={assetProfile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{assetProfile.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="capitalize">
                        {assetProfile.default ? (
                          <Badge>{t('assetProfiles.table.default')}</Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      {new Date(assetProfile.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right flex items-center  relative justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(assetProfile)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 0}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Create Asset Profile Dialog */}
      <AssetProfileForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProfile}
        isLoading={createAssetProfileMutation.isPending || false}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('assetProfiles.messages.deleteTitle')}
        itemName={selectedProfile?.name}
        description={t('assetProfiles.messages.deleteDescription', {
          name: selectedProfile?.name,
        })}
        isLoading={deleteAssetProfileMutation.isPending}
      />
    </div>
  );
}
