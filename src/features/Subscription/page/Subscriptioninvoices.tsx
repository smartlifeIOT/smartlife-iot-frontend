import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { FileText, Download, ExternalLink, CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  LoadingOverlay,
  LoadingSpinner,
} from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getErrorMessage } from '@/utils/helpers/apiErrorHandler';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import {
  useSubscriptionInvoices,
  useDownloadInvoice,
} from '@/features/Subscription/hooks';

import { getInvoiceStatusBadge } from '@/utils/helpers/badgeHelpers';

export default function Subscriptioninvoices() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: invoicesData,
    isLoading,
    isError,
    error,
  } = useSubscriptionInvoices(page, limit);

  const {
    mutate: downloadInvoice,
    isPending: isDownloading,
    variables,
  } = useDownloadInvoice();

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    return (
      <ErrorMessage
        message={
          getErrorMessage(error) || t('nav.subscriptions.invoices.failedToLoad')
        }
      />
    );
  }

  const invoices = invoicesData?.data || [];
  const meta = invoicesData?.meta;

  return (
    <div className=" ">
      <PageHeader
        title={t('nav.subscriptions.invoices.title')}
        description={t('nav.subscriptions.invoices.subtitle')}
        className="mb-4"
      />
      <Card className=" overflow-hidden">
        <CardHeader className="bg-white dark:bg-gray-900  ">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{t('nav.invoices')}</CardTitle>
          </div>
          <CardDescription>
            {t('nav.subscriptions.invoices.found', {
              count: meta?.totalItems || 0,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary   text-white">
                <TableRow className="hover:bg-primary ">
                  <TableHead className="w-[150px]">
                    {t('nav.subscriptions.invoices.table.number')}
                  </TableHead>
                  <TableHead>
                    {t('nav.subscriptions.invoices.table.plan')}
                  </TableHead>
                  <TableHead>
                    {t('nav.subscriptions.invoices.table.date')}
                  </TableHead>
                  <TableHead>
                    {t('nav.subscriptions.invoices.table.amount')}
                  </TableHead>
                  <TableHead>
                    {t('nav.subscriptions.invoices.table.status')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('nav.subscriptions.invoices.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="capitalize font-medium">
                            {invoice.plan}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {invoice.billingPeriod}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: invoice.currency || 'USD',
                        }).format(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        {getInvoiceStatusBadge(invoice.status, t)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-primary"
                            onClick={() =>
                              downloadInvoice({
                                invoiceId: invoice.id,
                                invoiceNumber: invoice.invoiceNumber,
                              })
                            }
                            disabled={
                              isDownloading &&
                              variables?.invoiceId === invoice.id
                            }
                          >
                            {isDownloading &&
                            variables?.invoiceId === invoice.id ? (
                              <LoadingSpinner />
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                {t(
                                  'nav.subscriptions.invoices.actions.downloadInvoice'
                                )}
                              </>
                            )}
                          </Button>
                          {invoice.receiptUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-2 text-secondary"
                            >
                              <a
                                href={invoice.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                {t(
                                  'nav.subscriptions.invoices.actions.downloadReceipt'
                                )}
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                        <p>{t('nav.subscriptions.invoices.noHistory')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 pb-4">
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                itemsPerPage={limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
