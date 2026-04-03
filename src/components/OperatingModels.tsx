import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ChevronDown, Check } from 'lucide-react';

const comparisonRows = [
  { label: 'Experiencia de Intake', smart: 'Cuestionario adaptativo + IA', ai: 'Conversación natural con LLM' },
  { label: 'Menú de Portafolios', smart: '15+ portafolios modelo', ai: 'Ilimitado (dinámico)' },
  { label: 'Bloques de Construcción', smart: 'ETFs iShares Colombia', ai: 'ETFs + optimización' },
  { label: 'Personalización', smart: 'Alta (multidimensional)', ai: 'Máxima (individual)' },
  { label: 'Dependencia de IA', smart: 'Moderada (3 prompts)', ai: 'Total' },
];

export default function OperatingModels() {
  const [aiModelExpanded, setAiModelExpanded] = useState(false);

  return (
    <section id="models" className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Modelos Operativos
          </h2>
          <p className="text-co-muted max-w-2xl mx-auto">
            Dos caminos hacia la personalización — desde ejecución inmediata hasta visión futura
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          {/* SPOTLIGHT: Portafolios Inteligentes — takes 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 relative"
          >
            <div className="card p-8 lg:p-10 border-2 border-co-green bg-gradient-to-br from-green-50/30 to-white shadow-lg">
              {/* Badge */}
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-co-green text-white shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Demo Interactiva
                </span>
              </div>

              <div className="flex items-start gap-4 mb-6 mt-2">
                <div className="w-12 h-12 rounded-xl bg-co-green/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-co-green" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-gray-900">
                    Portafolios Inteligentes
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Complejidad: Media-Alta</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">3–6 meses</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Costo: Significativo</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                Cuestionario adaptativo de 12+ etapas con 3 prompts de IA para insights en texto abierto
                &rarr; motor de puntuación multifactorial &rarr; uno de 15+ portafolios modelo construidos
                a partir de ETFs iShares reales. Overlays temáticos opcionales.
              </p>

              <ul className="space-y-3">
                {[
                  'Preguntas adaptativas que cambian según respuestas anteriores',
                  '3 momentos de IA generativa para preguntas abiertas personalizadas',
                  'Motor de scoring multidimensional (riesgo, horizonte, ESG, etc.)',
                  'Biblioteca de 15+ portafolios modelo usando ETFs iShares reales',
                  'Overlays temáticos: ESG, Tecnología, Renta, Internacional, Dolarización',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-co-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href="#prototype"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('prototype')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="btn-primary"
                >
                  Ver Demo Interactiva
                </a>
              </div>
            </div>
          </motion.div>

          {/* SECONDARY: Motor con IA — takes 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-2"
          >
            <div className="card p-8 h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900">
                    Motor de Portafolios con IA
                  </h3>
                  <p className="text-xs text-co-muted mt-1">Visión futura</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">Complejidad: Muy Alta</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">6–12 meses</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Mayor inversión</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Motor conversacional alimentado por LLM que perfila cada inversionista a través de
                diálogo natural, construye portafolios a medida dinámicamente y permanece comprometido
                post-inversión.
              </p>

              <button
                onClick={() => setAiModelExpanded(!aiModelExpanded)}
                className="flex items-center gap-1.5 text-sm font-medium text-co-muted hover:text-gray-700 transition-colors mb-4"
              >
                {aiModelExpanded ? 'Ocultar' : 'Ver'} detalles
                <ChevronDown className={`w-4 h-4 transition-transform ${aiModelExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {aiModelExpanded && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5 overflow-hidden"
                  >
                    {[
                      'Conversación natural en español con LLM entrenado',
                      'Construcción dinámica de portafolio sin plantillas fijas',
                      'Chatbot post-inversión para dudas y orientación',
                      'Agente de IA para alertas, rebalanceo e insights de mercado',
                      'Integración futura con APIs de corredores para ejecución',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 font-medium text-co-muted w-1/3">Comparación</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-900 bg-green-50/60 w-1/3">
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-co-green" />
                      Portafolios Inteligentes
                    </span>
                  </th>
                  <th className="text-left px-6 py-4 font-medium text-gray-700 w-1/3">Motor con IA</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={i < comparisonRows.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-6 py-4 text-co-muted font-medium">{row.label}</td>
                    <td className="px-6 py-4 text-gray-900 bg-green-50/30">{row.smart}</td>
                    <td className="px-6 py-4 text-gray-600">{row.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
