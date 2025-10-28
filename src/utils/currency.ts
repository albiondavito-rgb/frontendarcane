export const formatCurrency = (amount: number): string => {
  // Asegurarse de que el monto sea un número y no NaN o Infinity
  if (typeof amount !== 'number' || !isFinite(amount)) {
    return 'Bs 0.00';
  }
  return `Bs ${amount.toFixed(2)}`;
};
