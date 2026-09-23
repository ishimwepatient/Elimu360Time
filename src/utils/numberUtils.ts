/**
 * Utility functions for parsing, cleaning, and formatting monetary and numerical values
 * Accepts standard integers, strings with commas (100,000), spaces (100 000), currency prefixes, etc.
 */

export function parseCleanNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  // Remove commas, whitespace, and currency codes
  const cleaned = val
    .toString()
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .replace(/RWF|USD|UGX|KES/gi, '')
    .trim();
    
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatRWF(val: string | number | undefined | null): string {
  const num = parseCleanNumber(val);
  return `RWF ${num.toLocaleString()}`;
}
