import React, { useMemo } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCustomerById, useCustomerUsers } from '../hooks';
import { User, UserStatus } from '@/services/api/users.api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

interface HierarchyNode {
  id: string;
  name: string;
  type: 'customer' | 'role' | 'user';
  status?: string;
  description?: string;
  stats?: string;
  children?: HierarchyNode[];
}

interface CustomerUserHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
}

const getNodeColor = (node: HierarchyNode): string => {
  if (node.type === 'customer') {
    return 'bg-purple-700 text-white';
  }
  if (node.type === 'role') {
    return 'bg-blue-600 text-white';
  }
  if (node.type === 'user') {
    if (node.status === UserStatus.ACTIVE) {
      return 'bg-green-600 text-white';
    }
    return 'bg-slate-400 text-white';
  }
  return 'bg-gray-500 text-white';
};

const CustomTreeNode: React.FC<{ node: HierarchyNode }> = ({ node }) => {
  const { t } = useTranslation();
  const hasChildren = node.children && node.children.length > 0;

  const nodeLabel = (
    <div className="flex flex-col items-center">
      <div
        className={`${getNodeColor(node)} rounded-lg px-4 py-3 shadow-md min-w-[200px] max-w-[250px] relative transition-transform hover:scale-105 duration-200`}
      >
        <div className="flex items-center gap-3">
          {node.type === 'user' && (
            <Avatar className="h-8 w-8 border-2 border-white/20">
              <AvatarFallback className="bg-white/10 text-white text-[10px]">
                {node.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col items-start gap-1 text-left">
            <div className="font-semibold text-sm line-clamp-1">
              {node.name}
            </div>
            {node.description && (
              <div className="text-[10px] opacity-90 line-clamp-1">
                {node.description}
              </div>
            )}
            {node.type === 'user' && (
              <Badge
                variant="outline"
                className="mt-1 text-[10px] h-4 bg-white/20 text-white border-white/30 w-fit"
              >
                {node.status || 'Active'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasChildren) {
    return <TreeNode label={nodeLabel} />;
  }

  return (
    <TreeNode label={nodeLabel}>
      {node.children?.map((child) => (
        <CustomTreeNode key={child.id} node={child} />
      ))}
    </TreeNode>
  );
};

export function CustomerUserHierarchyModal({
  open,
  onOpenChange,
  customerId,
}: CustomerUserHierarchyModalProps) {
  const { t } = useTranslation();
  const { data: customer, isLoading: isLoadingCustomer } =
    useCustomerById(customerId);
  const { data: usersData, isLoading: isLoadingUsers } = useCustomerUsers(
    customerId,
    {
      limit: 100, // Fetch more for hierarchy visualization
    }
  );

  const hierarchyData = useMemo(() => {
    if (!customer || !usersData?.data) return null;

    const root: HierarchyNode = {
      id: 'customer-root',
      name: customer?.data?.name || 'Customer',
      type: 'customer',
      stats: t('usersManagement.hierarchy.stats', { count: usersData?.meta?.total || usersData?.data?.length || 0 }),
      children: [],
    };

    const rolesMap = new Map<string, HierarchyNode>();

    usersData.data.forEach((user: User) => {
      const roleName = user.role || 'User';
      const formattedRoleName = roleName.replace(/_/g, ' ').toUpperCase();

      if (!rolesMap.has(roleName)) {
        const roleNode: HierarchyNode = {
          id: `role-${roleName}`,
          name: formattedRoleName,
          type: 'role',
          children: [],
        };
        rolesMap.set(roleName, roleNode);
        root.children?.push(roleNode);
      }

      rolesMap.get(roleName)?.children?.push({
        id: user.id,
        name: user.name || user.email,
        type: 'user',
        status: user.status,
        description: user.email,
      });
    });

    return root;
  }, [customer, usersData, t]);

  const isLoading = isLoadingCustomer || isLoadingUsers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-hidden flex flex-col p-0 bg-slate-50 dark:bg-gray-900 border-0 shadow-2xl">
        <DialogHeader className="p-6 bg-white dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700 shrink-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t('usersManagement.hierarchy.title')}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {customer?.data?.name
              ? t('usersManagement.hierarchy.visualRep', { name: customer.data.name })
              : t('usersManagement.hierarchy.exploreStructure')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-8 relative custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Skeleton className="h-16 w-64 rounded-xl dark:bg-gray-800" />
              <div className="flex gap-8 mt-12">
                <Skeleton className="h-12 w-48 rounded-lg dark:bg-gray-800" />
                <Skeleton className="h-12 w-48 rounded-lg dark:bg-gray-800" />
              </div>
              <div className="animate-pulse text-slate-400 dark:text-gray-500 text-sm font-medium mt-4">
                {t('usersManagement.hierarchy.refining')}
              </div>
            </div>
          ) : hierarchyData ? (
            <div className="min-w-max mx-auto pb-12">
              <style>
                {`
                  .orgchart-container {
                    padding: 2rem;
                  }
                  .orgchart-tree .lines .topLine { border-top: 2px solid #e2e8f0; }
                  .orgchart-tree .lines .leftLine { border-left: 2px solid #e2e8f0; }
                  .orgchart-tree .lines .rightLine { border-right: 2px solid #e2e8f0; }
                  .orgchart-tree .lines .downLine { background-color: #e2e8f0; height: 2px; }
                  
                  .dark .orgchart-tree .lines .topLine { border-top: 2px solid #334155; }
                  .dark .orgchart-tree .lines .leftLine { border-left: 2px solid #334155; }
                  .dark .orgchart-tree .lines .rightLine { border-right: 2px solid #334155; }
                  .dark .orgchart-tree .lines .downLine { background-color: #334155; }

                  .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                  
                  .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
                `}
              </style>
              <div className="orgchart-tree">
                <Tree
                  label={
                    <div className="flex flex-col items-center">
                      <div
                        className={`${getNodeColor(hierarchyData)} rounded-lg px-6 py-4 shadow-xl border-2 border-white/20 min-w-[220px] max-w-[280px] drop-shadow-md`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-bold text-base tracking-tight">
                            {hierarchyData.name}
                          </div>
                          <div className="text-[10px] font-medium opacity-75 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded mt-1">
                            {t('usersManagement.hierarchy.orgRoot')}
                          </div>
                          <div className="text-[11px] font-medium mt-2 py-1 px-3 bg-white/20 rounded-full">
                            {hierarchyData.stats}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  {hierarchyData.children?.map((child) => (
                    <CustomTreeNode key={child.id} node={child} />
                  ))}
                </Tree>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-500">
              <div className="text-lg font-medium">
                {t('usersManagement.hierarchy.noData')}
              </div>
              <div className="text-sm">
                {t('usersManagement.hierarchy.ensureUsers')}
              </div>
            </div>
          )}
        </div>

        {/* Legend / Info Footer */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-slate-100 dark:border-gray-700 shrink-0 flex items-center justify-center gap-8 text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-700" /> {t('usersManagement.hierarchy.legend.org')}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-600" /> {t('usersManagement.hierarchy.legend.role')}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-600" /> {t('usersManagement.hierarchy.legend.active')}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-400" /> {t('usersManagement.hierarchy.legend.inactive')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
