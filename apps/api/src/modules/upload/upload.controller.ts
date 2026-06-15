import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { requirePlan } from "../../middleware/plan-guard";
import { UploadService } from "./upload.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadController = new Hono<{ Bindings: Env; Variables: Variables }>();

// All upload endpoints require Premium
uploadController.use("*", requireAuth);
uploadController.use("*", requirePlan("premium", "b2b"));

// POST /api/upload/bctc - upload a financial statement PDF
uploadController.post("/bctc", async (c) => {
  const bucket = c.env.UPLOADS_BUCKET;

  if (!bucket) {
    return c.json(
      { success: false, error: "Upload service not configured" },
      503
    );
  }

  try {
    const userId = c.get("userId")!;
    const contentType = c.req.header("content-type") || "";

    // Handle multipart form data
    if (!contentType.includes("multipart/form-data")) {
      return c.json(
        { success: false, error: "Content-Type must be multipart/form-data" },
        400
      );
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const ticker = formData.get("ticker") as string | null;

    if (!file) {
      return c.json({ success: false, error: "No file uploaded" }, 400);
    }

    if (!ticker) {
      return c.json({ success: false, error: "Ticker is required" }, 400);
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return c.json(
        { success: false, error: "Only PDF files are allowed" },
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return c.json(
        { success: false, error: "File size exceeds 5MB limit" },
        400
      );
    }

    const service = new UploadService(c.env);
    const result = await service.uploadAndAnalyze(userId, ticker, file);

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return c.json({ success: false, error: message }, 500);
  }
});

// GET /api/upload/history - get user's upload history
uploadController.get("/history", async (c) => {
  try {
    const userId = c.get("userId")!;
    const service = new UploadService(c.env);
    const history = await service.getUploadHistory(userId);

    return c.json({ success: true, data: history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch history";
    return c.json({ success: false, error: message }, 500);
  }
});
