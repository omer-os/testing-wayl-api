import { t } from "elysia";

export const authRegisterBodySchema = t.Object({
  email: t.String({ format: "email", examples: ["test@example.com"] }),
  password: t.String({ minLength: 8, examples: ["Password123"] }),
  name: t.String({ minLength: 1, examples: ["John Doe"] }),
});

export const authLoginBodySchema = t.Object({
  email: t.String({ format: "email", examples: ["test@example.com"] }),
  password: t.String({ minLength: 1, examples: ["Password123"] }),
});

export const authUpdateProfileBodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, examples: ["John Doe"] })),
  email: t.Optional(
    t.String({ format: "email", examples: ["newemail@example.com"] })
  ),
});
