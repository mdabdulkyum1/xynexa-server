
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const requireAuth = ClerkExpressRequireAuth({
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
});

export { requireAuth };
