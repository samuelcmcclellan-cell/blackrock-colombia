export const STATIC_VOICES = [
  {
    id: 'welcome',
    text: 'Bienvenido a BlackRock Personalización Directa. Comencemos a construir su portafolio ideal.',
  },
  {
    id: 'step_finanzas',
    text: 'Ahora, hablemos de su situación financiera.',
  },
  {
    id: 'step_riesgo',
    text: 'Vamos a explorar su tolerancia al riesgo.',
  },
  {
    id: 'step_estilo',
    text: 'Por último, sus preferencias de inversión.',
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
] as const;

export const SFX_LIBRARY = [
  // Variants for repeated cues — rotated to keep the soundscape organic.
  {
    id: 'option_select_1',
    prompt:
      'warm hardwood mallet softly tapping a small bronze bell, single delicate note, very brief, library quiet, gentle decay, no reverb',
    duration: 0.6,
  },
  {
    id: 'option_select_2',
    prompt:
      'soft glass orb tap, single short pure tone around 700Hz, gentle and intimate, no reverb, premium minimal',
    duration: 0.6,
  },
  {
    id: 'option_select_3',
    prompt:
      'low ceramic chime, single warm muted tone with quick fade, subtle and refined financial app confirmation',
    duration: 0.6,
  },
  {
    id: 'step_swoosh_1',
    prompt:
      'barely-there paper turn, very soft cloth swish, gentle and warm, sub-second, calm transition',
    duration: 0.6,
  },
  {
    id: 'step_swoosh_2',
    prompt:
      'subtle breath of air, soft whisper of motion, calm and ambient, brief, no impact',
    duration: 0.6,
  },
  {
    id: 'thinking_tick_1',
    prompt: 'dampened wood tap, very soft single click, sub-second, organic and quiet',
    duration: 0.5,
  },
  {
    id: 'thinking_tick_2',
    prompt: 'quiet pencil dot on paper, soft brief click, intimate and subtle',
    duration: 0.5,
  },
  {
    id: 'thinking_tick_3',
    prompt: 'muffled finger tap on felt, single soft thud, gentle and minimal',
    duration: 0.5,
  },
  // Singletons for one-shot moments — rewritten softer.
  {
    id: 'deliberation_start',
    prompt:
      'warm contemplative ambient drone, low-volume sustained pad, calm and meditative, no melody, no rhythm, gentle entry',
    duration: 1.5,
  },
  {
    id: 'portfolio_reveal',
    prompt:
      'soft warm chord, two gentle ascending notes on glass marimba, peaceful and reassuring, brief and understated, no fanfare',
    duration: 1.5,
  },
  {
    id: 'results_celebrate',
    prompt:
      'single bright but gentle bronze bell, soft warm tone with calm decay, intimate celebration, very brief and tasteful',
    duration: 1.2,
  },
] as const;

export type StaticVoiceId = (typeof STATIC_VOICES)[number]['id'];
export type SfxId = (typeof SFX_LIBRARY)[number]['id'];

export const voiceUrl = (id: StaticVoiceId) => `/audio/voice/${id}.mp3`;
export const sfxUrl = (id: SfxId) => `/audio/sfx/${id}.mp3`;
