export function formatMoney(n) {
  if (typeof n !== "number") return n;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  } catch {
    // Fallback if locale/currency not available
    return `$${n.toFixed(2)}`;
  }
}
