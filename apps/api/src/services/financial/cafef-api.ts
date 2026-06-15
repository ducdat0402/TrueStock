const CAFEF_BASE_URL = "https://m.cafef.vn/du-lieu/Ajax/PageNew/";
const REPORT_TYPE_ANNUAL = "NAM";
const REPORT_TYPE_QUARTERLY = "QUY";

const CAFEF_HEADERS = {
  Accept: "application/json",
  "User-Agent": "TrueStock/1.0",
  Referer: "https://m.cafef.vn/",
};

interface CafeFResponse<T> {
  Data: T;
  Message: string | null;
  Success: boolean;
}

interface CafeFMetric {
  Code: string;
  Name: string;
  Value: number | string;
}

interface CafeFReportPeriod {
  Time: string;
  Year: number;
  Quater: number;
  ReportType: string | null;
  Value: CafeFMetric[];
}

interface CafeFFinanceReportData {
  Count: number;
  Value: CafeFReportPeriod[];
}

interface CafeFRatioPeriod {
  Time: string;
  Year: number;
  Quater: number;
  Value: CafeFMetric[];
}

interface CafeFRatioHistoryData {
  Count: number;
  Value: CafeFRatioPeriod[];
}

interface CafeFCompanyIntro {
  Name: string;
  Symbol: string;
}

interface CafeFIndicatorItem {
  Code: string;
  Text: string;
  Value: string;
}

async function cafefFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${CAFEF_BASE_URL}${path}`, {
      headers: CAFEF_HEADERS,
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as CafeFResponse<T>;
    if (!json.Success || json.Data == null) return null;

    return json.Data;
  } catch {
    return null;
  }
}

export function getMetric(period: CafeFReportPeriod, code: string): number | null {
  const metric = period.Value.find((item) => item.Code === code);
  if (metric == null) return null;
  const value = typeof metric.Value === "number" ? metric.Value : Number(metric.Value);
  return Number.isFinite(value) ? value : null;
}

export function toTyVnd(vnd: number): number {
  return Math.round((vnd / 1_000_000_000) * 10) / 10;
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function fetchCompanyIntro(
  ticker: string
): Promise<CafeFCompanyIntro | null> {
  return cafefFetch<CafeFCompanyIntro>(
    `CompanyIntro.ashx?Symbol=${ticker.toUpperCase()}`
  );
}

export async function fetchFinanceReport(
  ticker: string,
  type: 1 | 2,
  endYear: number
): Promise<CafeFFinanceReportData | null> {
  const symbol = ticker.toUpperCase();
  return cafefFetch<CafeFFinanceReportData>(
    `FinanceReport.ashx?Type=${type}&Symbol=${symbol}&TotalRow=4&EndDate=${endYear}&ReportType=${REPORT_TYPE_ANNUAL}&Sort=DESC`
  );
}

export async function fetchRatioHistory(
  ticker: string,
  endYear: number
): Promise<CafeFRatioHistoryData | null> {
  const symbol = ticker.toUpperCase();
  return cafefFetch<CafeFRatioHistoryData>(
    `GetDataChiSoTaiChinh.ashx?Symbol=${symbol}&TotalRow=4&EndDate=${endYear}&ReportType=${REPORT_TYPE_ANNUAL}&Sort=DESC`
  );
}

export async function fetchCurrentIndicators(
  ticker: string
): Promise<CafeFIndicatorItem[] | null> {
  return cafefFetch<CafeFIndicatorItem[]>(
    `ChiSoTaiChinh.ashx?Symbol=${ticker.toUpperCase()}`
  );
}

export function getIndicatorValue(
  indicators: CafeFIndicatorItem[] | null,
  code: string
): number | null {
  if (!indicators) return null;
  const item = indicators.find((i) => i.Code === code);
  return parseNumber(item?.Value);
}

// Quarterly report fetching functions
export async function fetchQuarterlyFinanceReport(
  ticker: string,
  type: 1 | 2,
  endYear: number,
  totalRow = 4
): Promise<CafeFFinanceReportData | null> {
  const symbol = ticker.toUpperCase();
  return cafefFetch<CafeFFinanceReportData>(
    `FinanceReport.ashx?Type=${type}&Symbol=${symbol}&TotalRow=${totalRow}&EndDate=${endYear}&ReportType=${REPORT_TYPE_QUARTERLY}&Sort=DESC`
  );
}

export async function fetchQuarterlyRatioHistory(
  ticker: string,
  endYear: number,
  totalRow = 4
): Promise<CafeFRatioHistoryData | null> {
  const symbol = ticker.toUpperCase();
  return cafefFetch<CafeFRatioHistoryData>(
    `GetDataChiSoTaiChinh.ashx?Symbol=${symbol}&TotalRow=${totalRow}&EndDate=${endYear}&ReportType=${REPORT_TYPE_QUARTERLY}&Sort=DESC`
  );
}

export type { CafeFReportPeriod, CafeFRatioPeriod, CafeFMetric };
