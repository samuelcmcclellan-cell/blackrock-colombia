import { type DimensionScores, modelPortfolios, type ModelPortfolio, type PortfolioAllocation } from '../data/portfolios';
import { themeOverlays } from '../data/themes';

export type Answers = Record<string, string | string[] | number>;

export interface AIModifier {
  riskSignal?: number;
  timeHorizonSignal?: number;
  behavioralNotes?: string;
  confidenceLevel?: number;
}

const dimensionWeights: Record<keyof DimensionScores, number> = {
  riskTolerance: 3.0,
  timeHorizon: 2.5,
  incomeNeed: 1.5,
  esgPreference: 1.0,
  internationalInterest: 1.2,
  activePreference: 0.8,
  liquidityNeed: 1.5,
  investmentSophistication: 1.0,
  taxEfficiency: 0.5,
  volatilityComfort: 2.0,
  concentrationPreference: 0.8,
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function scoreObjectiveStep(answers: Answers): Partial<DimensionScores> {
  const goal = answers.goal as string;
  const partial: Partial<DimensionScores> = {};

  switch (goal) {
    case 'jubilacion': {
      const years = (answers.retirement_years as number) || 20;
      partial.timeHorizon = clamp(Math.round(years / 4), 1, 10);
      partial.riskTolerance = years > 20 ? 7 : years > 10 ? 5 : 3;
      partial.incomeNeed = years < 5 ? 4 : 1;
      break;
    }
    case 'educacion': {
      const years = (answers.education_years as number) || 10;
      partial.timeHorizon = clamp(Math.round(years / 2), 1, 10);
      partial.riskTolerance = years > 10 ? 6 : years > 5 ? 4 : 2;
      partial.incomeNeed = 1;
      break;
    }
    case 'compra': {
      const timeline = answers.purchase_timeline as string;
      const timeMap: Record<string, number> = { '1-2': 2, '3-5': 4, '5-10': 6, '10+': 8 };
      partial.timeHorizon = timeMap[timeline] || 4;
      partial.riskTolerance = partial.timeHorizon < 4 ? 3 : 5;
      partial.incomeNeed = 1;
      break;
    }
    case 'crecimiento': {
      const horizon = answers.growth_horizon as string;
      const hMap: Record<string, number> = { '1-3': 3, '3-5': 5, '5-10': 7, '10+': 9 };
      partial.timeHorizon = hMap[horizon] || 7;
      partial.riskTolerance = 7;
      partial.incomeNeed = 1;
      break;
    }
    case 'renta':
      partial.timeHorizon = 5;
      partial.riskTolerance = 4;
      partial.incomeNeed = 5;
      break;
    case 'emergencia': {
      const months = (answers.emergency_months as number) || 6;
      partial.timeHorizon = 1;
      partial.riskTolerance = 1;
      partial.liquidityNeed = 5;
      partial.incomeNeed = months > 12 ? 2 : 3;
      break;
    }
  }

  return partial;
}

function scoreFinanceStep(answers: Answers): Partial<DimensionScores> {
  const partial: Partial<DimensionScores> = {};

  // Age — supports both legacy numeric and new life-stage bucket string values
  const ageRaw = answers.age;
  let age: number;
  if (typeof ageRaw === 'string') {
    const ageBucketMap: Record<string, number> = {
      '18-25': 21, '26-35': 30, '36-45': 40, '46-55': 50, '56-65': 60, '65+': 70,
    };
    age = ageBucketMap[ageRaw] || 35;
  } else {
    age = (ageRaw as number) || 35;
  }
  partial.timeHorizon = clamp(Math.round((80 - age) / 6), 1, 10);

  // Existing investments → sophistication
  const expMap: Record<string, number> = { none: 1, savings: 2, some: 3, diversified: 5 };
  partial.investmentSophistication = expMap[answers.existing_investments as string] || 2;

  // Liquidity
  const liqMap: Record<string, number> = { critical: 5, moderate: 3, low: 2, none: 1 };
  partial.liquidityNeed = liqMap[answers.liquidity as string] || 3;

  // Sophistication
  const sophMap: Record<string, number> = { beginner: 1, basic: 2, intermediate: 3, advanced: 4, expert: 5 };
  partial.investmentSophistication = Math.max(
    partial.investmentSophistication || 1,
    sophMap[answers.sophistication as string] || 2
  );

  // Tax efficiency
  const taxMap: Record<string, number> = { not_important: 0, somewhat: 1, important: 2, critical: 3 };
  partial.taxEfficiency = taxMap[answers.tax_efficiency as string] || 0;

  // Initial investment → risk tolerance nudge
  const invMap: Record<string, number> = { under5m: -1, '5m-25m': 0, '25m-100m': 1, over100m: 2 };
  const riskNudge = invMap[answers.initial_investment as string] || 0;
  partial.riskTolerance = clamp(5 + riskNudge, 1, 10);

  return partial;
}

function scoreRiskStep(answers: Answers): Partial<DimensionScores> {
  const partial: Partial<DimensionScores> = {};

  // Drawdown reaction
  const ddMap: Record<string, number> = { sell_all: 1, sell_some: 3, hold: 6, buy_more: 9 };
  partial.riskTolerance = ddMap[answers.drawdown_reaction as string] || 5;
  partial.volatilityComfort = ddMap[answers.drawdown_reaction as string] ? Math.ceil(ddMap[answers.drawdown_reaction as string] / 2) : 3;

  // Comparison reaction
  const compMap: Record<string, number> = { frustrated: 2, curious: 4, neutral: 3, satisfied: 1 };
  partial.activePreference = compMap[answers.comparison_reaction as string] || 1;

  // Withdrawal expectation
  const withMap: Record<string, number> = { within_1y: 1, '1_3y': 3, '3_5y': 5, '5_10y': 7, over_10y: 9 };
  partial.timeHorizon = withMap[answers.withdrawal_expectation as string] || 5;

  // Check frequency
  const checkMap: Record<string, number> = { daily: 3, weekly: 2, monthly: 1, quarterly: 1, rarely: 0 };
  partial.activePreference = Math.max(
    partial.activePreference || 0,
    checkMap[answers.check_frequency as string] || 1
  );

  // Max loss tolerance
  const lossMap: Record<string, number> = { '5': 2, '10': 4, '20': 6, '30': 8, any: 10 };
  partial.volatilityComfort = Math.round(
    ((partial.volatilityComfort || 3) + (lossMap[answers.max_loss as string] || 3) / 2) / 1.5
  );

  return partial;
}

function scoreStyleStep(answers: Answers): Partial<DimensionScores> {
  const partial: Partial<DimensionScores> = {};

  // Approach
  const appMap: Record<string, number> = { passive: 0, active: 3, mix: 2, unsure: 1 };
  partial.activePreference = appMap[answers.approach as string] || 1;

  // Concentration
  const concMap: Record<string, number> = { concentrated: 3, balanced: 1, diversified: 0 };
  partial.concentrationPreference = concMap[answers.concentration as string] || 1;

  // Themes
  const themes = (answers.themes as string[]) || [];
  if (themes.includes('esg')) partial.esgPreference = 3;
  if (themes.includes('international')) partial.internationalInterest = 3;
  if (themes.includes('income')) partial.incomeNeed = clamp((partial.incomeNeed || 2) + 2, 1, 5);

  // ESG importance
  const esgMap: Record<string, number> = { not: 0, nice: 1, important: 2, critical: 3 };
  partial.esgPreference = Math.max(partial.esgPreference || 0, esgMap[answers.esg_importance as string] || 0);

  return partial;
}

function mergeDimensions(partials: Partial<DimensionScores>[]): DimensionScores {
  const defaults: DimensionScores = {
    riskTolerance: 5,
    timeHorizon: 5,
    incomeNeed: 2,
    esgPreference: 0,
    internationalInterest: 1,
    activePreference: 1,
    liquidityNeed: 3,
    investmentSophistication: 2,
    taxEfficiency: 1,
    volatilityComfort: 3,
    concentrationPreference: 1,
  };

  const accumulator: Record<string, number[]> = {};
  for (const key of Object.keys(defaults)) {
    accumulator[key] = [];
  }

  for (const p of partials) {
    for (const [key, val] of Object.entries(p)) {
      if (val !== undefined) accumulator[key].push(val);
    }
  }

  const merged = { ...defaults };
  for (const [key, vals] of Object.entries(accumulator)) {
    if (vals.length > 0) {
      (merged as Record<string, number>)[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }

  return merged;
}

function applyAIModifiers(scores: DimensionScores, modifiers: AIModifier[]): DimensionScores {
  const result = { ...scores };

  for (const mod of modifiers) {
    if (mod.riskSignal !== undefined) {
      const confidence = mod.confidenceLevel || 0.5;
      result.riskTolerance = clamp(
        result.riskTolerance + mod.riskSignal * confidence,
        1,
        10
      );
      result.volatilityComfort = clamp(
        result.volatilityComfort + (mod.riskSignal / 2) * confidence,
        1,
        5
      );
    }
    if (mod.timeHorizonSignal !== undefined) {
      const confidence = mod.confidenceLevel || 0.5;
      result.timeHorizon = clamp(
        result.timeHorizon + mod.timeHorizonSignal * confidence,
        1,
        10
      );
    }
  }

  return result;
}

function weightedEuclideanDistance(a: DimensionScores, b: DimensionScores): number {
  let sumSq = 0;
  for (const key of Object.keys(dimensionWeights) as (keyof DimensionScores)[]) {
    const weight = dimensionWeights[key];
    const diff = (a[key] || 0) - (b[key] || 0);
    sumSq += weight * diff * diff;
  }
  return Math.sqrt(sumSq);
}

function applyThemeOverlays(
  allocations: PortfolioAllocation[],
  selectedThemes: string[]
): PortfolioAllocation[] {
  if (selectedThemes.length === 0) return allocations;

  const boostMap: Record<string, number> = {};
  for (const themeId of selectedThemes) {
    const theme = themeOverlays.find((t) => t.id === themeId);
    if (theme) {
      for (const [ticker, boost] of Object.entries(theme.boosts)) {
        boostMap[ticker] = (boostMap[ticker] || 0) + boost;
      }
    }
  }

  let modified = allocations.map((a) => ({
    ...a,
    weight: a.weight + (boostMap[a.ticker] || 0),
  }));

  // Normalize to 100
  const total = modified.reduce((sum, a) => sum + a.weight, 0);
  modified = modified.map((a) => ({
    ...a,
    weight: Math.round((a.weight / total) * 100),
  }));

  // Fix rounding
  const diff = 100 - modified.reduce((sum, a) => sum + a.weight, 0);
  if (diff !== 0 && modified.length > 0) {
    modified[0].weight += diff;
  }

  return modified;
}

export { applyThemeOverlays as applyThemeOverlaysPublic };

export interface PortfolioCandidate {
  portfolio: ModelPortfolio;
  distance: number;
}

export interface ScoringResult {
  portfolio: ModelPortfolio;
  finalScores: DimensionScores;
  allocations: PortfolioAllocation[];
  matchDistance: number;
  selectedThemes: string[];
  topCandidates: PortfolioCandidate[];
}

export function runScoringEngine(
  allAnswers: Record<string, Answers>,
  aiModifiers: AIModifier[]
): ScoringResult {
  // Step 1: Score each step
  const partials = [
    scoreObjectiveStep(allAnswers.objetivo || {}),
    scoreFinanceStep(allAnswers.finanzas || {}),
    scoreRiskStep(allAnswers.riesgo || {}),
    scoreStyleStep(allAnswers.estilo || {}),
  ];

  // Step 2: Merge
  let merged = mergeDimensions(partials);

  // Step 3: Apply AI modifiers
  merged = applyAIModifiers(merged, aiModifiers);

  // Step 4: Find nearest portfolios (rank all by distance)
  const ranked: PortfolioCandidate[] = modelPortfolios
    .map((p) => ({ portfolio: p, distance: weightedEuclideanDistance(merged, p.scores) }))
    .sort((a, b) => a.distance - b.distance);

  const bestPortfolio = ranked[0].portfolio;
  const bestDistance = ranked[0].distance;
  const topCandidates = ranked.slice(0, 5);

  // Step 5: Apply theme overlays
  const selectedThemes = ((allAnswers.estilo?.themes as string[]) || []);
  const finalAllocations = applyThemeOverlays([...bestPortfolio.allocations], selectedThemes);

  return {
    portfolio: bestPortfolio,
    finalScores: merged,
    allocations: finalAllocations,
    matchDistance: bestDistance,
    selectedThemes,
    topCandidates,
  };
}
