import { Badge } from '@/components/ui/badge';
import { TFunction } from 'i18next';

export type InvoiceStatus = 'succeeded' | 'pending' | 'failed';

export const getInvoiceStatusBadge = (
  status: InvoiceStatus | string,
  t: TFunction
) => {
  switch (status) {
    case 'succeeded':
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 capitalize">
          {t('nav.subscriptions.invoices.status.paid')}
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 capitalize">
          {t('nav.subscriptions.invoices.status.pending')}
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 capitalize">
          {t('nav.subscriptions.invoices.status.failed')}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      );
  }
};
