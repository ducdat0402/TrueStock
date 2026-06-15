import type { FinancialData, RiskAlert } from "@truestock/types";

export function detectRiskAlerts(data: FinancialData): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Rule 1: High debt-to-equity ratio
  if (data.debtToEquity > 1.5) {
    alerts.push({
      level: "warning",
      message: `Tỷ lệ nợ/vốn là ${data.debtToEquity.toFixed(2)} — cao hơn ngưỡng an toàn thông thường (1.5). Công ty đang vay nhiều so với vốn tự có.`,
    });
  } else if (data.debtToEquity > 1) {
    alerts.push({
      level: "info",
      message: `Tỷ lệ nợ/vốn là ${data.debtToEquity.toFixed(2)} — ở mức trung bình, cần theo dõi nếu tăng thêm.`,
    });
  }

  // Rule 2: Negative revenue growth
  if (data.revenueGrowthYoY < 0) {
    const absGrowth = Math.abs(data.revenueGrowthYoY).toFixed(1);
    if (data.revenueGrowthYoY < -10) {
      alerts.push({
        level: "warning",
        message: `Doanh thu giảm ${absGrowth}% so với năm trước — đây là dấu hiệu đáng lo ngại cần tìm hiểu nguyên nhân.`,
      });
    } else {
      alerts.push({
        level: "info",
        message: `Doanh thu giảm nhẹ ${absGrowth}% so với năm trước.`,
      });
    }
  }

  // Rule 3: Low or negative profit margin
  if (data.netProfitMargin < 0) {
    alerts.push({
      level: "warning",
      message: `Biên lợi nhuận ròng âm (${data.netProfitMargin.toFixed(1)}%) — công ty đang lỗ.`,
    });
  } else if (data.netProfitMargin < 3) {
    alerts.push({
      level: "info",
      message: `Biên lợi nhuận ròng chỉ ${data.netProfitMargin.toFixed(1)}% — khá mỏng, dễ bị ảnh hưởng khi chi phí tăng.`,
    });
  }

  // Rule 4: Very high P/E ratio
  if (data.peRatio > 40 && data.peRatio > 0) {
    alerts.push({
      level: "warning",
      message: `P/E = ${data.peRatio.toFixed(1)} — định giá rất cao, cần cân nhắc kỹ trước khi mua.`,
    });
  } else if (data.peRatio > 25 && data.peRatio > 0) {
    alerts.push({
      level: "info",
      message: `P/E = ${data.peRatio.toFixed(1)} — định giá tương đối cao so với trung bình thị trường.`,
    });
  }

  // Rule 5: Low ROE
  if (data.roe < 5 && data.roe >= 0) {
    alerts.push({
      level: "info",
      message: `ROE chỉ ${data.roe.toFixed(1)}% — hiệu quả sử dụng vốn thấp hơn gửi tiết kiệm ngân hàng.`,
    });
  } else if (data.roe < 0) {
    alerts.push({
      level: "warning",
      message: `ROE âm (${data.roe.toFixed(1)}%) — công ty đang làm mất vốn cổ đông.`,
    });
  }

  // Rule 6: Profit decline trend (check from netProfit array)
  if (data.netProfit.length >= 2) {
    const sortedProfits = [...data.netProfit].sort((a, b) => b.year - a.year);
    const latest = sortedProfits[0];
    const previous = sortedProfits[1];
    
    if (latest.value < previous.value * 0.85) {
      const decline = (((previous.value - latest.value) / previous.value) * 100).toFixed(0);
      alerts.push({
        level: "warning",
        message: `Lợi nhuận giảm ${decline}% so với năm trước (${previous.year}: ${previous.value.toLocaleString()} tỷ → ${latest.year}: ${latest.value.toLocaleString()} tỷ).`,
      });
    }
  }

  // Rule 7: Revenue decline for 2+ consecutive years
  if (data.revenue.length >= 3) {
    const sortedRevenue = [...data.revenue].sort((a, b) => b.year - a.year);
    const y0 = sortedRevenue[0].value;
    const y1 = sortedRevenue[1].value;
    const y2 = sortedRevenue[2].value;
    
    if (y0 < y1 && y1 < y2) {
      alerts.push({
        level: "warning",
        message: `Doanh thu giảm liên tục 2 năm — xu hướng đáng lo ngại cần theo dõi.`,
      });
    }
  }

  // Rule 8: Check debt trend from balance sheet if available
  if (data.totalDebt > 0 && data.totalEquity > 0) {
    const debtRatio = data.totalDebt / (data.totalDebt + data.totalEquity);
    if (debtRatio > 0.7) {
      alerts.push({
        level: "warning",
        message: `Nợ chiếm ${(debtRatio * 100).toFixed(0)}% tổng nguồn vốn — mức độ đòn bẩy rất cao.`,
      });
    }
  }

  return alerts;
}
