import type { AnalysisResult, FinancialData } from "@truestock/types";
import type { Env } from "../../types/env";
import { ClaudeService } from "../../services/ai/claude.service";
import { InsightsService } from "../../services/insights";
import { UploadRepository, type UploadRecord } from "./upload.repository";

export class UploadService {
  private claudeService: ClaudeService;
  private insightsService: InsightsService;
  private repository: UploadRepository;
  private bucket: R2Bucket | undefined;

  constructor(private env: Env) {
    this.claudeService = new ClaudeService(env.ANTHROPIC_API_KEY);
    this.insightsService = new InsightsService();
    this.repository = new UploadRepository(env.DATABASE_URL);
    this.bucket = env.UPLOADS_BUCKET;
  }

  async uploadAndAnalyze(
    userId: string,
    ticker: string,
    file: File
  ): Promise<{ upload: UploadRecord; analysis: AnalysisResult }> {
    if (!this.bucket) {
      throw new Error("Upload bucket not configured");
    }

    const normalizedTicker = ticker.toUpperCase();
    const timestamp = Date.now();
    const key = `${userId}/${normalizedTicker}/${timestamp}.pdf`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await this.bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: "application/pdf",
      },
      customMetadata: {
        userId,
        ticker: normalizedTicker,
        originalName: file.name,
      },
    });

    // Extract text from PDF using Claude's document understanding
    const financialData = await this.extractFinancialDataFromPdf(
      arrayBuffer,
      normalizedTicker
    );

    // Analyze the extracted financial data
    const claudeResult = await this.claudeService.analyze(financialData);
    const enrichedResult = await this.insightsService.enrich(
      claudeResult,
      financialData
    );

    // Save upload record
    const upload = await this.repository.saveUpload({
      userId,
      ticker: normalizedTicker,
      fileName: file.name,
      fileKey: key,
      fileSize: file.size,
      status: "completed",
      extractedData: financialData,
    });

    return { upload, analysis: enrichedResult };
  }

  private async extractFinancialDataFromPdf(
    pdfBuffer: ArrayBuffer,
    ticker: string
  ): Promise<FinancialData> {
    // Convert PDF to base64 for Claude
    const base64 = this.arrayBufferToBase64(pdfBuffer);

    // Use Claude to extract structured financial data from the PDF
    const prompt = `Analyze this Vietnamese financial statement PDF and extract the following data in JSON format:

{
  "companyName": "Tên công ty đầy đủ",
  "revenue": [{"year": 2024, "value": số_nghìn_tỷ}, {"year": 2023, "value": số}...],
  "netProfit": [{"year": 2024, "value": số_nghìn_tỷ}, {"year": 2023, "value": số}...],
  "netProfitMargin": số_phần_trăm,
  "totalDebt": số_nghìn_tỷ,
  "totalEquity": số_nghìn_tỷ,
  "debtToEquity": số,
  "revenueGrowthYoY": số_phần_trăm,
  "peRatio": số (nếu có),
  "roe": số_phần_trăm
}

Notes:
- Giá trị tiền tệ tính bằng nghìn tỷ VND
- Nếu không tìm thấy dữ liệu, dùng null
- Trả về JSON object thuần, không có markdown
- revenue và netProfit nên có ít nhất 2-4 năm gần nhất

Return ONLY the JSON object, no explanation.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Claude API error:", errorText);
        throw new Error("Failed to extract financial data from PDF");
      }

      const result = (await response.json()) as {
        content: { type: string; text: string }[];
      };
      const textContent = result.content.find((c) => c.type === "text");

      if (!textContent?.text) {
        throw new Error("No text response from Claude");
      }

      // Parse the JSON response
      const extractedData = JSON.parse(textContent.text);

      // Build FinancialData object with defaults
      return {
        ticker,
        companyName: extractedData.companyName || `Công ty ${ticker}`,
        revenue: extractedData.revenue || [],
        netProfit: extractedData.netProfit || [],
        netProfitMargin: extractedData.netProfitMargin || 0,
        totalDebt: extractedData.totalDebt || 0,
        totalEquity: extractedData.totalEquity || 1, // Avoid division by zero
        debtToEquity: extractedData.debtToEquity || 0,
        revenueGrowthYoY: extractedData.revenueGrowthYoY || 0,
        peRatio: extractedData.peRatio || 0,
        roe: extractedData.roe || 0,
        dataSource: "PDF Upload",
      };
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error(
        "Không thể trích xuất dữ liệu từ PDF. Vui lòng kiểm tra file có chứa báo cáo tài chính hợp lệ."
      );
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async getUploadHistory(userId: string): Promise<UploadRecord[]> {
    return this.repository.getUploadsByUser(userId);
  }
}
