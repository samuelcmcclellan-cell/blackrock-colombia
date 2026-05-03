export const STATIC_VOICES = [
  // Framing
  {
    id: 'welcome',
    text: 'Bienvenido a BlackRock Personalización Directa. Comencemos a construir su portafolio ideal.',
  },
  {
    id: 'ai_thinking',
    text: 'Analizando su perfil con inteligencia artificial.',
  },
  {
    id: 'deliberation_intro',
    text: 'Estamos analizando su perfil completo para encontrar el portafolio ideal.',
  },
  {
    id: 'results_title',
    text: 'Su portafolio recomendado.',
  },
  {
    id: 'results_subtitle',
    text: 'Basado en sus respuestas y perfil de inversionista.',
  },
  {
    id: 'error_generic',
    text: 'Lo sentimos, ocurrió un problema. Por favor intente nuevamente.',
  },

  // Per-question voices — id matches `q_<question.id>` so PrototypeDemo can
  // resolve the voice automatically when currentQuestion changes.
  {
    id: 'q_goal',
    text: '¿Cuál es su principal motivación para invertir?',
  },
  {
    id: 'q_retirement_years',
    text: '¿Cuántos años faltan para su jubilación?',
  },
  {
    id: 'q_education_years',
    text: '¿En cuántos años necesitará los fondos para educación?',
  },
  {
    id: 'q_purchase_timeline',
    text: '¿En cuántos años planea realizar esta compra?',
  },
  {
    id: 'q_growth_horizon',
    text: '¿Cuál es su horizonte de inversión para crecimiento?',
  },
  {
    id: 'q_income_frequency',
    text: '¿Con qué frecuencia necesita recibir ingresos?',
  },
  {
    id: 'q_emergency_months',
    text: '¿Cuántos meses de gastos quiere cubrir con su reserva?',
  },
  {
    id: 'q_age',
    text: '¿En qué etapa de vida se encuentra?',
  },
  {
    id: 'q_existing_investments',
    text: '¿Tiene inversiones actualmente?',
  },
  {
    id: 'q_liquidity',
    text: '¿Qué tan importante es poder retirar su dinero rápidamente?',
  },
  {
    id: 'q_drawdown_reaction',
    text: 'Si su portafolio cayera un veinte por ciento en un mes, ¿qué haría?',
  },
  {
    id: 'q_max_loss',
    text: '¿Cuál es la pérdida máxima que toleraría en un año antes de cambiar su estrategia?',
  },
  {
    id: 'q_etf_familiarity',
    text: '¿Qué tan familiar se siente con los ETFs?',
  },
  {
    id: 'q_passive_active_pref',
    text: '¿Qué enfoque prefiere para construir su portafolio?',
  },
  {
    id: 'q_currency_comfort',
    text: '¿Qué tan cómodo se siente invirtiendo en ETFs denominados en dólares?',
  },
  {
    id: 'q_themes',
    text: '¿Tiene interés en algún tema de inversión específico?',
  },
] as const;

// Sparse SFX: only the three dramatic moments. Click / transition sounds were
// dropped — visual feedback (button highlight, motion animation) is sufficient
// and the previous SFX felt mechanical at the rate they were firing.
// Prompts use real musical-instrument language because ElevenLabs sound
// generation renders those more cleanly than abstract "chime / whoosh" prompts.
export const SFX_LIBRARY = [
  {
    id: 'deliberation_start',
    prompt:
      'single soft piano note held in the low-mid register, warm sustained tone, gentle and contemplative, slow attack, no rhythm, no melody',
    duration: 1.5,
  },
  {
    id: 'portfolio_reveal',
    prompt:
      'two soft piano notes ascending a major third, warm and peaceful resolution, brief and understated, no decay artifacts, no fanfare',
    duration: 1.5,
  },
  {
    id: 'results_celebrate',
    prompt:
      'single warm glockenspiel note, soft bright tone with gentle decay, intimate and tasteful, very brief',
    duration: 1.0,
  },
] as const;

export type StaticVoiceId = (typeof STATIC_VOICES)[number]['id'];
export type SfxId = (typeof SFX_LIBRARY)[number]['id'];

export const voiceUrl = (id: StaticVoiceId) => `/audio/voice/${id}.mp3`;
export const sfxUrl = (id: SfxId) => `/audio/sfx/${id}.mp3`;
