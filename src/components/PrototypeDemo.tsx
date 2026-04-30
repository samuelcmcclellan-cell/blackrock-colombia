import { useState, useCallback, useMemo, createElement, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, SkipForward, Sparkles, Loader2, Brain, Lightbulb } from 'lucide-react';
import { questionnaireSteps, type StepId, type Question } from '../data/questions';
import { useAIInsight } from '../hooks/useAIInsight';
import { runScoringEngine, applyThemeOverlaysPublic, type Answers, type ScoringResult } from '../engine/scoringEngine';
import { useAudio } from '../audio/useAudio';

function SliderInput({
  question: q,
  value,
  onChange,
}: {
  question: Question;
  value: number | undefined;
  onChange: (val: number) => void;
}) {
  const min = q.min ?? 0;
  const max = q.max ?? 100;
  const step = q.step ?? 1;
  const current = value ?? Math.round((min + max) / 2);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-3xl font-bold text-gray-900">{current}</span>
        {q.unit && <span className="text-co-muted ml-2 text-sm">{q.unit}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-co-green bg-gray-200"
      />
      <div className="flex justify-between text-xs text-co-muted">
        <span>{min} {q.unit}</span>
        <span>{max} {q.unit}</span>
      </div>
    </div>
  );
}

interface DeliberationResult {
  thinking: string[];
  selectedPortfolioId: string;
  reasoning: string;
}

function DeliberationView({
  scoringResult,
  allAnswers,
  aiModifiers,
  onComplete,
}: {
  scoringResult: ScoringResult;
  allAnswers: Record<string, Answers>;
  aiModifiers: { riskSignal?: number; timeHorizonSignal?: number; behavioralNotes?: string }[];
  onComplete: (finalResult: ScoringResult) => void;
}) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [reasoning, setReasoning] = useState('');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [phase, setPhase] = useState<'loading' | 'thinking' | 'done'>('loading');
  const hasStarted = useRef(false);
  const audio = useAudio();

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    audio.playSfx('deliberation_start');
    audio.playStaticVoice('deliberation_intro');

    const candidates = scoringResult.topCandidates.map((c) => ({
      id: c.portfolio.id,
      name: c.portfolio.name,
      description: c.portfolio.description,
      distance: c.distance,
    }));

    (async () => {
      try {
        const response = await fetch('/api/ai-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deliberate_portfolio',
            answers: allAnswers,
            candidates,
            aiModifiers,
          }),
        });

        if (!response.ok) throw new Error('API error');
        const data: DeliberationResult = await response.json();

        const steps = data.thinking?.length
          ? data.thinking
          : [
              'Analizando su perfil de riesgo y horizonte temporal...',
              'Evaluando sus preferencias de inversión...',
              'Comparando portafolios candidatos...',
              'Seleccionando la mejor opción para su perfil...',
            ];

        setThinkingSteps(steps);
        setPhase('thinking');

        // Animate steps one by one
        for (let i = 0; i < steps.length; i++) {
          await new Promise((r) => setTimeout(r, 800));
          audio.playSfxRandom(['thinking_tick_1', 'thinking_tick_2', 'thinking_tick_3']);
          setVisibleSteps(i + 1);
        }

        // Show reasoning
        await new Promise((r) => setTimeout(r, 600));
        const finalReasoning = data.reasoning || 'Este portafolio se ajusta a su perfil de inversión.';
        setReasoning(finalReasoning);
        audio.streamTTS(finalReasoning);
        setPhase('done');
        audio.playSfx('portfolio_reveal');

        // Resolve final portfolio
        await new Promise((r) => setTimeout(r, 1800));

        const chosenId = data.selectedPortfolioId;
        const validCandidate = scoringResult.topCandidates.find(
          (c) => c.portfolio.id === chosenId
        );

        if (validCandidate) {
          const finalAllocations = applyThemeOverlaysPublic(
            [...validCandidate.portfolio.allocations],
            scoringResult.selectedThemes
          );
          onComplete({
            ...scoringResult,
            portfolio: validCandidate.portfolio,
            allocations: finalAllocations,
            matchDistance: validCandidate.distance,
          });
        } else {
          onComplete(scoringResult);
        }
      } catch {
        // Fallback: show generic thinking then proceed with engine result
        const fallbackSteps = [
          'Analizando su perfil de riesgo y horizonte temporal...',
          'Evaluando sus preferencias de inversión...',
          'Comparando portafolios candidatos...',
          'Seleccionando la mejor opción para su perfil...',
        ];
        setThinkingSteps(fallbackSteps);
        setPhase('thinking');

        for (let i = 0; i < fallbackSteps.length; i++) {
          await new Promise((r) => setTimeout(r, 800));
          audio.playSfxRandom(['thinking_tick_1', 'thinking_tick_2', 'thinking_tick_3']);
          setVisibleSteps(i + 1);
        }

        await new Promise((r) => setTimeout(r, 600));
        const fallbackReasoning = 'Este portafolio se ajusta a su perfil de inversión.';
        setReasoning(fallbackReasoning);
        audio.streamTTS(fallbackReasoning);
        setPhase('done');
        audio.playSfx('portfolio_reveal');

        await new Promise((r) => setTimeout(r, 1800));
        onComplete(scoringResult);
      }
    })();
  }, [scoringResult, allAnswers, aiModifiers, onComplete, audio]);

  return (
    <div className="card p-8 sm:p-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-co-green/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-co-green" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-gray-900">
            Analizando su perfil...
          </h3>
          <p className="text-xs text-co-muted">Nuestro motor de IA está evaluando sus respuestas</p>
        </div>
      </div>

      <div className="space-y-4 min-h-[200px]">
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-co-muted py-8"
          >
            <Loader2 className="w-5 h-5 animate-spin text-co-green" />
            <span className="text-sm">Preparando análisis personalizado...</span>
          </motion.div>
        )}

        {phase !== 'loading' && thinkingSteps.map((step, i) => (
          <AnimatePresence key={i}>
            {i < visibleSteps && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-start gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="mt-1 flex-shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-co-green flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
                <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step}</p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {reasoning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 pt-5 border-t border-gray-100"
          >
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {reasoning}
            </p>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-co-green mt-4"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">Preparando su portafolio personalizado...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PrototypeDemo({
  onResult,
}: {
  onResult: (result: ScoringResult) => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, Answers>>({});
  const [aiSelectedOption, setAiSelectedOption] = useState<Record<string, string>>({});
  const [showAIQuestion, setShowAIQuestion] = useState(false);
  const [deliberationResult, setDeliberationResult] = useState<ScoringResult | null>(null);
  const [showDeliberation, setShowDeliberation] = useState(false);

  const { insights, generateQuestion, analyzeAnswer, getModifiers } = useAIInsight();
  const audio = useAudio();

  const currentStep = questionnaireSteps[currentStepIndex];
  const stepAnswers = allAnswers[currentStep.id] || {};

  // Filter visible questions based on conditionals
  const visibleQuestions = useMemo(() => {
    return currentStep.questions.filter((q) => {
      if (!q.conditionalOn) return true;
      const parentAnswer = stepAnswers[q.conditionalOn.questionId];
      if (Array.isArray(parentAnswer)) {
        return q.conditionalOn.values.some((v) => parentAnswer.includes(v));
      }
      return q.conditionalOn.values.includes(parentAnswer as string);
    });
  }, [currentStep.questions, stepAnswers]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestionInStep = currentQuestionIndex >= visibleQuestions.length - 1;
  const isLastStep = currentStepIndex >= questionnaireSteps.length - 1;
  const aiInsight = insights[currentStep.id];

  // Voice cue when transitioning into a new section
  useEffect(() => {
    const id = currentStep.id;
    if (id === 'finanzas') audio.playStaticVoice('step_finanzas');
    else if (id === 'riesgo') audio.playStaticVoice('step_riesgo');
    else if (id === 'estilo') audio.playStaticVoice('step_estilo');
  }, [currentStep.id, audio]);

  // Stream the AI-generated question aloud once it arrives.
  // The streamed question itself is the audio cue — no static "thinking" voice
  // here, which previously could overlap the streamed TTS for a doubled-voice effect.
  const lastSpokenQuestion = useRef<string>('');
  useEffect(() => {
    if (
      showAIQuestion &&
      aiInsight?.question &&
      !aiInsight.isLoading &&
      aiInsight.question !== lastSpokenQuestion.current
    ) {
      lastSpokenQuestion.current = aiInsight.question;
      audio.streamTTS(aiInsight.question);
    }
  }, [showAIQuestion, aiInsight?.question, aiInsight?.isLoading, audio]);

  const updateAnswer = useCallback(
    (questionId: string, value: string | string[] | number) => {
      setAllAnswers((prev) => ({
        ...prev,
        [currentStep.id]: {
          ...(prev[currentStep.id] || {}),
          [questionId]: value,
        },
      }));
    },
    [currentStep.id]
  );

  const startDeliberation = useCallback(() => {
    const modifiers = getModifiers();
    const scoringResult = runScoringEngine(allAnswers, modifiers);
    setDeliberationResult(scoringResult);
    setShowDeliberation(true);
  }, [allAnswers, getModifiers]);

  const goNextRef = useRef<(opt?: string) => void>(() => {});

  const goNext = useCallback((aiOptionOverride?: string) => {
    if (showAIQuestion) {
      const selected = aiOptionOverride ?? aiSelectedOption[currentStep.id] ?? '';
      if (selected.trim()) {
        analyzeAnswer(currentStep.id as StepId, selected, allAnswers);
      }
      setShowAIQuestion(false);
      setCurrentQuestionIndex(0);

      if (isLastStep) {
        startDeliberation();
      } else {
        setCurrentStepIndex((i) => i + 1);
      }
      return;
    }

    if (isLastQuestionInStep) {
      if (currentStep.hasAI) {
        setShowAIQuestion(true);
        generateQuestion(currentStep.id as StepId, allAnswers);
      } else if (isLastStep) {
        startDeliberation();
      } else {
        setCurrentStepIndex((i) => i + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [
    showAIQuestion, isLastQuestionInStep, isLastStep, currentStep, allAnswers,
    aiSelectedOption, analyzeAnswer, generateQuestion, startDeliberation,
  ]);

  // Keep a live reference so deferred timers always invoke the latest goNext —
  // the 300ms auto-advance after an answer needs the post-render version
  // (where new conditional questions are now in visibleQuestions).
  goNextRef.current = goNext;

  const handleOptionSelect = useCallback(
    (questionId: string, value: string, isMulti: boolean) => {
      audio.playSfxRandom(['option_select_1', 'option_select_2', 'option_select_3']);
      if (isMulti) {
        const current = (stepAnswers[questionId] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        updateAnswer(questionId, updated);
      } else {
        updateAnswer(questionId, value);
        setTimeout(() => goNextRef.current(), 300);
      }
    },
    [stepAnswers, updateAnswer, audio]
  );

  const handleAIOptionSelect = useCallback(
    (opt: string) => {
      audio.playSfxRandom(['option_select_1', 'option_select_2', 'option_select_3']);
      setAiSelectedOption((prev) => ({ ...prev, [currentStep.id]: opt }));
      setTimeout(() => goNextRef.current(opt), 300);
    },
    [currentStep.id, audio]
  );

  const goPrev = useCallback(() => {
    if (showAIQuestion) {
      setShowAIQuestion(false);
      return;
    }
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
      setCurrentQuestionIndex(0);
      setShowAIQuestion(false);
    }
  }, [showAIQuestion, currentQuestionIndex, currentStepIndex]);

  const handleDeliberationComplete = useCallback(
    (finalResult: ScoringResult) => {
      onResult(finalResult);
    },
    [onResult]
  );

  // Calculate overall progress
  const totalQuestions = questionnaireSteps.reduce((sum, s) => sum + s.questions.length + (s.hasAI ? 1 : 0), 0) || 1;
  let completedQuestions = 0;
  for (let s = 0; s < currentStepIndex; s++) {
    completedQuestions += questionnaireSteps[s].questions.length + (questionnaireSteps[s].hasAI ? 1 : 0);
  }
  completedQuestions += currentQuestionIndex + (showAIQuestion ? visibleQuestions.length : 0);
  const progressPercent = Math.min(100, (completedQuestions / Math.max(totalQuestions, 1)) * 100);

  // AI question "Siguiente" is disabled until an option is selected and not loading
  const aiQuestionReady = showAIQuestion && !aiInsight?.isLoading && aiInsight?.options?.length === 4;
  const aiOptionSelected = !!aiSelectedOption[currentStep.id];

  return (
    <section id="prototype" className="section-padding">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Demo: Portafolios Inteligentes
          </h2>
          <p className="text-co-muted max-w-2xl mx-auto">
            Complete el cuestionario para recibir una recomendación de portafolio personalizada
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {showDeliberation && deliberationResult ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="deliberation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* All steps completed indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {questionnaireSteps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-co-green text-white">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:inline text-xs font-medium text-co-muted">
                        {step.title}
                      </span>
                      {i < questionnaireSteps.length - 1 && (
                        <div className="w-8 h-0.5 bg-co-green" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Full progress bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
                  <div className="h-full bg-co-green rounded-full w-full" />
                </div>

                <DeliberationView
                  scoringResult={deliberationResult}
                  allAnswers={allAnswers}
                  aiModifiers={getModifiers()}
                  onComplete={handleDeliberationComplete}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
          <>
          {/* Step Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {questionnaireSteps.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-co-green text-white'
                        : isCurrent
                        ? 'bg-co-green/10 text-co-green border-2 border-co-green'
                        : 'bg-gray-100 text-co-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-medium ${
                      isCurrent ? 'text-co-green' : 'text-co-muted'
                    }`}
                  >
                    {step.title}
                  </span>
                  {i < questionnaireSteps.length - 1 && (
                    <div className={`w-8 h-0.5 ${isCompleted ? 'bg-co-green' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-co-green rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStep.id}-${currentQuestionIndex}-${showAIQuestion}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              onAnimationStart={() => audio.playSfxRandom(['step_swoosh_1', 'step_swoosh_2'])}
              className="card p-8"
            >
              {/* Step subtitle */}
              <p className="text-xs font-semibold text-co-green uppercase tracking-wider mb-4">
                {currentStep.title} — {currentStep.subtitle}
              </p>

              {showAIQuestion ? (
                /* AI QUESTION — styled like a regular MC question */
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Sparkles className="w-4 h-4 text-co-green" />
                    <span className="text-xs font-semibold text-co-green uppercase tracking-wider">
                      IA Personalizada
                    </span>
                  </div>

                  {aiInsight?.isLoading && !aiInsight.question ? (
                    <div className="flex items-center gap-3 text-co-muted py-10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Generando pregunta personalizada...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
                        {aiInsight?.question || 'Cuéntenos más sobre sus preferencias de inversión.'}
                      </h3>

                      <div className="space-y-3">
                        {(aiInsight?.options || []).map((opt, i) => {
                          const isSelected = aiSelectedOption[currentStep.id] === opt;
                          return (
                            <button
                              key={i}
                              onClick={() => handleAIOptionSelect(opt)}
                              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-co-green bg-green-50/50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className={`font-medium text-sm ${isSelected ? 'text-co-green' : 'text-gray-900'}`}>
                                  {opt}
                                </p>
                                {isSelected && <Check className="w-5 h-5 text-co-green flex-shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ) : currentQuestion ? (
                /* STANDARD QUESTION */
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {currentQuestion.microLearning && (
                    <div className="mb-6 flex gap-2.5 rounded-lg bg-co-green/5 border border-co-green/20 px-3.5 py-2.5">
                      <Lightbulb className="w-4 h-4 text-co-green flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold text-co-green">¿Sabía qué?</span>{' '}
                        {currentQuestion.microLearning}
                      </p>
                    </div>
                  )}

                  {!currentQuestion.microLearning && <div className="mb-3" />}

                  {currentQuestion.type === 'slider' && (
                    <SliderInput
                      question={currentQuestion}
                      value={stepAnswers[currentQuestion.id] as number | undefined}
                      onChange={(val) => updateAnswer(currentQuestion.id, val)}
                    />
                  )}

                  {(currentQuestion.type === 'single' || currentQuestion.type === 'multi') &&
                    currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((opt) => {
                          const isSelected = currentQuestion.type === 'multi'
                            ? ((stepAnswers[currentQuestion.id] as string[]) || []).includes(opt.value)
                            : stepAnswers[currentQuestion.id] === opt.value;

                          return (
                            <button
                              key={opt.value}
                              onClick={() =>
                                handleOptionSelect(currentQuestion.id, opt.value, currentQuestion.type === 'multi')
                              }
                              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-co-green bg-green-50/50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                {opt.icon && (
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isSelected ? 'bg-co-green/10' : 'bg-gray-100'
                                  }`}>
                                    {createElement(opt.icon, {
                                      className: `w-5 h-5 ${isSelected ? 'text-co-green' : 'text-gray-500'}`,
                                    })}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className={`font-medium text-sm ${isSelected ? 'text-co-green' : 'text-gray-900'}`}>
                                    {opt.label}
                                  </p>
                                  {opt.description && (
                                    <p className="text-xs text-co-muted mt-0.5">{opt.description}</p>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-co-green flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {currentQuestion.type === 'text' && (
                    <textarea
                      value={(stepAnswers[currentQuestion.id] as string) || ''}
                      onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder || 'Escriba su respuesta...'}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-co-green focus:border-transparent"
                    />
                  )}
                </div>
              ) : null}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={goPrev}
                  disabled={currentStepIndex === 0 && currentQuestionIndex === 0 && !showAIQuestion}
                  className="flex items-center gap-1.5 text-sm font-medium text-co-muted hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-3">
                  {showAIQuestion && (
                    <button
                      onClick={() => {
                        setShowAIQuestion(false);
                        setCurrentQuestionIndex(0);
                        if (isLastStep) {
                          startDeliberation();
                        } else {
                          setCurrentStepIndex((i) => i + 1);
                        }
                      }}
                      className="flex items-center gap-1.5 text-sm font-medium text-co-muted hover:text-gray-700 transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      Saltar
                    </button>
                  )}

                  <button
                    onClick={() => goNext()}
                    disabled={
                      showAIQuestion
                        ? aiQuestionReady && !aiOptionSelected
                        : currentQuestion &&
                          currentQuestion.type !== 'slider' &&
                          !stepAnswers[currentQuestion.id]
                    }
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    {isLastStep && (isLastQuestionInStep || showAIQuestion) ? (
                      'Ver Resultados'
                    ) : (
                      <>
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          </>
          )}
        </div>
      </div>
    </section>
  );
}
