import AppError from "../utils/AppError.js";

const REQUEST_TIMEOUT_MS = 10_000;

export const creditUserBalance = async ({ userId, transactionId, amount }) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL?.trim();
  const internalSecret = process.env.AUTH_INTERNAL_SECRET?.trim();

  if (!authServiceUrl || !internalSecret) {
    throw new AppError(
      "Auth Service integration is not configured",
      500,
      "AUTH_SERVICE_CONFIGURATION_ERROR",
    );
  }

  if (
    typeof userId !== "string" ||
    !/^[a-f\d]{24}$/i.test(userId) ||
    typeof transactionId !== "string" ||
    transactionId.trim().length === 0 ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new AppError(
      "Invalid balance credit request",
      400,
      "INVALID_BALANCE_CREDIT_REQUEST",
    );
  }

  const endpoint = new URL("/internal/credit-balance", authServiceUrl);

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-service-secret": internalSecret,
        "x-user-id": userId,
      },
      body: JSON.stringify({
        transactionId,
        amount,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    // A timeout does not prove the credit failed. Auth Service may
    // have processed it before the response was lost.
    throw new AppError(
      "Could not confirm the balance credit result",
      503,
      "BALANCE_CREDIT_RESULT_UNKNOWN",
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new AppError(
      "Auth Service returned an invalid response",
      502,
      "INVALID_AUTH_SERVICE_RESPONSE",
    );
  }

  if (!response.ok || result?.success !== true) {
    throw new AppError(
      "Auth Service could not complete the balance credit",
      502,
      "BALANCE_CREDIT_FAILED",
    );
  }

  return result;
};
