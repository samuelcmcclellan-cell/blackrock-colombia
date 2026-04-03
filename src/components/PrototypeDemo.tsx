import { useState, useCallback, useMemo, createElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, SkipForward, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { questionnaireSteps, type StepId, type Question } from '../data/questions';
import { useAIInsight } from '../hooks/useAIInsight';
import { runScoringEngine, type Answers, type ScoringResult } from '../engine/scoringEngine';
import ResultsPage from './ResultsPage';

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

export default function PrototypeDemo() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, Answers>>({});
  const [aiTextAnswers, setAiTextAnswers] = useState<Record<string, string>>({});
  const [showAIQuestion, setShowAIQuestion] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const { insights, generateQuestion, analyzeAnswer, getModifiers } = useAIInsight();

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

  const handleOptionSelect = useCallback(
    (questionId: string, value: string, isMulti: boolean) => {
      if (isMulti) {
        const current = (stepAnswers[questionId] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        updateAnswer(questionId, updated);
      } else {
        updateAnswer(questionId, value);
        // Auto-advance for single select
        setTimeout(() => goNext(), 300);
      }
    },
    [stepAnswers, updateAnswer]
  );

  const goNext = useCallback(() => {
    if (showAIQuestion) {
      // Submit AI answer and advance to next step
      const aiText = aiTextAnswers[currentStep.id] || '';
      if (aiText.trim()) {
        analyzeAnswer(currentStep.id as StepId, aiText, allAnswers);
      }
      setShowAIQuestion(false);
      setCurrentQuestionIndex(0);

      if (isLastStep) {
        // Run scoring engine
        const modifiers = getModifiers();
        const scoringResult = runScoringEngine(allAnswers, modifiers);
        setResult(scoringResult);
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
        const modifiers = getModifiers();
        const scoringResult = runScoringEngine(allAnswers, modifiers);
        setResult(scoringResult);
      } else {
        setCurrentStepIndex((i) => i + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [
    showAIQuestion, isLastQuestionInStep, isLastStep, currentStep, allAnswers,
    aiTextAnswers, analyzeAnswer, generateQuestion, getModifiers,
  ]);

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

  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setCurrentQuestionIndex(0);
    setAllAnswers({});
    setAiTextAnswers({});
    setShowAIQuestion(false);
    setResult(null);
  }, []);

  if (result) {
    return <ResultsPage result={result} onRestart={handleRestart} />;
  }

  // Calculate overall progress
  const totalQuestions = questionnaireSteps.reduce((sum, s) => sum + s.questions.length + (s.hasAI ? 1 : 0), 0) || 1;
  let completedQuestions = 0;
  for (let s = 0; s < currentStepIndex; s++) {
    completedQuestions += questionnaireSteps[s].questions.length + (questionnaireSteps[s].hasAI ? 1 : 0);
  }
  completedQuestions += currentQuestionIndex + (showAIQuestion ? visibleQuestions.length : 0);
  const progressPercent = Math.min(100, (completedQuestions / Math.max(totalQuestions, 1)) * 100);

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
              className="card p-8"
            >
              {/* Step subtitle */}
              <p className="text-xs font-semibold text-co-green uppercase tracking-wider mb-4">
                {currentStep.title} — {currentStep.subtitle}
              </p>

              {showAIQuestion ? (
                /* AI QUESTION */
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-co-green" />
                    <span className="text-sm font-medium text-co-green">Pregunta personalizada con IA</span>
                  </div>

                  {aiInsight?.isLoading && !aiInsight.question ? (
                    <div className="flex items-center gap-3 text-co-muted py-8">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Generando pregunta personalizada...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
                        <MessageSquare className="w-5 h-5 text-co-green inline mr-2 -mt-0.5" />
                        {aiInsight?.question || 'Cuéntenos más sobre sus expectativas de inversión.'}
                      </h3>

                      <textarea
                        value={aiTextAnswers[currentStep.id] || ''}
                        onChange={(e) =>
                          setAiTextAnswers((prev) => ({ ...prev, [currentStep.id]: e.target.value }))
                        }
                        placeholder="Escriba su respuesta aquí..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-co-green focus:border-transparent"
                      />
                    </>
                  )}
                </div>
              ) : currentQuestion ? (
                /* STANDARD QUESTION */
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

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
                          const modifiers = getModifiers();
                          setResult(runScoringEngine(allAnswers, modifiers));
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
                    onClick={goNext}
                    disabled={
                      !showAIQuestion &&
                      currentQuestion &&
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
        </div>
      </div>
    </section>
  );
}
