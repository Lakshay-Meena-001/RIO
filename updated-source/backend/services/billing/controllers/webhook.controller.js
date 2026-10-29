import crypto from "node:crypto";

import PaymentEvent from "../models/payment-event.model.js";
import { processRazorpayWebhookEvent } from "../services/webhook.service.js";
import AppError from "../utils/AppError.js";

const WEBHOOK_PROCESSING_TIMEOUT_MS = 2 * 60 * 1000;

const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (
    !Buffer.isBuffer(rawBody) ||
    typeof signature !== "string" ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  const receivedSignature = Buffer.from(signature, "hex");

  return (
    receivedSignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(expectedSignature, receivedSignature)
  );
};

export const receiveRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

    if (!webhookSecret) {
      throw new AppError(
        "Razorpay webhook verification is not configured",
        500,
        "WEBHOOK_CONFIGURATION_ERROR",
      );
    }

    const signature = req.get("x-razorpay-signature");
    const eventId = req.get("x-razorpay-event-id");

    if (
      typeof eventId !== "string" ||
      eventId.trim().length === 0 ||
      eventId.length > 200
    ) {
      throw new AppError(
        "A valid Razorpay event ID is required",
        400,
        "INVALID_WEBHOOK_EVENT_ID",
      );
    }

    const rawBody = req.body;

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return res.status(401).json({
        success: false,
        code: "INVALID_WEBHOOK_SIGNATURE",
        message: "Webhook signature verification failed",
      });
    }

    let event;

    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      throw new AppError(
        "Webhook payload is not valid JSON",
        400,
        "INVALID_WEBHOOK_PAYLOAD",
      );
    }

    if (!event || typeof event.event !== "string" || event.event.length > 100) {
      throw new AppError(
        "Webhook event type is invalid",
        400,
        "INVALID_WEBHOOK_EVENT",
      );
    }

    let eventRecord;

    try {
      eventRecord = await PaymentEvent.create({
        provider: "razorpay",
        providerEventId: eventId,
        eventType: event.event,
        processingStatus: "received",
      });
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }

      // Event already exists. Check whether it was processed,
      // is currently processing, or needs a retry.
      eventRecord = await PaymentEvent.findOne({
        provider: "razorpay",
        providerEventId: eventId,
      });

      if (!eventRecord) {
        throw new AppError(
          "Could not retrieve the existing webhook event",
          503,
          "WEBHOOK_EVENT_LOOKUP_FAILED",
        );
      }

      if (eventRecord.processingStatus === "processed") {
        return res.status(200).json({
          success: true,
          message: "Webhook event already processed",
        });
      }

      if (eventRecord.processingStatus === "processing") {
        const processingIsRecent =
          eventRecord.updatedAt &&
          Date.now() - new Date(eventRecord.updatedAt).getTime() <
            WEBHOOK_PROCESSING_TIMEOUT_MS;

        if (processingIsRecent) {
          // Ask the provider to retry instead of acknowledging an
          // event that may never finish if the service has crashed.
          return res.status(503).json({
            success: false,
            code: "WEBHOOK_EVENT_PROCESSING",
            message: "Webhook event is still being processed; retry later",
          });
        }
      }
    }

    // Atomic claim: only one request can process this event at a time.
    const claimedEvent = await PaymentEvent.findOneAndUpdate(
      {
        _id: eventRecord._id,
        $or: [
          { processingStatus: { $in: ["received", "failed"] } },
          {
            processingStatus: "processing",
            updatedAt: {
              $lte: new Date(Date.now() - WEBHOOK_PROCESSING_TIMEOUT_MS),
            },
          },
        ],
      },
      {
        $set: {
          processingStatus: "processing",
          lastErrorCode: null,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!claimedEvent) {
      const latestEvent = await PaymentEvent.findById(eventRecord._id);

      if (latestEvent?.processingStatus === "processed") {
        return res.status(200).json({
          success: true,
          message: "Webhook event already processed",
        });
      }

      return res.status(503).json({
        success: false,
        code: "WEBHOOK_EVENT_PROCESSING",
        message: "Webhook event could not be claimed; retry later",
      });
    }

    await processRazorpayWebhookEvent({
      eventRecord: claimedEvent,
      event,
    });

    return res.status(200).json({
      success: true,
      message: "Webhook event processed",
    });
  } catch (error) {
    // A non-2xx response allows the provider to retry eligible failures.
    next(error);
  }
};
