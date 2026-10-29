export const BILLING_PLANS = Object.freeze({
  starter: Object.freeze({
    id: "starter",
    name: "Starter",
    amount: 19900,
    currency: "INR",
    balanceCredit: 300,
    active: true,
  }),
});

export const getActiveBillingPlan = (planId) => {
  const plan = BILLING_PLANS[planId];

  if (!plan || !plan.active) {
    return null;
  }

  return plan;
};