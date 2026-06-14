import type { FinancialData } from "@truestock/types";
import { fetchFinancialDataFromCafeF } from "./cafef-financial";
import { MOCK_STOCKS, SUPPORTED_TICKERS } from "./mock-data";

export class FinancialDataService {
  // Lấy dữ liệu tài chính: ưu tiên CafeF BCTC thật, fallback mock data
  async fetch(ticker: string): Promise<FinancialData> {
    const normalized = ticker.toUpperCase();

    try {
      const cafeFData = await fetchFinancialDataFromCafeF(normalized);
      if (cafeFData) return cafeFData;
    } catch (error) {
      console.error(`[CafeF] Lỗi fetch ${normalized}:`, error);
    }

    const mockData = MOCK_STOCKS[normalized];
    if (!mockData) {
      throw new Error("Không tìm thấy mã cổ phiếu này.");
    }

    return mockData;
  }

  isSupported(ticker: string): boolean {
    return ticker.toUpperCase() in MOCK_STOCKS;
  }

  getSupportedTickers(): string[] {
    return SUPPORTED_TICKERS;
  }
}
