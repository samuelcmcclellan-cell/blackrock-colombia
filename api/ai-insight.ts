import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const systemPrompt = `Eres un asesor financiero experto especializado en el mercado colombiano.
Respondes siempre en español colombiano profesional.
Conoces los ETFs iShares disponibles en la Bolsa de Valores de Colombia (BVC) y el Mercado Global Colombiano.
Entiendes el contexto fiscal colombiano, las pensiones obligatorias, los CDTs, y las opciones de inversión disponibles para inversionistas individuales.
Tu objetivo es hacer una pregunta perspicaz que revele las verdaderas preferencias y tolerancia al riesgo del inversionista.
Sé conciso y directo. No uses jerga innecesaria.`;

async function callOpenAI(messages: Array<{ role: string; content: string }>) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { action, stepId, answers, answer } = req.body;

    if (action === 'generate_question') {
      const contextSummary = Object.entries(answers || {})
        .map(([step, stepAnswers]) => `${step}: ${JSON.stringify(stepAnswers)}`)
        .join('\n');

      const stepContextMap: Record<string, string> = {
        finanzas: 'Genera una pregunta abierta sobre la situación financiera del inversionista que nos ayude a entender factores no cubiertos por las preguntas estándar. Considera su contexto colombiano (deudas, ingresos en COP, planes financieros).',
        riesgo: 'Genera una pregunta abierta que revele la verdadera tolerancia al riesgo del inversionista. Usa un escenario realista relacionado con el mercado colombiano o eventos recientes.',
        estilo: 'Genera una pregunta abierta sobre las preferencias de inversión, convicciones o visión del mundo del inversionista que nos ayude a personalizar mejor su portafolio.',
      };

      const userPrompt = `Contexto de respuestas anteriores del inversionista:
${contextSummary}

${stepContextMap[stepId] || 'Genera una pregunta relevante.'}

Responde SOLO con la pregunta, sin explicaciones adicionales. Máximo 2 oraciones.`;

      const question = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      return res.status(200).json({ question: question.trim() });
    }

    if (action === 'analyze_answer') {
      const analysisPrompt = `El inversionista respondió a una pregunta abierta sobre ${stepId}.

Respuesta del inversionista: "${answer}"

Contexto previo: ${JSON.stringify(answers)}

Analiza esta respuesta y devuelve un JSON con:
- riskSignal: número entre -3 y 3 (negativo = más conservador, positivo = más agresivo)
- timeHorizonSignal: número entre -3 y 3 (negativo = corto plazo, positivo = largo plazo)
- behavioralNotes: texto breve en español con observaciones sobre el perfil del inversionista
- confidenceLevel: número entre 0 y 1 indicando qué tan seguro estás del análisis

Responde SOLO con el JSON, sin texto adicional.`;

      const analysisStr = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt },
      ]);

      try {
        const cleaned = analysisStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleaned);
        return res.status(200).json(analysis);
      } catch {
        return res.status(200).json({
          riskSignal: 0,
          timeHorizonSignal: 0,
          behavioralNotes: 'No se pudo analizar la respuesta.',
          confidenceLevel: 0.3,
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('AI Insight error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
