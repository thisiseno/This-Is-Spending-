export const formatIDR = (amount: number): string => {
  const currency = localStorage.getItem('app_currency') || 'IDR';
  
  // We use the raw amount without conversion as requested.
  // If the user switches to USD, 10000 IDR becomes $10,000.00
  
  // IDR usually doesn't show decimals, others usually do.
  const isIDR = currency === 'IDR';

  // Use 'en-US' as a fallback locale for generic formatting (comma separators), 
  // but 'id-ID' for IDR to keep the dot separators common in Indonesia.
  const locale = isIDR ? 'id-ID' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: isIDR ? 0 : 2,
    maximumFractionDigits: isIDR ? 0 : 2,
  }).format(amount);
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'long' });
};

export const generateId = (): number => {
  return Math.floor(Math.random() * 1000000000);
};

export const getDaysRemaining = (dateString?: string): string => {
  if (!dateString) return '';
  const target = new Date(dateString);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due Today';
  return `${diffDays} days left`;
};