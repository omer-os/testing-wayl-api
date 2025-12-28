import Elysia, { t } from "elysia";
import {
  authLoginBodySchema,
  authRegisterBodySchema,
  authUpdateProfileBodySchema,
} from "./schemas/req";
import {
  authLoginService,
  authRegisterService,
  authGetCurrentUserService,
  authUpdateProfileService,
  authLoginResponse,
  authRefreshTokenResponse,
  authLogoutResponse,
} from "./service";
import {
  authLoginDocs,
  authRegisterDocs,
  authRefreshTokenDocs,
  authGetProfileDocs,
  authLogoutDocs,
  authUpdateProfileDocs,
} from "./doc";
import jwt from "@elysiajs/jwt";
import Response from "@/lib/global-response";
import {
  authLoginResponseSchema,
  authRegisterResponseSchema,
  userProfileResponseSchema,
} from "./schemas/res";
import ApiError from "@/lib/global-error";
import authPlugin from "@/plugins/auth-plugin";
import cookie from "@elysiajs/cookie";

const isDev = !Bun.env.NODE_ENV || Bun.env.NODE_ENV === "development";

const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: !isDev,
  maxAge,
  sameSite: isDev ? ("lax" as const) : ("none" as const),
});

const jwtSchema = t.Object({
  sub: t.String(),
  role: t.Union([t.Literal("ADMIN"), t.Literal("USER")]),
});

const authRoutes = new Elysia({ prefix: "/auth", tags: ["Auth"] })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
      schema: jwtSchema,
      exp: "1h",
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: Bun.env.JWT_SECRET!,
      schema: jwtSchema,
      exp: "7d",
    })
  )
  .post(
    "/register",
    async ({ body }) => {
      return await authRegisterService(body);
    },
    {
      body: authRegisterBodySchema,
      detail: authRegisterDocs,
      response: Response(authRegisterResponseSchema),
    }
  )
  .post(
    "/login",
    async ({
      body,
      jwt,
      refreshJwt,
      cookie: { accessToken, refreshToken },
    }) => {
      const user = await authLoginService(body);

      const accessVal = await jwt.sign({ sub: user.id, role: user.role });
      const refreshVal = await refreshJwt.sign({
        sub: user.id,
        role: user.role,
      });

      accessToken.set({
        value: accessVal,
        ...getCookieOptions(60 * 60),
      });

      refreshToken.set({
        value: refreshVal,
        ...getCookieOptions(7 * 24 * 60 * 60),
      });

      return authLoginResponse(accessVal, refreshVal);
    },
    {
      body: authLoginBodySchema,
      detail: authLoginDocs,
      response: Response(authLoginResponseSchema),
    }
  )
  .post(
    "/refresh-token",
    async ({ jwt, refreshJwt, cookie: { accessToken, refreshToken } }) => {
      if (!refreshToken.value) {
        throw new ApiError("No refresh token provided", 401);
      }

      const payload = await refreshJwt.verify(refreshToken.value.toString());
      if (!payload) {
        throw new ApiError("Invalid refresh token", 401);
      }

      const newAccessToken = await jwt.sign({
        sub: payload.sub,
        role: payload.role,
      });

      accessToken.set({
        value: newAccessToken,
        ...getCookieOptions(60 * 60),
      });

      return authRefreshTokenResponse(newAccessToken);
    },
    {
      detail: authRefreshTokenDocs,
      response: Response(t.Object({ accessToken: t.String() })),
    }
  )
  .guard({}, (app) =>
    app
      .use(authPlugin)
      .get(
        "/me",
        async ({ user }) => {
          return await authGetCurrentUserService(user.id);
        },
        {
          response: Response(userProfileResponseSchema),
          detail: authGetProfileDocs,
        }
      )
      .patch(
        "/me",
        async ({ user, body }) => {
          return await authUpdateProfileService(user.id, body);
        },
        {
          body: authUpdateProfileBodySchema,
          response: Response(userProfileResponseSchema),
          detail: authUpdateProfileDocs,
        }
      )
      .post(
        "/logout",
        ({ cookie: { accessToken, refreshToken } }) => {
          accessToken.set({
            value: "",
            ...getCookieOptions(0),
          });
          refreshToken.set({
            value: "",
            ...getCookieOptions(0),
          });

          return authLogoutResponse();
        },
        {
          detail: authLogoutDocs,
          response: Response(t.Null()),
        }
      )
  );

export default authRoutes;
