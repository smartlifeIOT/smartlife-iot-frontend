import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/services/api/customers.api.ts';
import type { CreateCustomerData, CustomerQuery } from '../types';

type CustomerUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

/**
 * Hook to fetch all customers
 */
export const useCustomers = (params?: CustomerQuery) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const res = await customersApi.getAll(params);
      return res.data.data;
    },
  });
};

// get customer by id
export const useCustomerById = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ['customers', customerId],
    queryFn: async () => {
      const res = await customersApi.getById(customerId!);
      return res.data.data;
    },
    enabled: !!customerId,
  });
};

export const useCustomerUsers = (
  customerId: string | undefined,
  params?: CustomerUsersQuery
) => {
  return useQuery({
    queryKey: ['customer-users', customerId, params],
    queryFn: async () => {
      const res = await customersApi.getUsersByCustomer(customerId!, params);
      return res.data.data;
    },
    enabled: !!customerId,
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Partial<CreateCustomerData>;
    }) => customersApi.update(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => customersApi.delete(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
// get customers by the tenant id
export const useCustomersByTenantId = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.getByTenant();
      return res.data.data;
    },
  });
};
//get customer tenant
export const useCustomerTenant = () => {
  return useQuery({
    queryKey: ['customer-tenant'],
    queryFn: async () => {
      const res = await customersApi.getByTenant();
      return res.data.data;
    },
  });
};
