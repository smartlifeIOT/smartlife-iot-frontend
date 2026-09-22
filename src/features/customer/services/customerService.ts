import { customersApi } from '@/services/api/customers.api.ts';
import type { Customer, CreateCustomerData } from '@/features/customer/types';

/**
 * Customer Feature Service
 * Handles business logic for customer management
 */
export const customerService = {
  /**
   * Create customer with validation
   */
  async createCustomer(data: CreateCustomerData) {
    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      throw new Error('Customer name, email, and phone number are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    const response = await customersApi.create(data);
    return response.data.data;
  },

  /**
   * Get customer with related data
   */
  async getCustomerComplete(customerId: string) {
    const customer = await customersApi.getById(customerId);
    return customer.data.data;
  },

  /**
   * Update customer with validation
   */
  async updateCustomer(customerId: string, data: Partial<CreateCustomerData>) {
    // If email is being updated, validate it
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
    }

    const response = await customersApi.update(customerId, data);
    return response.data.data;
  },

  /**
   * Delete customer with confirmation
   */
  async deleteCustomer(customerId: string) {
    await customersApi.delete(customerId);
    return { success: true, customerId };
  },

  /**
   * Change customer status
   */
  async changeStatus(
    customerId: string,
    status: 'activate' | 'deactivate' | 'suspend'
  ) {
    switch (status) {
      case 'activate':
        return customersApi.activate(customerId);
      case 'deactivate':
        return customersApi.deactivate(customerId);
      case 'suspend':
        return customersApi.suspend(customerId);
      default:
        throw new Error(`Unknown status: ${status}`);
    }
  },
};
