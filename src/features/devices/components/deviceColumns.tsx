import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ArrowDown, ArrowUp, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import type { Device } from '@/services/api/devices.api';

// Extended device type to include additional fields from API response
export interface DeviceTableRow extends Device {
  deviceProfile?: string;
  label: string;
  customerName?: string;
  groups?: string[];
  isGateway?: boolean;
}

interface DeviceColumnsProps {
  onDelete?: (deviceId: string) => void;
}

export const createDeviceColumns = (props?: DeviceColumnsProps): ColumnDef<DeviceTableRow>[] => [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 hover:bg-transparent"
        >
          Created time
          {isSorted === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : isSorted === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return <div className="text-sm">{format(new Date(date), 'yyyy-MM-dd HH:mm:ss')}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('name')}</div>;
    },
  },
  {
    accessorKey: 'deviceProfile',
    header: 'Device profile',
    cell: ({ row }) => {
      const profile = row.getValue('deviceProfile') as string | undefined;
      return <div className="text-sm">{profile || '-'}</div>;
    },
  },
  {
    accessorKey: 'label',
    header: 'Label',
    cell: ({ row }) => {
      const label = row.getValue('label') as string | undefined;
      return <div className="text-sm">{label || '-'}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'State',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isActive = status === 'online' || status === 'idle';
      return (
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </div>
      );
    },
  },
  {
    accessorKey: 'customerName',
    header: 'Customer name',
    cell: ({ row }) => {
      const customerName = row.getValue('customerName') as string | undefined;
      return <div className="text-sm">{customerName || '-'}</div>;
    },
  },
  {
    accessorKey: 'groups',
    header: 'Groups',
    cell: ({ row }) => {
      const groups = row.getValue('groups') as string[] | undefined;
      if (!groups || groups.length === 0) {
        return <div className="text-sm">-</div>;
      }
      return (
        <div className="flex gap-1 flex-wrap">
          {groups.map((group, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-700"
            >
              {group}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: 'isGateway',
    header: 'Is gateway',
    cell: ({ row }) => {
      const isGateway = row.original.isGateway || false;
      return (
        <div className="flex items-center gap-2">
          <Checkbox checked={isGateway} disabled className="cursor-default" />
          <Shield className="h-4 w-4 text-gray-400" />
          <button
            onClick={() => {
              if (props?.onDelete) {
                props.onDelete(row.original.id);
              }
            }}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete device"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];

// Default export for backward compatibility
export const deviceColumns = createDeviceColumns();

