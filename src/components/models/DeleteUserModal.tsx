import React from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/services/api/users.api';
import { X } from 'lucide-react';
import { Customer } from '@/features/customer/types';

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | Customer | null;
  onConfirm: () => void;
  role?: string;
  customer?: Customer | null;
  loading?: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  open,
  onOpenChange,
  user,
  onConfirm,
  role,
  loading = false,
}) => {
  if (!user) return null;

  const handleDelete = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 bg-white">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Delete User Account
            </h2>
            <p className="text-base text-gray-700">
              Are you sure you want to delete the following user?
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-2">
            {/* User Information Card */}
            <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
              <button
                onClick={handleCancel}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4 pr-8">
                <Avatar className="h-16 w-16 bg-gray-700">
                  <AvatarFallback className="text-white font-semibold">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-gray-900">
                    {user.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm capitalize text-gray-600">
                    Role: {role?.replace('_', ' ')}
                  </p>
                  {/* <p className="text-sm text-gray-600">Customer: {customer}</ p> */}
                </div>
              </div>
            </div>

            {/* Warning Section */}
            <div className="space-y-2">
              <p className="font-bold text-red-600 text-sm">Warning</p>
              <p className="text-sm text-gray-700">
                This action cannot be undone. The user will lose access to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                <li>All assigned devices and dashboards</li>
                <li>Customer data and configurations</li>
              </ul>
            </div>
          </div>
          {/* Action Buttons */}
          <DialogFooter className="flex-row justify-end gap-3 pt-4 border-t">
            <Button
              onClick={handleDelete}
              className="bg-secondary hover:bg-secondary/90 text-white"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
