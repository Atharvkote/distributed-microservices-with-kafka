const currency = import.meta.env.VITE_DEFAULT_CURRENCY || 'INR';

const fmt = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number) {
  return fmt.format(amount);
}
