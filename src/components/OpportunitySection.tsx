import { motion } from 'framer-motion';
import { AlertTriangle, Zap } from 'lucide-react';

const opportunity = [
  'Los inversionistas individuales quieren orientación personalizada pero no alcanzan los mínimos de banca privada',
  'Las herramientas existentes ofrecen filtros de productos, no construcción de portafolios personalizados',
  'Competidores están corriendo para dominar la capa de personalización — Bancolombia, Davivienda Corredores, Skandia, Nu Colombia',
  'BlackRock es la gestora más grande del mundo pero para el inversionista colombiano directo se queda a nivel de producto',
];

const advantage = [
  'Línea de ETFs iShares más completa disponible en el Mercado Global Colombiano',
  'Acceso al liderazgo de pensamiento y equipos de gestión de BlackRock',
  'Infraestructura existente de portafolios modelo y primer ETF de la bolsa colombiana (ICOLCAP)',
  'Marca de confianza con presencia global y credibilidad institucional',
];

export default function OpportunitySection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            El Caso de Negocio
          </h2>
          <p className="text-co-muted max-w-2xl mx-auto">
            Por qué BlackRock necesita moverse ahora en personalización para el mercado colombiano
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Opportunity */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900">La Oportunidad</h3>
            </div>
            <ul className="space-y-4">
              {opportunity.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                  <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Advantage */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-co-green" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900">La Ventaja BlackRock</h3>
            </div>
            <ul className="space-y-4">
              {advantage.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-co-green mt-2" />
                  <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
