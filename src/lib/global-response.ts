import { t, TSchema } from "elysia";

const Response = <T extends TSchema>(dataSchema: T) =>
  t.Object({
    success: t.Boolean({
      description: "Indicates if the request succeeded",
      examples: [true],
    }),
    data: dataSchema,
    message: t.String({
      description: "Optional response message",
      examples: ["Operation completed successfully"],
    }),
  });

export default Response;
