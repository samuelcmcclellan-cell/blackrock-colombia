import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { RotateCcw, TrendingUp, DollarSign, BarChart3, Layers } from 'lucide-react';
import { fundMap, assetClassColors } from '../data/funds';
import type { ScoringResult } from '../engine/scoringEngine';
import { useAudio } from '../audio/useAudio';
const COLORS = ['#00A651', '#1A73E8', '#6B7280', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444'];

function formatCOP(value: number): string {
  return '$' + value.toLocaleString('es-CO');
}

function getRiskBadge(level: number): { label: string; className: string } {
  if (level <= 2) return { label: 'Conservador', className: 'bg-green-100 text-green-700' };
  if (level <= 4) return { label: 'Moderado-Bajo', className: 'bg-teal-100 text-teal-700' };
  if (level <= 6) return { label: 'Moderado', className: 'bg-blue-100 text-blue-700' };
  if (level <= 8) return { label: 'Moderado-Alto', className: 'bg-amber-100 text-amber-700' };
  return { label: 'Agresivo', className: 'bg-red-100 text-red-700' };
}

export default function ResultsPage({
  result,
  onRestart,
}: {
  result: ScoringResult;
  onRestart: () => void;
}) {
  const { portfolio, finalScores, allocations } = result;
  const audio = useAudio();

  useEffect(() => {
    audio.playSfx('results_celebrate');
    const t = setTimeout(() => audio.playStaticVoice('results_title'), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieData = useMemo(
    () =>
      allocations.map((a, i) => ({
        name: a.ticker,
        value: a.weight,
        color: COLORS[i % COLORS.length],
      })),
    [allocations]
  );

  const weightedER = useMemo(
    () =>
      allocations.reduce((sum, a) => {
        const fund = fundMap[a.ticker];
        return sum + (fund?.expenseRatio || 0) * (a.weight / 100);
      }, 0),
    [allocations]
  );

  const projectionData = useMemo(() => {
    const initial = 50_000_000;
    const years = [0, 1, 2, 3, 5, 7, 10, 15, 20];
    return years.map((y) => ({
      year: y,
      name: `Año ${y}`,
      conservador: Math.round(initial * Math.pow(1 + portfolio.expectedReturnLow / 100, y)),
      base: Math.round(initial * Math.pow(1 + portfolio.expectedReturnMid / 100, y)),
      optimista: Math.round(initial * Math.pow(1 + portfolio.expectedReturnHigh / 100, y)),
    }));
  }, [portfolio]);

  const radarData = useMemo(() => {
    // Each dimension's documented max from DimensionScores in portfolios.ts.
    // We project everything onto a 0–10 display scale so all petals are
    // visually comparable. Order is high-impact → situational → style.
    const dimensions: { key: keyof typeof finalScores; label: string; max: number }[] = [
      { key: 'riskTolerance',            label: 'Riesgo',        max: 10 },
      { key: 'timeHorizon',              label: 'Horizonte',     max: 10 },
      { key: 'volatilityComfort',        label: 'Volatilidad',   max: 5  },
      { key: 'liquidityNeed',            label: 'Liquidez',      max: 5  },
      { key: 'investmentSophistication', label: 'Sofisticación', max: 5  },
      { key: 'incomeNeed',               label: 'Renta',         max: 5  },
      { key: 'internationalInterest',    label: 'Internacional', max: 3  },
      { key: 'activePreference',         label: 'Activo',        max: 3  },
    ];
    return dimensions.map(({ key, label, max }) => {
      const raw = (finalScores as unknown as Record<string, number>)[key] || 0;
      const normalized = Math.min(10, Math.max(0, (raw / max) * 10));
      return {
        dimension: label,
        value: Math.round(normalized * 10) / 10,
        fullMark: 10,
      };
    });
  }, [finalScores]);

  const riskBadge = getRiskBadge(portfolio.riskLevel);

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
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Su Portafolio Recomendado
          </h2>
          <p className="text-co-muted">Basado en sus respuestas y perfil de inversionista</p>
        </motion.div>

        {/* 1. PORTFOLIO HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 p-8 lg:p-10 shadow-xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskBadge.className}`}>
                {riskBadge.label}
              </span>
              {result.selectedThemes.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
                  {result.selectedThemes.length} tema{result.selectedThemes.length > 1 ? 's' : ''} personalizado{result.selectedThemes.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
              {portfolio.name}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-2xl">
              {portfolio.description}
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-co-green" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">Retorno Base</p>
                </div>
                <p className="text-2xl font-bold text-white">{portfolio.expectedReturnMid}%</p>
                <p className="text-white/40 text-xs mt-0.5">anual estimado</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">Rango</p>
                </div>
                <p className="text-2xl font-bold text-white">{portfolio.expectedReturnLow}–{portfolio.expectedReturnHigh}%</p>
                <p className="text-white/40 text-xs mt-0.5">escenario conservador–optimista</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">Costo TER</p>
                </div>
                <p className="text-2xl font-bold text-white">{(weightedER * 100).toFixed(2)}%</p>
                <p className="text-white/40 text-xs mt-0.5">costo ponderado anual</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">ETFs</p>
                </div>
                <p className="text-2xl font-bold text-white">{allocations.length}</p>
                <p className="text-white/40 text-xs mt-0.5">instrumentos iShares</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. FUND ALLOCATION: Pie + Fund List */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="card p-8"
          >
            <h4 className="font-display text-lg font-bold text-gray-900 mb-6">
              Distribución del Portafolio
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`]}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center mt-3">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-co-muted">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fund Detail List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-8"
          >
            <h4 className="font-display text-lg font-bold text-gray-900 mb-6">
              Composición Detallada
            </h4>
            <div className="space-y-3">
              {allocations.map((a, i) => {
                const fund = fundMap[a.ticker];
                if (!fund) return null;
                const color = assetClassColors[fund.assetClass] || '#6B7280';
                return (
                  <div key={a.ticker} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: color + '15', color }}
                          >
                            {a.ticker}
                          </span>
                        </div>
                        <p className="text-xs text-co-muted mt-0.5 leading-tight max-w-[180px] truncate">
                          {fund.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-lg font-bold text-gray-900">{a.weight}%</p>
                      <p className="text-xs text-co-muted">TER {fund.expenseRatio}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 3. INVESTOR PROFILE: Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-8 mb-8"
        >
          <h4 className="font-display text-lg font-bold text-gray-900 mb-6">
            Perfil del Inversionista
          </h4>
          <div className="h-80 max-w-lg mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="#00A651"
                  fill="#00A651"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. GROWTH PROJECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card p-8 mb-10"
        >
          <h4 className="font-display text-lg font-bold text-gray-900 mb-1">
            Proyección de Crecimiento
          </h4>
          <p className="text-xs text-co-muted mb-6">
            Inversión inicial de {formatCOP(50_000_000)} COP — Escenarios conservador, base y optimista
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(val: number) => `$${(val / 1_000_000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCOP(value)]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="conservador" name="Conservador" stroke="#6B7280" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="base" name="Base" stroke="#00A651" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="optimista" name="Optimista" stroke="#1A73E8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 5. FOOTER */}
        <div className="text-center">
          <p className="text-xs text-co-muted max-w-xl mx-auto mb-6 leading-relaxed">
            Las proyecciones son ilustrativas y no garantizan rendimientos futuros. Este prototipo es
            exclusivamente para demostración interna y no constituye asesoría financiera ni oferta de
            productos de inversión.
          </p>
          <button onClick={onRestart} className="btn-outline gap-2">
            <RotateCcw className="w-4 h-4" />
            Reiniciar cuestionario
          </button>
        </div>
      </div>
    </section>
  );
}
