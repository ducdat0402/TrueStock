import { eq } from "drizzle-orm";
import { getDb } from "../../db/client";
import { users, type User, type UserPlan } from "../../db/schema";

export class UserRepository {
  constructor(private databaseUrl: string) {}

  private get db() {
    return getDb(this.databaseUrl);
  }

  async findOrCreate(clerkId: string, email?: string): Promise<User> {
    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existing[0]) return existing[0];

    const rows = await this.db
      .insert(users)
      .values({ clerkId, email })
      .returning();

    return rows[0];
  }

  async updatePlan(
    clerkId: string,
    plan: UserPlan,
    subscriptionId: string | null
  ): Promise<void> {
    await this.db
      .update(users)
      .set({
        plan,
        clerkSubscriptionId: subscriptionId,
        planExpiresAt: plan === "premium" ? null : new Date(),
      })
      .where(eq(users.clerkId, clerkId));
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return rows[0] || null;
  }
}
