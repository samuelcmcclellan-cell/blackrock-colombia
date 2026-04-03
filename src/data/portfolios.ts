export interface PortfolioAllocation {
  ticker: string;
  weight: number; // 0-100
}

export interface DimensionScores {
  riskTolerance: number;       // 1-10
  timeHorizon: number;         // 1-10
  incomeNeed: number;          // 1-5
  esgPreference: number;       // 0-3
  internationalInterest: number; // 0-3
  activePreference: number;    // 0-3
  liquidityNeed: number;       // 1-5
  investmentSophistication: number; // 1-5
  taxEfficiency: number;       // 0-3
  volatilityComfort: number;   // 1-5
  concentrationPreference: number; // 0-3
}

export interface ModelPortfolio {
  id: string;
  name: string;
  description: string;
  riskLevel: number; // 1-10
  expectedReturnLow: number;
  expectedReturnMid: number;
  expectedReturnHigh: number;
  allocations: PortfolioAllocation[];
  scores: DimensionScores;
}

export const modelPortfolios: ModelPortfolio[] = [
  // 1. Ultra Conservador
  {
    id: 'ultra-conservador',
    name: 'Ultra Conservador',
    description: 'Máxima preservación de capital con bonos del Tesoro de EE.UU. de corto plazo. Ideal para reservas de emergencia o horizontes muy cortos.',
    riskLevel: 1,
    expectedReturnLow: 3.5,
    expectedReturnMid: 4.5,
    expectedReturnHigh: 5.5,
    allocations: [
      { ticker: 'IB01', weight: 70 },
      { ticker: 'IBTA', weight: 25 },
      { ticker: 'LQDA', weight: 5 },
    ],
    scores: { riskTolerance: 1, timeHorizon: 1, incomeNeed: 3, esgPreference: 0, internationalInterest: 1, activePreference: 0, liquidityNeed: 5, investmentSophistication: 1, taxEfficiency: 1, volatilityComfort: 1, concentrationPreference: 0 },
  },

  // 2. Conservador Corto Plazo
  {
    id: 'conservador-corto',
    name: 'Conservador Corto Plazo',
    description: 'Portafolio orientado a la estabilidad con bonos de corto y mediano plazo en dólares.',
    riskLevel: 2,
    expectedReturnLow: 4.0,
    expectedReturnMid: 5.2,
    expectedReturnHigh: 6.5,
    allocations: [
      { ticker: 'IB01', weight: 40 },
      { ticker: 'IBTA', weight: 35 },
      { ticker: 'LQDA', weight: 15 },
      { ticker: 'ICOLCAP', weight: 10 },
    ],
    scores: { riskTolerance: 2, timeHorizon: 2, incomeNeed: 4, esgPreference: 0, internationalInterest: 1, activePreference: 0, liquidityNeed: 4, investmentSophistication: 2, taxEfficiency: 1, volatilityComfort: 1, concentrationPreference: 0 },
  },

  // 3. Conservador Dolarizado
  {
    id: 'conservador-dolar',
    name: 'Conservador Dolarizado',
    description: 'Protección en dólares con exposición principal a renta fija de EE.UU. y una pequeña posición en renta variable.',
    riskLevel: 3,
    expectedReturnLow: 4.5,
    expectedReturnMid: 6.0,
    expectedReturnHigh: 7.5,
    allocations: [
      { ticker: 'IBTA', weight: 30 },
      { ticker: 'IBTM', weight: 25 },
      { ticker: 'LQDA', weight: 20 },
      { ticker: 'CSPX', weight: 15 },
      { ticker: 'ICOLCAP', weight: 10 },
    ],
    scores: { riskTolerance: 3, timeHorizon: 3, incomeNeed: 3, esgPreference: 0, internationalInterest: 2, activePreference: 0, liquidityNeed: 3, investmentSophistication: 2, taxEfficiency: 2, volatilityComfort: 2, concentrationPreference: 0 },
  },

  // 4. Moderado Conservador
  {
    id: 'moderado-conservador',
    name: 'Moderado Conservador',
    description: 'Balance entre estabilidad y crecimiento moderado. Buena diversificación entre renta fija y variable.',
    riskLevel: 4,
    expectedReturnLow: 5.0,
    expectedReturnMid: 7.0,
    expectedReturnHigh: 9.0,
    allocations: [
      { ticker: 'IBTA', weight: 20 },
      { ticker: 'LQDA', weight: 15 },
      { ticker: 'IBTM', weight: 10 },
      { ticker: 'CSPX', weight: 25 },
      { ticker: 'ICOLCAP', weight: 20 },
      { ticker: 'IWDA', weight: 10 },
    ],
    scores: { riskTolerance: 4, timeHorizon: 4, incomeNeed: 2, esgPreference: 0, internationalInterest: 2, activePreference: 1, liquidityNeed: 3, investmentSophistication: 3, taxEfficiency: 1, volatilityComfort: 2, concentrationPreference: 1 },
  },

  // 5. Moderado Balanceado
  {
    id: 'moderado-balanceado',
    name: 'Moderado Balanceado',
    description: 'Portafolio clásico 60/40 adaptado al mercado colombiano con diversificación internacional.',
    riskLevel: 5,
    expectedReturnLow: 6.0,
    expectedReturnMid: 8.5,
    expectedReturnHigh: 11.0,
    allocations: [
      { ticker: 'CSPX', weight: 30 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'IWDA', weight: 15 },
      { ticker: 'IBTA', weight: 15 },
      { ticker: 'LQDA', weight: 15 },
      { ticker: 'IB01', weight: 10 },
    ],
    scores: { riskTolerance: 5, timeHorizon: 5, incomeNeed: 2, esgPreference: 1, internationalInterest: 2, activePreference: 1, liquidityNeed: 3, investmentSophistication: 3, taxEfficiency: 1, volatilityComfort: 3, concentrationPreference: 1 },
  },

  // 6. Moderado Crecimiento
  {
    id: 'moderado-crecimiento',
    name: 'Moderado Crecimiento',
    description: 'Mayor exposición a renta variable con ancla en renta fija. Para inversionistas con horizonte de 5+ años.',
    riskLevel: 6,
    expectedReturnLow: 7.0,
    expectedReturnMid: 10.0,
    expectedReturnHigh: 13.0,
    allocations: [
      { ticker: 'CSPX', weight: 35 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'IWDA', weight: 15 },
      { ticker: 'EIMI', weight: 5 },
      { ticker: 'IBTA', weight: 15 },
      { ticker: 'LQDA', weight: 15 },
    ],
    scores: { riskTolerance: 6, timeHorizon: 6, incomeNeed: 1, esgPreference: 1, internationalInterest: 2, activePreference: 1, liquidityNeed: 2, investmentSophistication: 3, taxEfficiency: 2, volatilityComfort: 3, concentrationPreference: 1 },
  },

  // 7. Crecimiento
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    description: 'Portafolio orientado al crecimiento de largo plazo con fuerte exposición a mercados internacionales.',
    riskLevel: 7,
    expectedReturnLow: 8.0,
    expectedReturnMid: 11.5,
    expectedReturnHigh: 15.0,
    allocations: [
      { ticker: 'CSPX', weight: 35 },
      { ticker: 'IWDA', weight: 20 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'EIMI', weight: 10 },
      { ticker: 'IBTA', weight: 10 },
      { ticker: 'LQDA', weight: 10 },
    ],
    scores: { riskTolerance: 7, timeHorizon: 7, incomeNeed: 1, esgPreference: 1, internationalInterest: 3, activePreference: 1, liquidityNeed: 2, investmentSophistication: 4, taxEfficiency: 2, volatilityComfort: 4, concentrationPreference: 1 },
  },

  // 8. Crecimiento Agresivo
  {
    id: 'crecimiento-agresivo',
    name: 'Crecimiento Agresivo',
    description: 'Máxima exposición a renta variable global. Para inversionistas con horizonte largo y alta tolerancia al riesgo.',
    riskLevel: 8,
    expectedReturnLow: 9.0,
    expectedReturnMid: 13.0,
    expectedReturnHigh: 17.0,
    allocations: [
      { ticker: 'CSPX', weight: 35 },
      { ticker: 'IWDA', weight: 25 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'EIMI', weight: 15 },
      { ticker: 'IBTA', weight: 10 },
    ],
    scores: { riskTolerance: 8, timeHorizon: 8, incomeNeed: 1, esgPreference: 1, internationalInterest: 3, activePreference: 1, liquidityNeed: 1, investmentSophistication: 4, taxEfficiency: 2, volatilityComfort: 4, concentrationPreference: 2 },
  },

  // 9. Agresivo
  {
    id: 'agresivo',
    name: 'Agresivo',
    description: 'Portafolio concentrado en renta variable con posición en activos alternativos. Alto potencial de retorno.',
    riskLevel: 9,
    expectedReturnLow: 9.5,
    expectedReturnMid: 14.0,
    expectedReturnHigh: 19.0,
    allocations: [
      { ticker: 'CSPX', weight: 30 },
      { ticker: 'IWDA', weight: 25 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'EIMI', weight: 15 },
      { ticker: 'IUIT', weight: 10 },
      { ticker: 'IBIT', weight: 5 },
    ],
    scores: { riskTolerance: 9, timeHorizon: 9, incomeNeed: 1, esgPreference: 0, internationalInterest: 3, activePreference: 2, liquidityNeed: 1, investmentSophistication: 4, taxEfficiency: 1, volatilityComfort: 5, concentrationPreference: 2 },
  },

  // 10. Ultra Agresivo
  {
    id: 'ultra-agresivo',
    name: 'Ultra Agresivo',
    description: 'Máximo potencial de retorno. Concentrado en tecnología, mercados globales y activos digitales.',
    riskLevel: 10,
    expectedReturnLow: 10.0,
    expectedReturnMid: 16.0,
    expectedReturnHigh: 22.0,
    allocations: [
      { ticker: 'CSPX', weight: 25 },
      { ticker: 'IUIT', weight: 25 },
      { ticker: 'IWDA', weight: 20 },
      { ticker: 'EIMI', weight: 10 },
      { ticker: 'ICOLCAP', weight: 10 },
      { ticker: 'IBIT', weight: 10 },
    ],
    scores: { riskTolerance: 10, timeHorizon: 10, incomeNeed: 1, esgPreference: 0, internationalInterest: 3, activePreference: 3, liquidityNeed: 1, investmentSophistication: 5, taxEfficiency: 0, volatilityComfort: 5, concentrationPreference: 3 },
  },

  // --- THEMATIC PORTFOLIOS ---

  // 11. ESG / Sustentabilidad
  {
    id: 'tematico-esg',
    name: 'Crecimiento ESG',
    description: 'Portafolio enfocado en criterios ambientales, sociales y de gobernanza con diversificación global.',
    riskLevel: 6,
    expectedReturnLow: 7.0,
    expectedReturnMid: 10.0,
    expectedReturnHigh: 13.0,
    allocations: [
      { ticker: 'IWDA', weight: 35 },
      { ticker: 'CSPX', weight: 25 },
      { ticker: 'EIMI', weight: 15 },
      { ticker: 'IBTA', weight: 15 },
      { ticker: 'ICOLCAP', weight: 10 },
    ],
    scores: { riskTolerance: 6, timeHorizon: 6, incomeNeed: 1, esgPreference: 3, internationalInterest: 3, activePreference: 1, liquidityNeed: 2, investmentSophistication: 3, taxEfficiency: 1, volatilityComfort: 3, concentrationPreference: 1 },
  },

  // 12. Tecnología / IA
  {
    id: 'tematico-tech',
    name: 'Tecnología Global',
    description: 'Concentrado en el sector tecnológico global con exposición al S&P 500 y ETFs sectoriales.',
    riskLevel: 8,
    expectedReturnLow: 9.0,
    expectedReturnMid: 14.0,
    expectedReturnHigh: 19.0,
    allocations: [
      { ticker: 'IUIT', weight: 35 },
      { ticker: 'CSPX', weight: 30 },
      { ticker: 'IWDA', weight: 15 },
      { ticker: 'IBTA', weight: 10 },
      { ticker: 'ICOLCAP', weight: 10 },
    ],
    scores: { riskTolerance: 8, timeHorizon: 8, incomeNeed: 1, esgPreference: 0, internationalInterest: 3, activePreference: 2, liquidityNeed: 1, investmentSophistication: 4, taxEfficiency: 1, volatilityComfort: 4, concentrationPreference: 3 },
  },

  // 13. Renta con Dividendos
  {
    id: 'tematico-renta',
    name: 'Renta y Dividendos',
    description: 'Enfocado en generación de ingresos a través de dividendos colombianos y bonos corporativos.',
    riskLevel: 4,
    expectedReturnLow: 5.5,
    expectedReturnMid: 7.5,
    expectedReturnHigh: 9.5,
    allocations: [
      { ticker: 'ICOLCAP', weight: 30 },
      { ticker: 'LQDA', weight: 25 },
      { ticker: 'IBTA', weight: 20 },
      { ticker: 'CSPX', weight: 15 },
      { ticker: 'IBTM', weight: 10 },
    ],
    scores: { riskTolerance: 4, timeHorizon: 5, incomeNeed: 5, esgPreference: 0, internationalInterest: 1, activePreference: 1, liquidityNeed: 3, investmentSophistication: 3, taxEfficiency: 2, volatilityComfort: 2, concentrationPreference: 1 },
  },

  // 14. Mercado Internacional
  {
    id: 'tematico-intl',
    name: 'Diversificación Internacional',
    description: 'Máxima exposición a mercados globales con cobertura en dólares. Mínima exposición local.',
    riskLevel: 7,
    expectedReturnLow: 8.0,
    expectedReturnMid: 11.5,
    expectedReturnHigh: 15.0,
    allocations: [
      { ticker: 'IWDA', weight: 30 },
      { ticker: 'CSPX', weight: 25 },
      { ticker: 'EIMI', weight: 20 },
      { ticker: 'IBTA', weight: 15 },
      { ticker: 'ICOLCAP', weight: 10 },
    ],
    scores: { riskTolerance: 7, timeHorizon: 7, incomeNeed: 1, esgPreference: 1, internationalInterest: 3, activePreference: 1, liquidityNeed: 2, investmentSophistication: 4, taxEfficiency: 2, volatilityComfort: 3, concentrationPreference: 1 },
  },

  // 15. Renta Fija / Dolarización
  {
    id: 'tematico-dolar',
    name: 'Dolarización Estratégica',
    description: 'Portafolio defensivo en dólares con bonos del Tesoro de EE.UU. para protección cambiaria.',
    riskLevel: 2,
    expectedReturnLow: 4.0,
    expectedReturnMid: 5.5,
    expectedReturnHigh: 7.0,
    allocations: [
      { ticker: 'IB01', weight: 35 },
      { ticker: 'IBTA', weight: 30 },
      { ticker: 'IBTM', weight: 20 },
      { ticker: 'LQDA', weight: 15 },
    ],
    scores: { riskTolerance: 2, timeHorizon: 3, incomeNeed: 3, esgPreference: 0, internationalInterest: 2, activePreference: 0, liquidityNeed: 4, investmentSophistication: 2, taxEfficiency: 2, volatilityComfort: 1, concentrationPreference: 0 },
  },

  // 16. Jubilación Joven (20-35 años)
  {
    id: 'jubilacion-joven',
    name: 'Jubilación — Horizonte Largo',
    description: 'Portafolio de acumulación para jubilación con horizonte de 20+ años. Alta exposición a renta variable.',
    riskLevel: 7,
    expectedReturnLow: 8.0,
    expectedReturnMid: 12.0,
    expectedReturnHigh: 16.0,
    allocations: [
      { ticker: 'CSPX', weight: 30 },
      { ticker: 'IWDA', weight: 25 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'EIMI', weight: 15 },
      { ticker: 'IBTA', weight: 10 },
      { ticker: 'IBIT', weight: 5 },
    ],
    scores: { riskTolerance: 7, timeHorizon: 9, incomeNeed: 1, esgPreference: 1, internationalInterest: 3, activePreference: 1, liquidityNeed: 1, investmentSophistication: 3, taxEfficiency: 2, volatilityComfort: 4, concentrationPreference: 1 },
  },

  // 17. Jubilación Cercana (50+ años)
  {
    id: 'jubilacion-cercana',
    name: 'Jubilación — Horizonte Corto',
    description: 'Portafolio de preservación para jubilación cercana. Énfasis en estabilidad y generación de ingresos.',
    riskLevel: 3,
    expectedReturnLow: 4.5,
    expectedReturnMid: 6.5,
    expectedReturnHigh: 8.5,
    allocations: [
      { ticker: 'IBTA', weight: 30 },
      { ticker: 'LQDA', weight: 20 },
      { ticker: 'IB01', weight: 20 },
      { ticker: 'ICOLCAP', weight: 15 },
      { ticker: 'CSPX', weight: 15 },
    ],
    scores: { riskTolerance: 3, timeHorizon: 3, incomeNeed: 4, esgPreference: 0, internationalInterest: 1, activePreference: 0, liquidityNeed: 3, investmentSophistication: 3, taxEfficiency: 2, volatilityComfort: 2, concentrationPreference: 0 },
  },

  // 18. Financiero Sectorial
  {
    id: 'tematico-financiero',
    name: 'Sector Financiero',
    description: 'Exposición al sector financiero global con ancla en Colombia y bonos corporativos.',
    riskLevel: 7,
    expectedReturnLow: 7.5,
    expectedReturnMid: 11.0,
    expectedReturnHigh: 14.5,
    allocations: [
      { ticker: 'IUFS', weight: 30 },
      { ticker: 'CSPX', weight: 25 },
      { ticker: 'ICOLCAP', weight: 20 },
      { ticker: 'LQDA', weight: 15 },
      { ticker: 'IBTA', weight: 10 },
    ],
    scores: { riskTolerance: 7, timeHorizon: 6, incomeNeed: 2, esgPreference: 0, internationalInterest: 2, activePreference: 2, liquidityNeed: 2, investmentSophistication: 4, taxEfficiency: 1, volatilityComfort: 4, concentrationPreference: 3 },
  },
];
