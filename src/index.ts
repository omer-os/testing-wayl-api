import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import routes from "./modules/all-routes";
import { authTagGroup } from "./modules/auth/tag-group";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "Wayl API",
          version: "1.0.0",
          description: "Backend API documentation for Wayl API",
        },
      },
      path: "/docs",
      specPath: "/docs/json",
    })
  )
  .use(routes)
  .listen({
    port: Bun.env.PORT || 3000,
    hostname: "0.0.0.0",
  });

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/docs`
);
