import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDeductionResponse } from "../utils/payment.js";

const COST = 100;

test("normal deduction response is preserved", () => {
  assert.deepEqual(
    normalizeDeductionResponse(
      {
        success: true,
        balance: 400,
        previousBalance: 500,
        deductedAmount: 100,
      },
      COST,
    ),
    {
      success: true,
      balance: 400,
      previousBalance: 500,
      deductedAmount: 100,
    },
  );
});

test("idempotent replay reconstructs the original previous balance", () => {
  const result = normalizeDeductionResponse(
    {
      success: true,
      alreadyProcessed: true,
      balance: 400,
    },
    COST,
  );

  assert.equal(result.previousBalance, 500);
  assert.equal(result.deductedAmount, 100);
  assert.equal(result.balance, 400);
});

test("malformed payment responses are rejected", () => {
  assert.equal(
    normalizeDeductionResponse({ success: true, alreadyProcessed: true }, COST),
    null,
  );
  assert.equal(
    normalizeDeductionResponse(
      { success: true, balance: 400, previousBalance: 500, deductedAmount: 50 },
      COST,
    ),
    null,
  );
});
