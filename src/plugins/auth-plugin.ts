import db from "@/lib/db";
import ApiError from "@/lib/global-error";
import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";

export const authPlugin = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: Bun.env.JWT_SECRET!,
        schema: t.Object({
          sub: t.String(),
          role: t.Union([t.Literal("ADMIN"), t.Literal("USER")]),
        }),
        exp: "1h",
      })
    )
    .derive(async ({ jwt, cookie: { accessToken } }) => {
      const token = accessToken.value;

      if (!token) {
        throw new ApiError("Unauthorized", 401);
      }

      const payload = await jwt.verify(token.toString());
      if (!payload) {
        throw new ApiError("Invalid or expired token", 401);
      }

      const user = await db.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          waylCustomerId: true,
          createdAt: true,
          updatedAt: true,
        } as any,
      });

      if (!user) {
        throw new ApiError("User not found", 401);
      }

      return {
        user,
      };
    });

export default authPlugin;
