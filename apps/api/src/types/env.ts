export interface Env {
  ENVIRONMENT: string;
  FRONTEND_URL?: string;
  ANTHROPIC_API_KEY: string;
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  UPLOADS_BUCKET?: R2Bucket;
}

export type UserPlan = "free" | "premium" | "b2b";

export interface Variables {
  requestId: string;
  clerkId?: string;
  userId?: string;
  userPlan?: UserPlan;
}
