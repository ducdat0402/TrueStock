const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "TrueStock <alerts@truestock.pages.dev>";

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

interface AlertEmailData {
  ticker: string;
  oldScore: number;
  newScore: number;
  frontendUrl: string;
}

function buildAlertEmailHtml(data: AlertEmailData): string {
  const delta = data.newScore - data.oldScore;
  const direction = delta > 0 ? "tăng" : "giảm";
  const color = delta > 0 ? "#10b981" : "#ef4444";
  const analyzeUrl = `${data.frontendUrl}/analyze/${data.ticker}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 480px; margin: 0 auto; padding: 32px 16px;">
    <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 16px; background: #0f172a; color: white; border-radius: 8px; font-weight: bold; font-size: 14px;">
          🔔 Cảnh báo TrueStock
        </span>
      </div>
      
      <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 20px; text-align: center;">
        Điểm sức khỏe ${data.ticker} đã ${direction}
      </h2>
      
      <div style="display: flex; justify-content: center; gap: 16px; margin: 24px 0; text-align: center;">
        <div style="padding: 16px; background: #f1f5f9; border-radius: 12px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Điểm cũ</div>
          <div style="font-size: 28px; font-weight: bold; color: #64748b;">${data.oldScore}</div>
        </div>
        <div style="font-size: 24px; padding-top: 20px;">→</div>
        <div style="padding: 16px; background: ${color}10; border-radius: 12px; border: 2px solid ${color};">
          <div style="font-size: 12px; color: ${color}; margin-bottom: 4px;">Điểm mới</div>
          <div style="font-size: 28px; font-weight: bold; color: ${color};">${data.newScore}</div>
        </div>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 16px 0; text-align: center;">
        Điểm sức khỏe tài chính của ${data.ticker} đã thay đổi <strong style="color: ${color};">${Math.abs(delta).toFixed(1)} điểm</strong>.
      </p>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${analyzeUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0d9488, #0f766e); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Xem chi tiết phân tích →
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0 0 8px;">Bạn nhận được email này vì đã bật thông báo cho ${data.ticker}.</p>
      <p style="margin: 0;">
        <a href="${data.frontendUrl}/dashboard" style="color: #0d9488;">Quản lý thông báo</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildAlertEmailText(data: AlertEmailData): string {
  const delta = data.newScore - data.oldScore;
  const direction = delta > 0 ? "tăng" : "giảm";

  return `
Cảnh báo TrueStock: Điểm sức khỏe ${data.ticker} đã ${direction}

Điểm cũ: ${data.oldScore}/10
Điểm mới: ${data.newScore}/10
Thay đổi: ${delta > 0 ? "+" : ""}${delta.toFixed(1)}

Xem chi tiết: ${data.frontendUrl}/analyze/${data.ticker}

---
TrueStock - Phân tích cổ phiếu cho nhà đầu tư F0
Quản lý thông báo: ${data.frontendUrl}/dashboard
  `.trim();
}

export class ResendService {
  private apiKey: string | undefined;
  private frontendUrl: string;

  constructor(apiKey: string | undefined, frontendUrl: string) {
    this.apiKey = apiKey;
    this.frontendUrl = frontendUrl || "https://truestock.pages.dev";
  }

  async sendAlertEmail(
    to: string,
    ticker: string,
    oldScore: number,
    newScore: number
  ): Promise<EmailResult> {
    if (!this.apiKey) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const emailData: AlertEmailData = {
      ticker,
      oldScore,
      newScore,
      frontendUrl: this.frontendUrl,
    };

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to,
          subject: `📊 ${ticker}: Điểm sức khỏe thay đổi (${oldScore} → ${newScore})`,
          html: buildAlertEmailHtml(emailData),
          text: buildAlertEmailText(emailData),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return { success: false, error: `Resend API error: ${errorBody}` };
      }

      const result = (await response.json()) as { id: string };
      return { success: true, id: result.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
