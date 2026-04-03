import { motion } from 'framer-motion';
import { Target, Blocks, Plug } from 'lucide-react';

const pillars = [
  {
    icon: Target,
    title: 'Asignación Basada en Objetivos',
    description:
      'Portafolios construidos en torno a lo que el inversionista quiere lograr: jubilación, educación, reserva de emergencia, crecimiento.',
  },
  {
    icon: Blocks,
    title: 'Bloques de Construcción BlackRock',
    description:
      'Cada recomendación usa ETFs iShares reales disponibles en Colombia con costos transparentes.',
  },
  {
    icon: Plug,
    title: 'Diseñado para Integración',
    description:
      'Proyectado para integración futura con herramientas existentes — plataformas de corredores, apps bancarias, BVC.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Cómo Funciona
          </h2>
          <p className="text-co-muted max-w-2xl mx-auto">
            Tres pilares que hacen posible la personalización a escala
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="card p-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-co-green" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-co-muted leading-relaxed">{pillar.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
