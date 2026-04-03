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
  {
    id: 'objetivo',
    title: 'Objetivo',
    subtitle: 'Cuéntenos sobre su meta de inversión',
    hasAI: false,
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
        question: '¿Cuál es su edad?',
        type: 'slider',
        min: 18,
        max: 80,
        step: 1,
        unit: 'años',
      },
      {
        id: 'existing_investments',
        question: '¿Tiene inversiones actualmente?',
        type: 'single',
        options: [
          { value: 'none', label: 'No, esta sería mi primera inversión' },
          { value: 'savings', label: 'Solo cuentas de ahorro o CDTs' },
          { value: 'some', label: 'Sí, en fondos o acciones' },
          { value: 'diversified', label: 'Sí, un portafolio diversificado' },
        ],
      },
      {
        id: 'account_type',
        question: '¿Dónde planea invertir?',
        type: 'single',
        options: [
          { value: 'brokerage', label: 'Cuenta de corretaje' },
          { value: 'collective', label: 'Fondo de inversión colectiva' },
          { value: 'digital', label: 'Cuenta de banco digital' },
          { value: 'unsure', label: 'No sé aún' },
        ],
      },
      {
        id: 'initial_investment',
        question: '¿Cuánto planea invertir inicialmente?',
        type: 'single',
        options: [
          { value: 'under5m', label: 'Hasta $5.000.000' },
          { value: '5m-25m', label: '$5.000.000 – $25.000.000' },
          { value: '25m-100m', label: '$25.000.000 – $100.000.000' },
          { value: 'over100m', label: '$100.000.000+' },
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
      {
        id: 'sophistication',
        question: '¿Cómo describiría su conocimiento de inversiones?',
        type: 'single',
        options: [
          { value: 'beginner', label: 'Principiante — estoy empezando a aprender' },
          { value: 'basic', label: 'Básico — conozco CDTs y fondos' },
          { value: 'intermediate', label: 'Intermedio — entiendo ETFs y diversificación' },
          { value: 'advanced', label: 'Avanzado — analizo mercados activamente' },
          { value: 'expert', label: 'Experto — experiencia profesional en finanzas' },
        ],
      },
      {
        id: 'tax_efficiency',
        question: '¿Qué tan importante es la eficiencia tributaria en sus inversiones?',
        type: 'single',
        options: [
          { value: 'not_important', label: 'No es algo que considero' },
          { value: 'somewhat', label: 'Lo considero pero no es prioridad' },
          { value: 'important', label: 'Es un factor importante en mis decisiones' },
          { value: 'critical', label: 'Es fundamental — optimizo activamente' },
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
        id: 'comparison_reaction',
        question: 'Un amigo ganó 30% este año mientras usted ganó 10%. ¿Cómo reacciona?',
        type: 'single',
        options: [
          { value: 'frustrated', label: 'Frustrado — debería cambiar mi estrategia' },
          { value: 'curious', label: 'Curioso — investigaría qué hizo diferente' },
          { value: 'neutral', label: 'Tranquilo — cada quien tiene su estrategia' },
          { value: 'satisfied', label: 'Satisfecho — 10% es un buen retorno' },
        ],
      },
      {
        id: 'withdrawal_expectation',
        question: '¿Cuándo espera necesitar retirar dinero de sus inversiones?',
        type: 'single',
        options: [
          { value: 'within_1y', label: 'Dentro de 1 año' },
          { value: '1_3y', label: 'En 1-3 años' },
          { value: '3_5y', label: 'En 3-5 años' },
          { value: '5_10y', label: 'En 5-10 años' },
          { value: 'over_10y', label: 'Más de 10 años' },
        ],
      },
      {
        id: 'check_frequency',
        question: '¿Con qué frecuencia revisaría su portafolio?',
        type: 'single',
        options: [
          { value: 'daily', label: 'Diariamente' },
          { value: 'weekly', label: 'Semanalmente' },
          { value: 'monthly', label: 'Mensualmente' },
          { value: 'quarterly', label: 'Trimestralmente' },
          { value: 'rarely', label: 'Casi nunca — confío en la estrategia' },
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
  {
    id: 'estilo',
    title: 'Estilo',
    subtitle: 'Sus preferencias de inversión',
    hasAI: true,
    questions: [
      {
        id: 'approach',
        question: '¿Qué enfoque de inversión prefiere?',
        type: 'single',
        options: [
          { value: 'passive', label: 'Indexado / Pasivo', description: 'Replicar el mercado con costos bajos' },
          { value: 'active', label: 'Activo', description: 'Buscar superar al mercado con gestión profesional' },
          { value: 'mix', label: 'Combinación', description: 'Base indexada con toques de gestión activa' },
          { value: 'unsure', label: 'No estoy seguro', description: 'Necesito más orientación' },
        ],
      },
      {
        id: 'concentration',
        question: '¿Prefiere un portafolio concentrado o diversificado?',
        type: 'single',
        options: [
          { value: 'concentrated', label: 'Concentrado', description: 'Pocas posiciones con mayor convicción' },
          { value: 'balanced', label: 'Balanceado', description: 'Diversificación moderada' },
          { value: 'diversified', label: 'Muy Diversificado', description: 'Máxima diversificación global' },
        ],
      },
      {
        id: 'themes',
        question: '¿Tiene interés en algún tema de inversión específico?',
        type: 'multi',
        options: [
          { value: 'esg', label: 'ESG / Sustentabilidad', description: 'Inversiones con impacto ambiental y social' },
          { value: 'tech', label: 'Tecnología / IA', description: 'Sector tecnológico e inteligencia artificial' },
          { value: 'income', label: 'Renta con Dividendos', description: 'Flujos de ingresos regulares' },
          { value: 'international', label: 'Mercado Internacional', description: 'Diversificación fuera de Colombia' },
          { value: 'fixed-dollar', label: 'Renta Fija / Dolarización', description: 'Protección en dólares y bonos del Tesoro' },
        ],
      },
      {
        id: 'esg_importance',
        question: '¿Qué tan importante son los criterios ESG para usted?',
        type: 'single',
        options: [
          { value: 'not', label: 'No los considero' },
          { value: 'nice', label: 'Es un plus pero no determinante' },
          { value: 'important', label: 'Influye en mis decisiones de inversión' },
          { value: 'critical', label: 'Es un criterio fundamental' },
        ],
      },
    ],
  },
];

export const fallbackAIQuestions: Record<StepId, string> = {
  objetivo: '',
  finanzas: '¿Hay algún factor financiero personal que crea que debería influir en cómo construimos su portafolio? Por ejemplo, deudas actuales, ingresos variables, o planes financieros próximos.',
  riesgo: 'Piense en la peor experiencia financiera que ha tenido. ¿Cómo reaccionó y qué aprendió sobre su tolerancia al riesgo?',
  estilo: '¿Hay algún tipo de empresa, sector o tendencia global en la que crea firmemente y que le gustaría reflejar en su portafolio?',
};
