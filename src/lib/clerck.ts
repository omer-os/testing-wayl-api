import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey:Bun.env.CLERK_SECRET_KEY as string,
});

export default clerkClient;