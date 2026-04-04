import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  prefix?: string;
  value: string;
  suffix?: string;
  label: string;
}

const stats: StatItem[] = [
  { prefix: 'USD $', value: '3.5', suffix: 'T+', label: 'Inversiones en infraestructura local' },
  { value: '10', suffix: '+', label: 'ETFs iShares disponibles en la BVC' },
  { value: 'Millones', label: 'De inversionistas confían en BlackRock' },
];

function AnimatedCounter({ stat, inView }: { stat: StatItem; inView: boolean }) {
  const [displayed, setDisplayed] = useState('0');
  const isNumeric = !isNaN(parseFloat(stat.value));

  useEffect(() => {
    if (!inView) return;

    if (!isNumeric) {
      setDisplayed(stat.value);
      return;
    }

    const target = parseFloat(stat.value);
    const hasDecimal = stat.value.includes('.');
    const duration = 2000;
    const totalSteps = 60;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (step >= totalSteps) {
        setDisplayed(hasDecimal ? target.toFixed(1) : target.toString());
        clearInterval(timer);
      } else {
        setDisplayed(hasDecimal ? current.toFixed(1) : Math.floor(current).toString());
      }
    }, duration / totalSteps);

    return () => clearInterval(timer);
  }, [inView, stat.value, isNumeric]);

  return (
    <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
      {isNumeric ? (
        <>
          {stat.prefix}
          {displayed}
          {stat.suffix}
        </>
      ) : (
        inView ? stat.value : ''
      )}
    </span>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="overview" className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-green-50/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-gray-100/50 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight text-balance">
            Portafolios Personalizados con la Escala de BlackRock
          </h1>
          <p className="text-lg sm:text-xl text-co-muted leading-relaxed max-w-3xl mx-auto">
            Transforme BlackRock de una gestora de fondos en un motor de orientación y personalización
            de portafolios para inversionistas individuales en Colombia.
          </p>
        </motion.div>

        {/* Stats */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="card p-6 sm:p-8 text-center"
            >
              <AnimatedCounter stat={stat} inView={inView} />
              <p className="text-sm text-co-muted mt-2 leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-sm text-amber-800">
            <span className="font-bold mt-0.5 flex-shrink-0">⚠</span>
            <p>
              <strong>Prototipo conceptual — solo para demostración interna.</strong>{' '}
              Esta herramienta no constituye asesoría financiera ni oferta de productos de inversión.
              Las proyecciones son ilustrativas y no garantizan rendimientos futuros.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
