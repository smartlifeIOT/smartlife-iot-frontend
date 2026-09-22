export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatUSD = (amount: number): string => {
  return formatCurrency(amount, 'USD');
};

export const formatEUR = (amount: number): string => {
  return formatCurrency(amount, 'EUR');
};

export const formatGBP = (amount: number): string => {
  return formatCurrency(amount, 'GBP');
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
};

export const formatPrice = (price: number, currency = 'USD'): string => {
  return formatCurrency(price, currency);
};

export const formatDiscount = (originalPrice: number, discountedPrice: number): string => {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return `${discount.toFixed(0)}% off`;
};