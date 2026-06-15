import type { WatchlistItem } from "@truestock/types";
import type { Env } from "../../types/env";
import { WatchlistRepository } from "./watchlist.repository";

const MAX_WATCHLIST_ITEMS = 20;

export class WatchlistService {
  private repository: WatchlistRepository;

  constructor(env: Env) {
    this.repository = new WatchlistRepository(env.DATABASE_URL);
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    return this.repository.findByUserId(userId);
  }

  async isInWatchlist(userId: string, ticker: string): Promise<boolean> {
    const item = await this.repository.findByUserAndTicker(userId, ticker);
    return item !== null;
  }

  async addToWatchlist(
    userId: string,
    ticker: string,
    score?: number
  ): Promise<WatchlistItem> {
    // Check if already in watchlist
    const existing = await this.repository.findByUserAndTicker(userId, ticker);
    if (existing) {
      return existing;
    }

    // Check max items
    const currentItems = await this.repository.findByUserId(userId);
    if (currentItems.length >= MAX_WATCHLIST_ITEMS) {
      throw new Error(
        `Đã đạt giới hạn ${MAX_WATCHLIST_ITEMS} mã trong watchlist`
      );
    }

    return this.repository.add(userId, ticker, score);
  }

  async removeFromWatchlist(userId: string, ticker: string): Promise<boolean> {
    return this.repository.remove(userId, ticker);
  }
}
