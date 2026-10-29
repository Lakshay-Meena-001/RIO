export function normalizeDeductionResponse(data, expectedAmount) {
  if (!data?.success) {
    return null;
  }

  const hasBalance = data.balance !== undefined && data.balance !== null;
  const balance = hasBalance ? Number(data.balance) : NaN;
  const hasDeductedAmount =
    data.deductedAmount !== undefined && data.deductedAmount !== null;
  const deductedAmount = hasDeductedAmount
    ? Number(data.deductedAmount)
    : expectedAmount;
  const hasPreviousBalance =
    data.previousBalance !== undefined && data.previousBalance !== null;
  const previousBalance = hasPreviousBalance
    ? Number(data.previousBalance)
    : data.alreadyProcessed === true && Number.isFinite(balance)
      ? balance + deductedAmount
      : NaN;

  if (
    !Number.isFinite(balance) ||
    balance < 0 ||
    !Number.isFinite(previousBalance) ||
    previousBalance < deductedAmount ||
    deductedAmount !== expectedAmount
  ) {
    return null;
  }

  return {
    ...data,
    previousBalance,
    deductedAmount,
    balance,
  };
}
