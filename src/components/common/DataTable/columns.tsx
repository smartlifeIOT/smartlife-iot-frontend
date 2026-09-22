import { ColumnDef, CellContext } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Format a date string or Date object to a readable format
 * @param date - Date string (ISO format) or Date object
 * @returns Formatted date string (e.g., "Nov 29, 2025 12:34 PM")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '-';
  }
}

// Example column definitions helper
export function createSortableColumn<T>(
  accessorKey: string,
  header: string
): ColumnDef<T> {
  return {
    accessorKey,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {header}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  };
}

/**
 * Create a sortable date column with formatted date display
 * @param accessorKey - The key to access the date field
 * @param header - Column header text
 * @returns ColumnDef with formatted date cell
 */
export function createSortableDateColumn<T>(
  accessorKey: string,
  header: string
): ColumnDef<T> {
  return {
    accessorKey,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {header}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: CellContext<T, unknown>) => {
      const dateValue = row.getValue(accessorKey) as
        | string
        | Date
        | null
        | undefined;
      return <span>{formatDate(dateValue)}</span>;
    },
  };
}

export function createActionsColumn<T>(
  onEdit?: (row: T) => void,
  onDelete?: (row: T) => void,
  headerLabel = 'Actions'
): ColumnDef<T> {
  return {
    id: 'actions',
    header: () => <span className=" font-semibold w-full block">{headerLabel}</span>,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <div className="relative">
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  className="text-success"
                  onClick={() => onEdit(row.original)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      );
    },
  };
}
