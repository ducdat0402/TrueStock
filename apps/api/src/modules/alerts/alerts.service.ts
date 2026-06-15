import type { AlertItem, AlertPreferences } from "@truestock/types";
import type { Env } from "../../types/env";
import { AlertsRepository } from "./alerts.repository";

export class AlertsService {
  private repository: AlertsRepository;

  constructor(env: Env) {
    this.repository = new AlertsRepository(env.DATABASE_URL);
  }

  async getAlerts(userId: string): Promise<AlertItem[]> {
    return this.repository.findAlertsByUserId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.getUnreadCount(userId);
  }

  async markAsRead(userId: string, alertId: string): Promise<void> {
    return this.repository.markAsRead(userId, alertId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.repository.markAllAsRead(userId);
  }

  async getPreferences(userId: string): Promise<AlertPreferences> {
    return this.repository.getPreferences(userId);
  }

  async updatePreferences(
    userId: string,
    prefs: Partial<AlertPreferences>
  ): Promise<void> {
    return this.repository.updatePreferences(userId, prefs);
  }

  async createAlert(
    userId: string,
    ticker: string,
    oldScore: number,
    newScore: number,
    channel: "in_app" | "email"
  ): Promise<void> {
    return this.repository.createAlert(userId, ticker, oldScore, newScore, channel);
  }
}
