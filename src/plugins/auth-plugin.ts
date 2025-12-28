import db from "../lib/db";

import { verifyToken } from "@clerk/backend";
import Elysia from "elysia";
import clerkClient from "../lib/clerck";

export const authPlugin = new Elysia()
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return { user: null };
    }

    try {
      const verified = await verifyToken(token, {
        secretKey: Bun.env.CLERK_SECRET_KEY as string,
      });

      let user = await db.user.findUnique({
        where: { clerkId: verified.sub },
      });

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(verified.sub);
        const primaryEmail = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;

        if (primaryEmail) {
          user = await db.user.create({
            data: {
              clerkId: verified.sub,
              email: primaryEmail,
              plan: "FREE",
            },
          });
        }
      }

      return { user };
    } catch (err) {
      return { user: null };
    }
  });