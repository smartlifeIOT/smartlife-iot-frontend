import { Trash2, Eye, ChartNetwork } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { DeleteUserModal } from '@/components/models/DeleteUserModal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCustomers } from '@/features/customer/hooks';
import { Customer } from '@/features/customer/types';
import { useNavigate } from 'react-router-dom';
import { useDeleteCustomer } from '@/features/customer/hooks/useCustomers';
import { toast } from 'react-hot-toast';
import { User } from '@/services/api/users.api';
import { Pagination } from '@/components/common/Pagination';
import { useTranslation } from 'react-i18next';

const CustomerPage = ({ searchQuery }: { searchQuery: string }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data: customersData } = useCustomers({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
  });
  const customers = customersData?.data || [];
  const totalPages = customersData?.meta?.totalPages || 1;
  const totalItems = customersData?.meta?.total || customers.length;
  const deleteCustomerMutation = useDeleteCustomer();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCustomer) {
      deleteCustomerMutation.mutate(selectedCustomer.id, {
        onSuccess: () => {
          toast.success(
            t('usersManagement.customers_tab.toasts.deleteSuccess')
          );
          setSelectedCustomer(null);
          setDeleteModalOpen(false);
        },
        onError: () => {
          toast.error(t('usersManagement.customers_tab.toasts.deleteError'));
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {t('usersManagement.customers_tab.title')}
      </h2>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className=" uppercase ">
                    <TableHead className=" ">
                      {t('usersManagement.common.customer') || 'Customer'}
                    </TableHead>
                    <TableHead className=" ">
                      {t('usersManagement.common.status')}
                    </TableHead>
                    <TableHead className=" ">
                      {t('usersManagement.common.created')}
                    </TableHead>
                    <TableHead className=" text-end ">
                      {t('usersManagement.common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        {t('usersManagement.customers_tab.noCustomers')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers?.map((customer: Customer) => (
                      <TableRow
                        key={customer.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 border-gray-100 dark:border-gray-700"
                      >
                        <TableCell className="ps-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                              <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs">
                                {customer.name?.[0]?.toUpperCase() || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {customer.name}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              customer.status === 'active'
                                ? 'success'
                                : 'destructive'
                            }
                            className="capitalize px-2 py-0.5"
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right pe-4">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-secondary hover:bg-secondary/10"
                                  onClick={() =>
                                    navigate(
                                      `/users-management/assign-users/${customer.id}`
                                    )
                                  }
                                >
                                  <ChartNetwork className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t(
                                  'usersManagement.customers_tab.tooltips.assign'
                                )}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-primary hover:bg-primary/10"
                                  onClick={() =>
                                    navigate(
                                      `/users-management/customer/${customer.id}`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t(
                                  'usersManagement.customers_tab.tooltips.view'
                                )}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => handleDeleteClick(customer)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t(
                                  'usersManagement.customers_tab.tooltips.delete'
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        </CardContent>
      </Card>

      {/* Delete User Modal */}
      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={selectedCustomer as User | null}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default CustomerPage;
