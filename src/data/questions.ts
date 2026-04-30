import {
  Sunset, GraduationCap, Home, TrendingUp, Wallet, Shield,
} from 'lucide-react';

export type StepId = 'objetivo' | 'finanzas' | 'riesgo' | 'estilo';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface Question {
  id: string;
  question: string;
  type: 'single' | 'multi' | 'slider' | 'text' | 'number';
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  conditionalOn?: { questionId: string; values: string[] };
  /** Optional inline ETF / investing microlearning shown beneath the prompt. */
  microLearning?: string;
}

export interface QuestionnaireStep {
  id: StepId;
  title: string;
  subtitle: string;
  hasAI: boolean;
  questions: Question[];
}

export const questionnaireSteps: QuestionnaireStep[] = [
  // --- STEP 1: OBJETIVO ---
  // AI fires after the parent + 1 conditional answer, so the user feels the AI
  // experience after roughly the first 2–3 answers rather than at the end.
  {
    id: 'objetivo',
    title: 'Objetivo',
    subtitle: 'Cuéntenos sobre su meta de inversión',
    hasAI: true,
    questions: [
      {
        id: 'goal',
        question: '¿Cuál es su principal motivación para invertir?',
        type: 'single',
        options: [
          { value: 'jubilacion', label: 'Jubilación', description: 'Construir patrimonio para el retiro', icon: Sunset },
          { value: 'educacion', label: 'Educación', description: 'Financiar estudios propios o de sus hijos', icon: GraduationCap },
          { value: 'compra', label: 'Compra Importante', description: 'Vivienda, vehículo u otra meta grande', icon: Home },
          { value: 'crecimiento', label: 'Crecimiento Patrimonial', description: 'Hacer crecer su capital a largo plazo', icon: TrendingUp },
          { value: 'renta', label: 'Generación de Renta', description: 'Obtener ingresos periódicos de sus inversiones', icon: Wallet },
          { value: 'emergencia', label: 'Reserva de Emergencia', description: 'Tener un colchón financiero disponible', icon: Shield },
        ],
      },
      // Conditional: Jubilación
      {
        id: 'retirement_years',
        question: '¿Cuántos años faltan para su jubilación?',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        unit: 'años',
        conditionalOn: { questionId: 'goal', values: ['jubilacion'] },
      },
      // Conditional: Educación
      {
        id: 'education_years',
        question: '¿En cuántos años necesitará los fondos para educación?',
        type: 'slider',
        min: 1,
        max: 20,
        step: 1,
        unit: 'años',
        conditionalOn: { questionId: 'goal', values: ['educacion'] },
      },
      // Conditional: Compra Importante
      {
        id: 'purchase_timeline',
        question: '¿En cuántos años planea realizar esta compra?',
        type: 'single',
        options: [
          { value: '1-2', label: '1-2 años' },
          { value: '3-5', label: '3-5 años' },
          { value: '5-10', label: '5-10 años' },
          { value: '10+', label: 'Más de 10 años' },
        ],
        conditionalOn: { questionId: 'goal', values: ['compra'] },
      },
      // Conditional: Crecimiento
      {
        id: 'growth_horizon',
        question: '¿Cuál es su horizonte de inversión para crecimiento?',
        type: 'single',
        options: [
          { value: '1-3', label: '1-3 años' },
          { value: '3-5', label: '3-5 años' },
          { value: '5-10', label: '5-10 años' },
          { value: '10+', label: 'Más de 10 años' },
        ],
        conditionalOn: { questionId: 'goal', values: ['crecimiento'] },
      },
      // Conditional: Renta
      {
        id: 'income_frequency',
        question: '¿Con qué frecuencia necesita recibir ingresos?',
        type: 'single',
        options: [
          { value: 'mensual', label: 'Mensual' },
          { value: 'trimestral', label: 'Trimestral' },
          { value: 'semestral', label: 'Semestral' },
          { value: 'anual', label: 'Anual' },
        ],
        conditionalOn: { questionId: 'goal', values: ['renta'] },
      },
      // Conditional: Emergencia
      {
        id: 'emergency_months',
        question: '¿Cuántos meses de gastos quiere cubrir con su reserva?',
        type: 'slider',
        min: 3,
        max: 24,
        step: 1,
        unit: 'meses',
        conditionalOn: { questionId: 'goal', values: ['emergencia'] },
      },
    ],
  },

  // --- STEP 2: FINANZAS ---
  {
    id: 'finanzas',
    title: 'Finanzas',
    subtitle: 'Su situación financiera actual',
    hasAI: true,
    questions: [
      {
        id: 'age',
        question: '¿En qué etapa de vida se encuentra?',
        type: 'single',
        options: [
          { value: '18-25', label: 'Joven profesional (18–25)' },
          { value: '26-35', label: 'Construyendo carrera (26–35)' },
          { value: '36-45', label: 'Consolidación (36–45)' },
          { value: '46-55', label: 'Pre-jubilación (46–55)' },
          { value: '56-65', label: 'Próximo a jubilación (56–65)' },
          { value: '65+', label: 'Jubilado (65+)' },
        ],
      },
      {
        id: 'existing_investments',
        question: '¿Tiene inversiones actualmente?',
        type: 'single',
        microLearning:
          'Su portafolio se construirá con ETFs — fondos cotizados que combinan la diversificación de un fondo con la flexibilidad de una acción.',
        options: [
          { value: 'none', label: 'No, esta sería mi primera inversión' },
          { value: 'savings', label: 'Solo cuentas de ahorro o CDTs' },
          { value: 'some', label: 'Sí, en fondos o acciones' },
          { value: 'diversified', label: 'Sí, un portafolio diversificado' },
        ],
      },
      {
        id: 'liquidity',
        question: '¿Qué tan importante es poder retirar su dinero rápidamente?',
        type: 'single',
        options: [
          { value: 'critical', label: 'Muy importante — puedo necesitarlo en cualquier momento' },
          { value: 'moderate', label: 'Moderadamente — quiero acceso en semanas' },
          { value: 'low', label: 'Poco importante — puedo esperar meses' },
          { value: 'none', label: 'No es prioridad — es inversión de largo plazo' },
        ],
      },
    ],
  },

  // --- STEP 3: RIESGO ---
  {
    id: 'riesgo',
    title: 'Riesgo',
    subtitle: 'Su tolerancia al riesgo y comportamiento',
    hasAI: true,
    questions: [
      {
        id: 'drawdown_reaction',
        question: 'Si su portafolio cayera un 20% en un mes, ¿qué haría?',
        type: 'single',
        options: [
          { value: 'sell_all', label: 'Vendería todo inmediatamente' },
          { value: 'sell_some', label: 'Vendería una parte para reducir pérdidas' },
          { value: 'hold', label: 'Mantendría mi posición y esperaría' },
          { value: 'buy_more', label: 'Compraría más — es una oportunidad' },
        ],
      },
      {
        id: 'max_loss',
        question: '¿Cuál es la pérdida máxima que toleraría en un año antes de cambiar su estrategia?',
        type: 'single',
        options: [
          { value: '5', label: 'Hasta 5%' },
          { value: '10', label: 'Hasta 10%' },
          { value: '20', label: 'Hasta 20%' },
          { value: '30', label: 'Hasta 30%' },
          { value: 'any', label: 'No cambiaría — mantengo mi estrategia' },
        ],
      },
    ],
  },

  // --- STEP 4: ESTILO ---
  // ETF-centric: familiarity, passive vs active, currency comfort, themes.
  {
    id: 'estilo',
    title: 'Estilo',
    subtitle: 'Sus preferencias de inversión',
    hasAI: true,
    questions: [
      {
        id: 'etf_familiarity',
        question: '¿Qué tan familiar se siente con los ETFs?',
        type: 'single',
        microLearning:
          'Un ETF es una canasta diversificada de cientos de inversiones que se compra y vende como una sola acción en la bolsa.',
        options: [
          { value: 'never_heard', label: 'Es la primera vez que escucho del término', description: 'Le explicaremos cada paso' },
          { value: 'heard_only', label: 'He oído de ellos pero no los entiendo bien', description: 'Buena base para empezar' },
          { value: 'understand', label: 'Entiendo cómo funcionan a grandes rasgos', description: 'Ya tiene contexto' },
          { value: 'invested', label: 'He invertido en ETFs antes', description: 'Experiencia directa' },
        ],
      },
      {
        id: 'passive_active_pref',
        question: '¿Qué enfoque prefiere para construir su portafolio?',
        type: 'single',
        microLearning:
          'Los ETFs pasivos cobran 0,03% – 0,20% al año; los fondos activos suelen cobrar 1% – 2%. Esa diferencia compone significativamente con el tiempo.',
        options: [
          { value: 'passive', label: 'Indexado / Pasivo', description: 'Replicar el mercado con costos muy bajos' },
          { value: 'mix', label: 'Combinación', description: 'Base indexada con toques de gestión activa' },
          { value: 'active', label: 'Activo', description: 'Pagar por gestión profesional que busque superar al mercado' },
          { value: 'unsure', label: 'No estoy seguro', description: 'Quiero la recomendación de la IA' },
        ],
      },
      {
        id: 'currency_comfort',
        question: '¿Qué tan cómodo se siente invirtiendo en ETFs denominados en dólares?',
        type: 'single',
        microLearning:
          'Invertir en USD diversifica su exposición de moneda y le da acceso a los mercados globales más profundos. Le protege ante una depreciación del peso colombiano.',
        options: [
          { value: 'usd_only', label: 'Prefiero todo en USD / mercados globales' },
          { value: 'usd_majority', label: 'Mayoría en USD, algo local' },
          { value: 'balanced', label: 'Balance entre COP y USD' },
          { value: 'cop_majority', label: 'Prefiero quedarme principalmente en COP' },
        ],
      },
      {
        id: 'themes',
        question: '¿Tiene interés en algún tema de inversión específico?',
        type: 'multi',
        microLearning:
          'Los ETFs temáticos le dan exposición a tendencias específicas — IA, energía limpia, dividendos — sin tener que escoger acciones individuales.',
        options: [
          { value: 'esg', label: 'ESG / Sustentabilidad', description: 'Inversiones con impacto ambiental y social' },
          { value: 'tech', label: 'Tecnología / IA', description: 'Sector tecnológico e inteligencia artificial' },
          { value: 'income', label: 'Renta con Dividendos', description: 'Flujos de ingresos regulares' },
          { value: 'international', label: 'Mercado Internacional', description: 'Diversificación fuera de Colombia' },
          { value: 'fixed-dollar', label: 'Renta Fija / Dolarización', description: 'Protección en dólares y bonos del Tesoro' },
        ],
      },
    ],
  },
];

export interface FallbackAIQuestion {
  question: string;
  options: string[];
}

export const fallbackAIQuestions: Record<StepId, FallbackAIQuestion> = {
  objetivo: {
    question: '¿Qué describe mejor su disponibilidad para mantener esta inversión sin tocarla?',
    options: [
      'Necesito flexibilidad — podría retirarla pronto',
      'La mantendría algunos años pero con la opción de retirar',
      'La dejaría crecer durante varios años',
      'Es de muy largo plazo — no la tocaría',
    ],
  },
  finanzas: {
    question: '¿Cuál factor limita más su capacidad de invertir hoy?',
    options: [
      'Deudas o créditos pendientes',
      'Gastos fijos muy altos',
      'Ingresos variables o inestables',
      'Ninguno, tengo margen para invertir',
    ],
  },
  riesgo: {
    question: '¿Cómo reaccionaría si su portafolio cae 15% en un mes?',
    options: [
      'Vendería de inmediato para protegerme',
      'Esperaría con nerviosismo',
      'Lo vería como algo temporal',
      'Aprovecharía para comprar más',
    ],
  },
  estilo: {
    question: '¿Qué sector global le genera más confianza para invertir vía ETFs?',
    options: [
      'Tecnología e innovación',
      'Energía y recursos naturales',
      'Salud y biotecnología',
      'Empresas establecidas con dividendos',
    ],
  },
};
