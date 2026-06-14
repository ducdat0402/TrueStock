import type { SearchHistoryItem } from "@truestock/types";
import type { Env } from "../../types/env";
import { HistoryRepository } from "./history.repository";

export class HistoryService {
  private repository: HistoryRepository;

  constructor(env: Env) {
    this.repository = new HistoryRepository(env.DATABASE_URL);
  }

  async getUserHistory(userId: string): Promise<SearchHistoryItem[]> {
    return this.repository.findByUserId(userId);
  }

  async recordSearch(
    userId: string,
    ticker: string,
    analysisId?: string
  ): Promise<void> {
    await this.repository.saveSearch(userId, ticker, analysisId);
  }
}
