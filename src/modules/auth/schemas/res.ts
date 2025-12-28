import { t } from "elysia";

export const authRegisterResponseSchema = t.Object({
  id: t.String(),
  email: t.String(),
  name: t.String(),
  role: t.Union([t.Literal("ADMIN"), t.Literal("USER")]),
  plan: t.Union([
    t.Literal("FREE"),
    t.Literal("BASIC"),
    t.Literal("PRO"),
    t.Literal("ENTERPRISE"),
  ]),
  waylCustomerId: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const authLoginResponseSchema = t.Object({
  accessToken: t.String(),
  refreshToken: t.String(),
});

export const userProfileResponseSchema = t.Object({
  id: t.String(),
  email: t.String(),
  name: t.String(),
  role: t.Union([t.Literal("ADMIN"), t.Literal("USER")]),
  plan: t.Union([
    t.Literal("FREE"),
    t.Literal("BASIC"),
    t.Literal("PRO"),
    t.Literal("ENTERPRISE"),
  ]),
  waylCustomerId: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
