export interface Env {
  ENVIRONMENT: string;
  FRONTEND_URL?: string;
  ANTHROPIC_API_KEY: string;
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
}

export interface Variables {
  requestId: string;
  clerkId?: string;
  userId?: string;
}
