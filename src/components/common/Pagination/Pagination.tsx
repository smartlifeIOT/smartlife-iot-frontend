import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showItemsInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages = 0,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showItemsInfo = true,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {showItemsInfo && totalItems !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {t('pagination.showing') || 'Showing'} {startItem}{' '}
            {t('pagination.to') || 'to'} {endItem} {t('pagination.of') || 'of'}{' '}
            {totalItems} {t('pagination.results') || 'results'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
          aria-label={t('pagination.firstPage') || 'First page'}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
          aria-label={t('pagination.previousPage') || 'Previous page'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.page') || 'Page'} {currentPage}{' '}
            {t('pagination.of') || 'of'} {totalPages}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
          aria-label={t('pagination.nextPage') || 'Next page'}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
          aria-label={t('pagination.lastPage') || 'Last page'}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
