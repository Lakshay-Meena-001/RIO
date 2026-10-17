import { Router } from "express";
import express from "express";

import { receiveRazorpayWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post(
  "/",
  express.raw({
    type: "application/json",
    limit: "100kb",
  }),
  receiveRazorpayWebhook,
);

export default router;
