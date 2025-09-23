// src/utils/currency.ts
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to EUR (base currency)
}

export const currencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.17 }, // Updated from 1.08
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 66.47 }, // Updated from 60.50
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 8.35 }, // Updated from 7.85
  { code: 'KRW', name: 'Korean Won', symbol: '₩', rate: 1624.71 }, // Updated from 1450.25
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 95.21 }, // Updated from 98.50
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.505 }, // Updated from 1.45
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.787 } // Updated from 1.65
];

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
  const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
  
  // Convert to EUR first (base currency), then to target currency
  const eurAmount = amount / fromRate;
  return eurAmount * toRate;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) return `${amount.toFixed(2)}`;
  
  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency?.symbol || '€';
};
