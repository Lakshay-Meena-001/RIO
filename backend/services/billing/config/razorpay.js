import Razorpay from "razorpay";

let razorpayClient;

export const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay configuration is missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
};

export const getRazorpayKeyId = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();

  if (!keyId) {
    throw new Error("RAZORPAY_KEY_ID is missing.");
  }

  return keyId;
};
