export interface IndustryInfo {
  industryId: string;
  industryName: string;
}

export interface IndustryData {
  id: string;
  name: string;
  tickers: string[];
}

// Vietnamese stock market industry classification
export const INDUSTRIES: IndustryData[] = [
  {
    id: "it",
    name: "Công nghệ thông tin",
    tickers: ["FPT", "CMG", "ELC", "ITD", "POT", "SAM"],
  },
  {
    id: "banking",
    name: "Ngân hàng",
    tickers: ["VCB", "BID", "CTG", "TCB", "MBB", "ACB", "VPB", "TPB", "STB", "HDB", "LPB", "EIB", "MSB", "SHB", "OCB"],
  },
  {
    id: "securities",
    name: "Chứng khoán",
    tickers: ["SSI", "VND", "HCM", "VCI", "SHS", "MBS", "VIX", "BSI", "CTS", "AGR"],
  },
  {
    id: "real_estate",
    name: "Bất động sản",
    tickers: ["VIC", "VHM", "NVL", "KDH", "DXG", "PDR", "NLG", "HDG", "CEO", "DIG", "NBB", "LDG", "SCR", "KBC", "BCM"],
  },
  {
    id: "retail",
    name: "Bán lẻ",
    tickers: ["MWG", "FRT", "PNJ", "DGW", "AST"],
  },
  {
    id: "food_beverage",
    name: "Thực phẩm & Đồ uống",
    tickers: ["VNM", "MSN", "SAB", "QNS", "MCH", "KDC", "VLC", "HAG", "HNG"],
  },
  {
    id: "steel",
    name: "Thép",
    tickers: ["HPG", "HSG", "NKG", "TLH", "POM", "SMC", "VIS"],
  },
  {
    id: "oil_gas",
    name: "Dầu khí",
    tickers: ["GAS", "PLX", "PVD", "PVS", "PVT", "BSR", "OIL", "PVC"],
  },
  {
    id: "aviation",
    name: "Hàng không",
    tickers: ["VJC", "HVN", "ACV", "SCS", "NCT"],
  },
  {
    id: "electricity",
    name: "Điện",
    tickers: ["POW", "REE", "PC1", "PPC", "NT2", "HND", "GEG", "BCG"],
  },
  {
    id: "construction",
    name: "Xây dựng",
    tickers: ["CTD", "HBC", "VCG", "FCN", "HUT", "C4G", "LCG"],
  },
  {
    id: "textile",
    name: "Dệt may",
    tickers: ["TCM", "TNG", "VGT", "GMC", "MSH", "STK"],
  },
  {
    id: "logistics",
    name: "Logistics & Vận tải",
    tickers: ["GMD", "HAH", "VTP", "VOS", "VSC", "PHP"],
  },
  {
    id: "insurance",
    name: "Bảo hiểm",
    tickers: ["BVH", "BMI", "PVI", "MIG", "PTI", "VNR"],
  },
  {
    id: "pharmaceutical",
    name: "Dược phẩm",
    tickers: ["DHG", "DMC", "IMP", "DBD", "TRA", "PME"],
  },
  {
    id: "plastics",
    name: "Nhựa & Bao bì",
    tickers: ["BMP", "NTP", "AAA", "VPK", "SPP"],
  },
];

// Build ticker -> industry lookup map
const tickerToIndustryMap = new Map<string, IndustryInfo>();

for (const industry of INDUSTRIES) {
  for (const ticker of industry.tickers) {
    tickerToIndustryMap.set(ticker.toUpperCase(), {
      industryId: industry.id,
      industryName: industry.name,
    });
  }
}

export function getIndustryByTicker(ticker: string): IndustryInfo | null {
  return tickerToIndustryMap.get(ticker.toUpperCase()) ?? null;
}

export function getPeerTickers(ticker: string, maxPeers = 8): string[] {
  const industry = getIndustryByTicker(ticker);
  if (!industry) return [];

  const industryData = INDUSTRIES.find((i) => i.id === industry.industryId);
  if (!industryData) return [];

  // Return peers excluding the current ticker, limited to maxPeers
  return industryData.tickers
    .filter((t) => t.toUpperCase() !== ticker.toUpperCase())
    .slice(0, maxPeers);
}

export function getIndustryById(industryId: string): IndustryData | null {
  return INDUSTRIES.find((i) => i.id === industryId) ?? null;
}
