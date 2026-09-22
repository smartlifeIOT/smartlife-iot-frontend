import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Search, PenBox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useAssetsPage,
  useCreateAsset,
  useUpdateAsset,
  type Asset,
} from '@/features/assets/hooks';
import { debounce } from '@/lib/util';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Trash2, Download } from 'lucide-react';
import { AddAssetModal } from '@/features/assets/components/AddAssetModal';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { format } from 'date-fns';
import { PageHeader } from '@/components/common/PageHeader';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog/DeleteConfirmationDialog';

export default function AssetsPage() {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const {
    searchQuery,
    isLoading,
    assets,
    totalAssets,
    currentPage,
    totalPages,
    itemsPerPage,
    meta,
    handleSearchChange,
    handlePageChange,
    handleAction,
    handleExport,
    handleImport,
  } = useAssetsPage();
  // Handle opening add asset modal
  const handleOpenAddAssetModal = () => {
    setIsAddAssetModalOpen(true);
  };

  // Handle saving asset from modal
  const handleSaveAsset = async (assetData: {
    name: string;
    type: string;
    description: string;
    assetProfileId?: string;
    parentAssetId?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    attributes: Array<{ key: string; value: string }>;
  }) => {
    setIsSavingAsset(true);
    try {
      await createAssetMutation.mutateAsync(assetData);
      // Close modal and show success
      setIsAddAssetModalOpen(false);
    } catch (error: unknown) {
      console.error('Failed to create asset:', error);
    } finally {
      setIsSavingAsset(false);
    }
  };

  // Handle saving edited asset from modal
  const handleSaveEditedAsset = async (assetData: {
    name: string;
    type: string;
    description: string;
    assetProfileId?: string;
    parentAssetId?: string;
    location?: { latitude: number; longitude: number };
    attributes: Array<{ key: string; value: string }>;
  }) => {
    if (!editingAsset) return;
    setIsSavingAsset(true);
    try {
      await updateAssetMutation.mutateAsync({
        id: editingAsset.id,
        data: assetData,
      });
      setEditingAsset(null);
      setIsAddAssetModalOpen(false);
    } catch (error: unknown) {
      console.error('Failed to update asset:', error);
    } finally {
      setIsSavingAsset(false);
    }
  };

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Create debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        handleSearchChange(value);
      }, 300),
    [handleSearchChange]
  );

  // Handle input change with immediate UI update and debounced search
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PageHeader
            title={t('assets.title')}
            description={t('assets.subtitle')}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('assets.actions.export')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {t('assets.actions.import')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddAssetModal}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white"
            >
              {t('assets.actions.addAsset')}
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center gap-3">
          <div className="relative  ">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('assets.searchPlaceholder')}
              value={inputValue}
              onChange={handleInputChange}
              className="w-96 pr-10"
            />
          </div>
        </div>

        {/* Assets Table */}
        <Card className="shadow-md rounded-xl border-gray-200 overflow-hidden">
          <CardContent className="p-6 relative min-h-[400px]">
            {isLoading && <LoadingOverlay />}
            <div className="">
              <Table>
                <TableHeader className="bg-primary text-white">
                  <TableRow className="hover:bg-primary">
                    <TableHead className="text-white font-semibold">
                      {t('assets.table.name')}
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      {t('common.type')}
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      {t('common.status')}
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      {t('assets.table.location')}
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      {t('assets.table.created')}
                    </TableHead>
                    <TableHead className="text-right text-white font-semibold">
                      {t('assets.table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meta?.total === 0 && !isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center bg-slate-50 text-muted-foreground"
                      >
                        {t('assets.noAssets') || 'No assets found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => (
                      <TableRow
                        key={asset.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          (window.location.href = `/assets/${asset.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          <span className="capitalize">{asset.name}</span>
                        </TableCell>
                        <TableCell>
                          <p className="font-normal capitalize">{asset.type}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              asset.status === 'active'
                                ? 'bg-green-500 hover:bg-green-600'
                                : asset.status === 'warning'
                                  ? 'bg-amber-500 hover:bg-amber-600'
                                  : 'bg-red-500 hover:bg-red-600'
                            } text-white`}
                          >
                            {asset.status === 'active'
                              ? t('assets.status.active') || 'Active'
                              : asset.status === 'warning'
                                ? t('common.warning') || 'Warning'
                                : t('assets.status.error') || 'Error'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {asset.location?.city || 'N/A'} ,{' '}
                          {asset.location?.country || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {asset.created
                            ? format(new Date(asset.created), 'yyyy-MM-dd')
                            : 'N/A'}
                        </TableCell>

                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => {
                                setAssetToDelete(asset.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => {
                                setEditingAsset(asset);
                                setIsAddAssetModalOpen(true);
                              }}
                            >
                              <PenBox className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalAssets}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Asset Modal */}
      <AddAssetModal
        open={isAddAssetModalOpen}
        onOpenChange={(open) => {
          setIsAddAssetModalOpen(open);
          if (!open) setEditingAsset(null);
        }}
        onSave={editingAsset ? handleSaveEditedAsset : handleSaveAsset}
        isLoading={isSavingAsset}
        mode={editingAsset ? 'edit' : 'add'}
        initialData={editingAsset ? editingAsset : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setAssetToDelete(null);
        }}
        onConfirm={() => {
          if (assetToDelete) handleAction('delete', assetToDelete);
        }}
        title={t('common.deleteConfirmation.title')}
        itemName={
          assets.find((d: any) => d.id === assetToDelete)?.name ||
          t('common.name')
        }
      />
    </>
  );
}
