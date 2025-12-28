import ApiError from "@/lib/global-error";
import db from "@/lib/db";

const WAYL_API_BASE_URL =
  Bun.env.WAYL_API_BASE_URL || "https://api.thewayl.com/v1";

type Plan = "BASIC" | "PRO" | "ENTERPRISE";

interface WaylPaymentLinkResponse {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: string;
}

export const waylCreatePaymentLinkService = async (
  userId: string,
  plan: Plan,
  waylCustomerId: string | null
): Promise<string> => {
  const planPricing: Record<Plan, number> = {
    BASIC: 1000,
    PRO: 2900,
    ENTERPRISE: 9900,
  };

  const amount = planPricing[plan];

  let customerId = waylCustomerId;

  if (!customerId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const customerResponse = await fetch(`${WAYL_API_BASE_URL}/customers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Bun.env.WAYL_API_KEY}`,
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
        }),
      }
    );

    if (!customerResponse.ok) {
      const error = await customerResponse.json().catch(() => ({}));
      throw new ApiError(
        `Failed to create customer: ${error.message || customerResponse.statusText}`,
        500
      );
    }

    const customerData = await customerResponse.json();
    customerId = customerData.id;

    await db.user.update({
      where: { id: userId },
      data: { waylCustomerId: customerId },
    });
  }

  const paymentLinkResponse = await fetch(`${WAYL_API_BASE_URL}/payment-links`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Bun.env.WAYL_API_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: "USD",
        customer: customerId,
        description: `Upgrade to ${plan} plan`,
        metadata: {
          userId,
          plan,
          type: "plan_upgrade",
        },
      }),
    }
  );

  if (!paymentLinkResponse.ok) {
    const error = await paymentLinkResponse.json().catch(() => ({}));
    throw new ApiError(
      `Failed to create payment link: ${error.message || paymentLinkResponse.statusText}`,
      500
    );
  }

  const paymentLinkData: WaylPaymentLinkResponse =
    await paymentLinkResponse.json();

  return paymentLinkData.url;
};

