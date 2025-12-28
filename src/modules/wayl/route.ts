import Elysia, { t } from "elysia";
import authPlugin from "@/plugins/auth-plugin";
import ApiError from "@/lib/global-error";
import { waylCreatePaymentLinkService } from "./service";
import Response from "@/lib/global-response";
import { waylPaymentLinkResponseSchema } from "./schemas/res";

const waylRoutes = new Elysia({ prefix: "/wayl", tags: ["Wayl"] })
  .use(authPlugin)
  .post(
    "/upgrade-plan",
    async ({ user, body }) => {
      if (user.role !== "USER") {
        throw new ApiError("Unauthorized", 401);
      }

      if (user.plan === body.plan) {
        throw new ApiError("You are already on this plan", 400);
      }

      const paymentLink = await waylCreatePaymentLinkService(
        user.id,
        body.plan,
        user.waylCustomerId
      );

      return {
        success: true as const,
        data: {
          paymentLink,
          plan: body.plan,
        },
        message: "Payment link created successfully",
      };
    },
    {
      body: t.Object({
        plan: t.Union([
          t.Literal("BASIC"),
          t.Literal("PRO"),
          t.Literal("ENTERPRISE"),
        ]),
      }),
      response: Response(waylPaymentLinkResponseSchema),
      detail: {
        summary: "Create payment link for plan upgrade",
        description:
          "Creates a payment link for upgrading the user's plan. Returns the payment link URL that the user can use to complete the payment.",
        tags: ["Wayl"],
      },
    }
  );

export default waylRoutes;
