import { useState, useCallback } from 'react';
import type { StepId } from '../data/questions';
import { fallbackAIQuestions } from '../data/questions';
import type { Answers, AIModifier } from '../engine/scoringEngine';

interface AIInsightState {
  question: string;
  isLoading: boolean;
  answer: string;
  modifier: AIModifier | null;
}

export function useAIInsight() {
  const [insights, setInsights] = useState<Record<string, AIInsightState>>({});

  const generateQuestion = useCallback(
    async (stepId: StepId, allAnswers: Record<string, Answers>) => {
      setInsights((prev) => ({
        ...prev,
        [stepId]: { question: '', isLoading: true, answer: '', modifier: null },
      }));

      try {
        const response = await fetch('/api/ai-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_question',
            stepId,
            answers: allAnswers,
          }),
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        setInsights((prev) => ({
          ...prev,
          [stepId]: {
            question: data.question || fallbackAIQuestions[stepId],
            isLoading: false,
            answer: '',
            modifier: null,
          },
        }));
      } catch {
        setInsights((prev) => ({
          ...prev,
          [stepId]: {
            question: fallbackAIQuestions[stepId],
            isLoading: false,
            answer: '',
            modifier: null,
          },
        }));
      }
    },
    []
  );

  const analyzeAnswer = useCallback(
    async (stepId: StepId, userAnswer: string, allAnswers: Record<string, Answers>) => {
      setInsights((prev) => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          answer: userAnswer,
          isLoading: true,
        },
      }));

      try {
        const response = await fetch('/api/ai-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze_answer',
            stepId,
            answer: userAnswer,
            answers: allAnswers,
          }),
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const modifier: AIModifier = {
          riskSignal: data.riskSignal || 0,
          timeHorizonSignal: data.timeHorizonSignal || 0,
          behavioralNotes: data.behavioralNotes || '',
          confidenceLevel: data.confidenceLevel || 0.5,
        };

        setInsights((prev) => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            isLoading: false,
            modifier,
          },
        }));

        return modifier;
      } catch {
        const fallbackModifier: AIModifier = {
          riskSignal: 0,
          timeHorizonSignal: 0,
          behavioralNotes: '',
          confidenceLevel: 0.3,
        };

        setInsights((prev) => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            isLoading: false,
            modifier: fallbackModifier,
          },
        }));

        return fallbackModifier;
      }
    },
    []
  );

  const getModifiers = useCallback((): AIModifier[] => {
    return Object.values(insights)
      .map((i) => i.modifier)
      .filter((m): m is AIModifier => m !== null);
  }, [insights]);

  return { insights, generateQuestion, analyzeAnswer, getModifiers };
}
