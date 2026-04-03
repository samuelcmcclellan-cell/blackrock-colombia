export interface ThemeOverlay {
  id: string;
  label: string;
  description: string;
  boosts: Record<string, number>; // ticker → percentage point boost
}

export const themeOverlays: ThemeOverlay[] = [
  {
    id: 'esg',
    label: 'ESG / Sustentabilidad',
    description: 'Impulsa ETFs con enfoque ambiental, social y de gobernanza.',
    boosts: {
      IWDA: 5,
      CSPX: 3,
      EIMI: 2,
    },
  },
  {
    id: 'tech',
    label: 'Tecnología / IA',
    description: 'Mayor exposición al sector tecnológico global.',
    boosts: {
      IUIT: 7,
      CSPX: 3,
    },
  },
  {
    id: 'income',
    label: 'Renta con Dividendos',
    description: 'Prioriza flujos de ingresos regulares y activos colombianos.',
    boosts: {
      ICOLCAP: 6,
      LQDA: 4,
    },
  },
  {
    id: 'international',
    label: 'Mercado Internacional',
    description: 'Diversificación global más allá de Colombia.',
    boosts: {
      CSPX: 5,
      IWDA: 5,
      EIMI: 3,
    },
  },
  {
    id: 'fixed-dollar',
    label: 'Renta Fija / Dolarización',
    description: 'Protección en dólares con bonos del Tesoro de EE.UU.',
    boosts: {
      IB01: 10,
      IBTA: 7,
      IBTM: 3,
    },
  },
];
