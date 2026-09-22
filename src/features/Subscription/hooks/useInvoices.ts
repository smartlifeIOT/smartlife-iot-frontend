import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionsApi } from '@/features/Subscription/services/subscriptions.api';
import { toast } from 'react-hot-toast';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  plan: 'starter' | 'professional' | string;
  billingPeriod: 'monthly' | 'yearly' | string;
  invoiceUrl?: string;
  receiptUrl?: string;
  method: string;
  provider: string;
  failureReason: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InvoiceData {
  data: Invoice[];
  meta: PaginationMeta;
}

export interface InvoiceResponse {
  success: boolean;
  data: InvoiceData;
  timestamp: string;
}

export const useSubscriptionInvoices = (
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['invoices', page, limit],
    queryFn: async () => {
      const response = await subscriptionsApi.getSubscriptionInvoices(
        page,
        limit
      );
      return response.data.data as InvoiceData;
    },
  });
};

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async ({
      invoiceId,
      invoiceNumber,
    }: {
      invoiceId: string;
      invoiceNumber: string;
    }) => {
      const response = await subscriptionsApi.getInvoicePdf(invoiceId);

      // response.data is the blob since we set responseType: 'blob' in the api
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    },
    onSuccess: () => {
      toast.success('Invoice downloaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    },
  });
};
