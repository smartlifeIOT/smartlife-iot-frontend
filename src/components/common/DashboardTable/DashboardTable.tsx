import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';

export interface DashboardTableItem {
  id: string;
  title: string;
  tag?: string;
  tagColor?: string;
  createdTime: string;
  status: 'active' | 'deactivate';
  customerName: string;
}

export interface DashboardTableProps {
  linkto: string;
  data: DashboardTableItem[];
  onStatusToggle?: (id: string) => void;
  onAction?: (
    action: 'share' | 'view' | 'delete' | 'download',
    id: string
  ) => void;
  onBulkDelete?: (ids: string[]) => void;
  onTitleClick?: (id: string) => void;
  getNavigationPath?: (id: string) => string;
  columns?: {
    title?: boolean;
    createdTime?: boolean;
    status?: boolean;
    customerName?: boolean;
    actions?: boolean;
  };
  translationKeys?: {
    title?: string;
    createdTime?: string;
    activateDeactivate?: string;
    customerName?: string;
    actions?: string;
    active?: string;
    deactivate?: string;
    tagPrefix?: string;
  };
  emptyMessage?: string;
  // Pagination props
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    showItemsPerPage?: boolean;
  };
  handleNextPage?: () => void;
  handlePreviousPage?: () => void;
  handleFirstPage?: () => void;
  handleLastPage?: () => void;
}

export function DashboardTable({
  linkto,
  data,
  onStatusToggle,
  onAction,
  onBulkDelete,
  onTitleClick,
  getNavigationPath,
  columns = {
    title: true,
    createdTime: true,
    status: true,
    customerName: true,
    actions: true,
  },
  translationKeys = {},
  emptyMessage,
  pagination,
  handleNextPage,
  handlePreviousPage,
  handleFirstPage,
  handleLastPage,
}: DashboardTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Default translation keys
  const defaultTranslationKeys = {
    title: 'solutionDashboards.table.title',
    createdTime: 'solutionDashboards.table.createdTime',
    activateDeactivate: 'solutionDashboards.table.activateDeactivate',
    customerName: 'solutionDashboards.table.customerName',
    actions: 'solutionDashboards.table.actions',
    active: 'solutionDashboards.status.active',
    deactivate: 'solutionDashboards.status.deactivate',
    tagPrefix: 'solutionDashboards.tags',
    ...translationKeys,
  };

  const defaultEmptyMessage = emptyMessage || 'No data found';

  const handleStatusToggle = (id: string) => {
    if (onStatusToggle) {
      onStatusToggle(id);
    }
  };

  const handleAction = (
    action: 'share' | 'view' | 'delete' | 'download',
    id: string
  ) => {
    if (action === 'delete') {
      const item = data.find((d) => d.id === id);
      if (item) {
        setItemToDelete({ id: item.id, title: item.title });
        setDeleteDialogOpen(true);
      }
    } else if (onAction) {
      onAction(action, id);
    }
    if (action === 'view') {
      const path = getNavigationPath?.(id) || '';
      navigate(path);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !onAction) return;

    setIsDeleting(true);
    try {
      await onAction('delete', itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      // Error handling is done by the caller
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTitleClick = (id: string) => {
    if (getNavigationPath) {
      const path = getNavigationPath(id);
      navigate(path);
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.length > 0) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const isTitleClickable = !!(onTitleClick || getNavigationPath);
  return (
    <div className="space-y-4">
      {/* Bulk Delete Button */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:text-white">
          <span className="text-sm text-gray-600 dark:text-white">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''}{' '}
            selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkDelete}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary dark:bg-gray-800 dark:text-white">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.title && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-white dark:text-white">
                  {t(defaultTranslationKeys.title)}
                </th>
              )}
              {columns.createdTime && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-white dark:text-white">
                  {t(defaultTranslationKeys.createdTime)}
                </th>
              )}
              {columns.status && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-white dark:text-white">
                  {t(defaultTranslationKeys.activateDeactivate)}
                </th>
              )}
              {columns.customerName && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-white dark:text-white">
                  {t(defaultTranslationKeys.customerName)}
                </th>
              )}
              {columns.actions && (
                <th className="text-left py-3 px-4 text-sm font-semibold text-white dark:text-white">
                  {t(defaultTranslationKeys.actions)}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={Object.values(columns).filter(Boolean).length + 1}
                  className="py-8 px-4 text-center text-gray-500 dark:text-white"
                >
                  {defaultEmptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-dotted border-gray-200 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-white ${
                    selectedIds.includes(item.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {columns.title && (
                    <td
                      className={`py-4 px-4 ${
                        isTitleClickable
                          ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                          : ''
                      }`}
                      onClick={
                        isTitleClickable
                          ? () => handleTitleClick(item.id)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="">
                            <NavLink
                              to={`/${linkto}/${item.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {item.title}
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  {columns.createdTime && (
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-white">
                      {item.createdTime}
                    </td>
                  )}
                  {columns.status && (
                    <td className="py-4 px-4 flex items-center justify-center">
                      <Button
                        onClick={() => handleStatusToggle(item.id)}
                        className={`text-xs px-5 h-8  rounded-full ${
                          item.status === 'active'
                            ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                        }`}
                      >
                        {item.status === 'active'
                          ? t(defaultTranslationKeys.active)
                          : t(defaultTranslationKeys.deactivate)}
                      </Button>
                    </td>
                  )}
                  {columns.customerName && (
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-white">
                      {item.customerName}
                    </td>
                  )}
                  {columns.actions && (
                    <td className="py-4 px-4">
                      <div className="flex items-center ">
                        <button
                          onClick={() => handleAction('view', item.id)}
                          className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded transition-colors dark:text-white dark:hover:text-secondary dark:hover:bg-gray-800"
                          title="View"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction('delete', item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors dark:text-white dark:hover:text-red-600 dark:hover:bg-gray-800"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {pagination.totalItems !== undefined && (
              <span>
                Showing{' '}
                {(pagination.currentPage - 1) *
                  (pagination.itemsPerPage || 10) +
                  1}{' '}
                to{' '}
                {Math.min(
                  pagination.currentPage * (pagination.itemsPerPage || 10),
                  pagination.totalItems
                )}{' '}
                of {pagination.totalItems} results
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFirstPage}
              disabled={pagination.currentPage === 1}
              className="h-8 w-8"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousPage}
              disabled={pagination.currentPage === 1}
              className="h-8 w-8"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="h-8 w-8"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLastPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="h-8 w-8"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        itemName={itemToDelete?.title}
        description={
          itemToDelete?.title
            ? `Are you sure you want to delete "${itemToDelete.title}"? This action cannot be undone.`
            : 'Are you sure you want to delete this item? This action cannot be undone.'
        }
        isLoading={isDeleting}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
