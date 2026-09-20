export function formatINR(val: number | null | undefined, decimals: number = 0): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatNumber(val: number | null | undefined, decimals: number = 0): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatBps(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)} bps`;
}

export function formatPct(val: number | null | undefined, decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(decimals)}%`;
}
