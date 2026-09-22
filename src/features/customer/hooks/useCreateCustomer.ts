import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { customerService } from '../services/customerService';
import type { CreateCustomerData } from '../types';

export const useCreateCustomer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      return customerService.createCustomer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
      navigate('/users-management', { state: { tab: 'Customers' } });
      // invalidate users query
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create customer';
      toast.error(errorMessage);
    },
  });
};
