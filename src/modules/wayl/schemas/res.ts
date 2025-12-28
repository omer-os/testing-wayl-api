import { t } from "elysia";

export const waylPaymentLinkResponseSchema = t.Object({
  paymentLink: t.String({
    description: "The payment link URL",
  }),
  plan: t.Union([
    t.Literal("BASIC"),
    t.Literal("PRO"),
    t.Literal("ENTERPRISE"),
  ]),
});
