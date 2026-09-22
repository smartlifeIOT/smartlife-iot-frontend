import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/common/Pagination';
import { useCustomerUsers } from '@/features/customer/hooks';
import { UserStatus } from '@/services/api/users.api';
import { Button } from '@/components/ui/button';
import { CustomerUserHierarchyModal } from './CustomerUserHierarchyModal';
import { useTranslation } from 'react-i18next';

type CustomerUsersListProps = {
  customerId?: string;
  searchQuery?: string;
  title?: string;
};

const CustomerUsersList = ({
  customerId,
  searchQuery = '',
  title,
}: CustomerUsersListProps) => {
  const { t } = useTranslation();
  const [isHierarchical, setIsHierarchical] = useState(false);
  const params = useParams<{ customerId?: string; id?: string }>();
  const resolvedCustomerId = customerId || params.customerId || params.id;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: usersData, isLoading } = useCustomerUsers(resolvedCustomerId, {
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
  });

  const users = useMemo(() => usersData?.data || [], [usersData]);
  const totalPages = usersData?.meta?.totalPages || 1;
  const totalItems = usersData?.meta?.total || users.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (!resolvedCustomerId) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-400">
          {t('usersManagement.customer_users_list.selectCustomer')}
        </CardContent>
      </Card>
    );
  }
  const handleHierarchyModal = () => {
    setIsHierarchical(!isHierarchical);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title || t('usersManagement.customer_users_list.title')}
        </h3>
        <Button 
          variant="outline" 
          onClick={handleHierarchyModal}
          className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t('usersManagement.customer_users_list.displayHierarchical')}
        </Button>
      </div>
      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full dark:bg-gray-700" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-3">
                <AvatarFallback className="bg-transparent text-gray-400">
                  ?
                </AvatarFallback>
              </div>
              {t('usersManagement.customer_users_list.noUsers')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">
                      {t('usersManagement.customer_users_list.table.user')}
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">
                      {t('usersManagement.customer_users_list.table.email')}
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">
                      {t('usersManagement.customer_users_list.table.role')}
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">
                      {t('usersManagement.customer_users_list.table.status')}
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">
                      {t('usersManagement.customer_users_list.table.created')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 border-gray-100 dark:border-gray-700"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                            <AvatarFallback className="bg-secondary/10 dark:bg-secondary/20 text-secondary-foreground dark:text-secondary text-xs font-bold">
                              {user.name?.[0]?.toUpperCase() ||
                                user.email?.[0]?.toUpperCase() ||
                                'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              {user.name || '—'}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              ID: {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300">{user.email}</TableCell>
                      <TableCell className="capitalize text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {user.role?.replace('_', ' ') || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === UserStatus.ACTIVE
                              ? 'success'
                              : 'secondary'
                          }
                          className="capitalize px-2 py-0.5"
                        >
                          {user.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {resolvedCustomerId && (
        <CustomerUserHierarchyModal
          open={isHierarchical}
          onOpenChange={setIsHierarchical}
          customerId={resolvedCustomerId}
        />
      )}
    </div>
  );
};

export default CustomerUsersList;
