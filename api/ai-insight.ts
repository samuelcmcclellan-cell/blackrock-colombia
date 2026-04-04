import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const systemPrompt = `Eres un asesor financiero experto especializado en el mercado colombiano.
Respondes siempre en español colombiano profesional.
Conoces los ETFs iShares disponibles en la Bolsa de Valores de Colombia (BVC) y el Mercado Global Colombiano.
Entiendes el contexto fiscal colombiano, las pensiones obligatorias, los CDTs, y las opciones de inversión disponibles para inversionistas individuales.
Tu objetivo es hacer una pregunta perspicaz que revele las verdaderas preferencias y tolerancia al riesgo del inversionista.
Sé conciso y directo. No uses jerga innecesaria.`;

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  opts?: { temperature?: number; max_tokens?: number }
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-nano',
      messages,
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.max_tokens ?? 300,
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
        finanzas: 'Genera una pregunta corta sobre la situación financiera del inversionista. Temas posibles: deudas actuales, ingresos en COP, o planes financieros próximos en Colombia.',
        riesgo: 'Genera una pregunta corta que revele la verdadera tolerancia al riesgo. Usa un escenario realista relacionado con el mercado colombiano o latinoamericano.',
        estilo: 'Genera una pregunta corta sobre las preferencias de inversión o convicciones del inversionista para personalizar mejor su portafolio.',
      };

      const userPrompt = `Contexto de respuestas anteriores del inversionista:
${contextSummary}

${stepContextMap[stepId] || 'Genera una pregunta relevante sobre inversiones.'}

INSTRUCCIONES EXACTAS:
- La pregunta debe tener MÁXIMO 15 palabras
- Genera EXACTAMENTE 4 opciones de respuesta breves y claras en español
- Las opciones deben ser concisas (máximo 8 palabras cada una)
- Devuelve SOLO un JSON válido con este formato exacto, sin ningún texto adicional:
{"question": "pregunta aquí", "options": ["opción 1", "opción 2", "opción 3", "opción 4"]}`;

      const raw = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      try {
        const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.status(200).json({
          question: parsed.question || '',
          options: Array.isArray(parsed.options) ? parsed.options : [],
        });
      } catch {
        return res.status(200).json({ question: raw.trim(), options: [] });
      }
    }

    if (action === 'analyze_answer') {
      const analysisPrompt = `El inversionista seleccionó una opción de respuesta a una pregunta sobre ${stepId}.

Opción seleccionada: "${answer}"

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

    if (action === 'deliberate_portfolio') {
      const { candidates, aiModifiers } = req.body;

      const candidateSummary = (candidates || [])
        .map(
          (c: { id: string; name: string; description: string; distance: number }, i: number) =>
            `${i + 1}. ${c.name} (id: ${c.id}) — ${c.description} [distancia: ${c.distance.toFixed(2)}]`
        )
        .join('\n');

      const answerSummary = Object.entries(answers || {})
        .map(([step, stepAnswers]) => `${step}: ${JSON.stringify(stepAnswers)}`)
        .join('\n');

      const modifierSummary = (aiModifiers || [])
        .map((m: { riskSignal?: number; timeHorizonSignal?: number; behavioralNotes?: string }) =>
          `riskSignal: ${m.riskSignal}, timeHorizonSignal: ${m.timeHorizonSignal}, notas: ${m.behavioralNotes || 'N/A'}`
        )
        .join('\n');

      const deliberationPrompt = `Eres un asesor financiero senior en Colombia decidiendo qué portafolio de inversión recomendar.

Respuestas del inversionista:
${answerSummary}

Señales del análisis de IA:
${modifierSummary}

Portafolios candidatos (ordenados por compatibilidad):
${candidateSummary}

Analiza el perfil completo del inversionista y delibera sobre cuál portafolio se ajusta mejor.

Responde SOLO con un JSON válido con este formato exacto:
{
  "thinking": [
    "paso de deliberación 1 en español (máx 20 palabras)",
    "paso de deliberación 2 en español (máx 20 palabras)",
    "paso de deliberación 3 en español (máx 20 palabras)",
    "paso de deliberación 4 en español (máx 20 palabras)"
  ],
  "selectedPortfolioId": "id del portafolio elegido",
  "reasoning": "explicación final de 1-2 oraciones en español de por qué este portafolio es el mejor para este inversionista"
}

REGLAS:
- Los pasos de deliberación deben ser observaciones específicas sobre ESTE inversionista (horizonte, tolerancia, preferencias)
- Elige uno de los portafolios candidatos proporcionados
- El razonamiento final debe ser personalizado y convincente
- Todo en español colombiano profesional`;

      const raw = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: deliberationPrompt },
        ],
        { temperature: 0.4, max_tokens: 500 }
      );

      try {
        const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.status(200).json({
          thinking: Array.isArray(parsed.thinking) ? parsed.thinking : [],
          selectedPortfolioId: parsed.selectedPortfolioId || '',
          reasoning: parsed.reasoning || '',
        });
      } catch {
        return res.status(200).json({
          thinking: [],
          selectedPortfolioId: '',
          reasoning: '',
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('AI Insight error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
