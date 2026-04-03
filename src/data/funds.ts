export type AssetClass = 'equity-co' | 'equity-intl' | 'fixed-income' | 'alternatives';

export interface Fund {
  ticker: string;
  name: string;
  category: string;
  expenseRatio: number;
  assetClass: AssetClass;
  description: string;
}

export const funds: Fund[] = [
  // Colombian Equity
  {
    ticker: 'ICOLCAP',
    name: 'Fondo Bursátil iShares MSCI COLCAP',
    category: 'Renta Variable Colombia',
    expenseRatio: 0.51,
    assetClass: 'equity-co',
    description: 'Exposición al mercado accionario colombiano a través del índice MSCI COLCAP.',
  },

  // International Equity — S&P 500
  {
    ticker: 'CSPX',
    name: 'iShares Core S&P 500 UCITS ETF',
    category: 'S&P 500 (USD)',
    expenseRatio: 0.07,
    assetClass: 'equity-intl',
    description: 'Exposición al índice S&P 500, las 500 empresas más grandes de EE.UU.',
  },
  {
    ticker: 'SXR8',
    name: 'iShares Core S&P 500 UCITS ETF (Acc)',
    category: 'S&P 500 Acumulación',
    expenseRatio: 0.07,
    assetClass: 'equity-intl',
    description: 'S&P 500 con reinversión automática de dividendos.',
  },

  // International Equity — Sectors & Regions
  {
    ticker: 'IUIT',
    name: 'iShares S&P 500 Information Technology Sector UCITS ETF',
    category: 'Tecnología EE.UU.',
    expenseRatio: 0.15,
    assetClass: 'equity-intl',
    description: 'Sector tecnológico del S&P 500: Apple, Microsoft, NVIDIA y más.',
  },
  {
    ticker: 'IWDA',
    name: 'iShares Core MSCI World UCITS ETF',
    category: 'Renta Variable Global',
    expenseRatio: 0.20,
    assetClass: 'equity-intl',
    description: 'Exposición diversificada a mercados desarrollados a nivel global.',
  },
  {
    ticker: 'EIMI',
    name: 'iShares Core MSCI EM IMI UCITS ETF',
    category: 'Mercados Emergentes',
    expenseRatio: 0.18,
    assetClass: 'equity-intl',
    description: 'Amplia exposición a mercados emergentes incluyendo Latinoamérica y Asia.',
  },
  {
    ticker: 'IUFS',
    name: 'iShares S&P 500 Financials Sector UCITS ETF',
    category: 'Financiero EE.UU.',
    expenseRatio: 0.15,
    assetClass: 'equity-intl',
    description: 'Sector financiero del S&P 500: bancos, aseguradoras y fintech.',
  },

  // Fixed Income — Short Duration
  {
    ticker: 'IB01',
    name: 'iShares $ Treasury Bond 0-1yr UCITS ETF',
    category: 'Bonos del Tesoro Corto Plazo',
    expenseRatio: 0.07,
    assetClass: 'fixed-income',
    description: 'Bonos del Tesoro de EE.UU. con vencimiento menor a 1 año. Máxima liquidez.',
  },
  {
    ticker: 'IBTA',
    name: 'iShares $ Treasury Bond 1-3yr UCITS ETF',
    category: 'Bonos del Tesoro 1-3 Años',
    expenseRatio: 0.07,
    assetClass: 'fixed-income',
    description: 'Bonos del Tesoro de EE.UU. con vencimiento de 1 a 3 años.',
  },
  {
    ticker: 'IBTM',
    name: 'iShares $ Treasury Bond 7-10yr UCITS ETF',
    category: 'Bonos del Tesoro 7-10 Años',
    expenseRatio: 0.07,
    assetClass: 'fixed-income',
    description: 'Bonos del Tesoro de EE.UU. de mediano plazo, mayor duración.',
  },
  {
    ticker: 'LQDA',
    name: 'iShares $ Corporate Bond UCITS ETF',
    category: 'Bonos Corporativos USD',
    expenseRatio: 0.15,
    assetClass: 'fixed-income',
    description: 'Bonos corporativos de grado de inversión denominados en dólares.',
  },

  // Alternatives
  {
    ticker: 'IBIT',
    name: 'iShares Bitcoin Trust ETF',
    category: 'Bitcoin',
    expenseRatio: 0.25,
    assetClass: 'alternatives',
    description: 'Exposición directa a Bitcoin a través de un ETF regulado.',
  },
];

export const fundMap: Record<string, Fund> = Object.fromEntries(
  funds.map((f) => [f.ticker, f])
);

export const assetClassLabels: Record<AssetClass, string> = {
  'equity-co': 'Renta Variable Colombia',
  'equity-intl': 'Renta Variable Internacional',
  'fixed-income': 'Renta Fija',
  'alternatives': 'Alternativos',
};

export const assetClassColors: Record<AssetClass, string> = {
  'equity-co': '#00A651',
  'equity-intl': '#1A73E8',
  'fixed-income': '#6B7280',
  'alternatives': '#F59E0B',
};
