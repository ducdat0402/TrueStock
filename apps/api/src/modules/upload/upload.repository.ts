import { eq, desc } from "drizzle-orm";
import { getDb } from "../../db/client";
import { uploads } from "../../db/schema";
import type { FinancialData } from "@truestock/types";

export interface UploadRecord {
  id: string;
  userId: string;
  ticker: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  status: "pending" | "processing" | "completed" | "failed";
  extractedData?: FinancialData;
  errorMessage?: string;
  createdAt: Date;
}

export interface NewUploadRecord {
  userId: string;
  ticker: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  status: "pending" | "processing" | "completed" | "failed";
  extractedData?: FinancialData;
  errorMessage?: string;
}

export class UploadRepository {
  constructor(private databaseUrl: string) {}

  private get db() {
    return getDb(this.databaseUrl);
  }

  async saveUpload(upload: NewUploadRecord): Promise<UploadRecord> {
    const rows = await this.db
      .insert(uploads)
      .values({
        userId: upload.userId,
        ticker: upload.ticker,
        fileName: upload.fileName,
        fileKey: upload.fileKey,
        fileSize: upload.fileSize,
        status: upload.status,
        extractedData: upload.extractedData,
        errorMessage: upload.errorMessage,
      })
      .returning();

    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      ticker: row.ticker,
      fileName: row.fileName,
      fileKey: row.fileKey,
      fileSize: row.fileSize,
      status: row.status as UploadRecord["status"],
      extractedData: row.extractedData as FinancialData | undefined,
      errorMessage: row.errorMessage || undefined,
      createdAt: row.createdAt || new Date(),
    };
  }

  async getUploadsByUser(userId: string): Promise<UploadRecord[]> {
    const rows = await this.db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt))
      .limit(50);

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      ticker: row.ticker,
      fileName: row.fileName,
      fileKey: row.fileKey,
      fileSize: row.fileSize,
      status: row.status as UploadRecord["status"],
      extractedData: row.extractedData as FinancialData | undefined,
      errorMessage: row.errorMessage || undefined,
      createdAt: row.createdAt || new Date(),
    }));
  }
}
