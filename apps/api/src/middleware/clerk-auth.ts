import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import type { Env, Variables, UserPlan } from "../types/env";
import { UserRepository } from "../modules/users/user.repository";

interface AuthResult {
  clerkId: string;
  userId: string;
  userPlan: UserPlan;
}

async function resolveAuth(
  authHeader: string | undefined,
  env: Env
): Promise<AuthResult | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token || env.CLERK_SECRET_KEY === "your_clerk_secret_key_here") return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!payload.sub) return null;

    const userRepo = new UserRepository(env.DATABASE_URL);
    const user = await userRepo.findOrCreate(payload.sub);
    const userPlan = (user.plan as UserPlan) || "free";

    return { clerkId: payload.sub, userId: user.id, userPlan };
  } catch {
    return null;
  }
}

// Xác thực tùy chọn — dùng cho các endpoint không yêu cầu login
export const optionalAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const auth = await resolveAuth(c.req.header("Authorization"), c.env);
  if (auth) {
    c.set("clerkId", auth.clerkId);
    c.set("userId", auth.userId);
    c.set("userPlan", auth.userPlan);
  }
  await next();
});

// Xác thực bắt buộc — dùng cho các endpoint yêu cầu login
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const auth = await resolveAuth(c.req.header("Authorization"), c.env);

  if (!auth) {
    return c.json({ success: false, error: "Unauthorized", code: "AUTH_REQUIRED" }, 401);
  }

  c.set("clerkId", auth.clerkId);
  c.set("userId", auth.userId);
  c.set("userPlan", auth.userPlan);
  return next();
});
