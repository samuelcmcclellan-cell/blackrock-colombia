import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { RotateCcw, TrendingUp, Shield, DollarSign, BarChart3 } from 'lucide-react';
import { fundMap, assetClassColors } from '../data/funds';
import type { ScoringResult } from '../engine/scoringEngine';

const COLORS = ['#00A651', '#1A73E8', '#6B7280', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444'];

function formatCOP(value: number): string {
  return '$' + value.toLocaleString('es-CO');
}

function RiskMeter({ level }: { level: number }) {
  const segments = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      {segments.map((seg) => (
        <div
          key={seg}
          className={`h-8 flex-1 rounded-sm transition-colors ${
            seg <= level
              ? seg <= 3
                ? 'bg-green-400'
                : seg <= 6
                ? 'bg-yellow-400'
                : seg <= 8
                ? 'bg-orange-400'
                : 'bg-red-400'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function ResultsPage({
  result,
  onRestart,
}: {
  result: ScoringResult;
  onRestart: () => void;
}) {
  const { portfolio, finalScores, allocations } = result;

  // Pie chart data
  const pieData = useMemo(
    () =>
      allocations.map((a, i) => ({
        name: a.ticker,
        fullName: fundMap[a.ticker]?.name || a.ticker,
        value: a.weight,
        color: COLORS[i % COLORS.length],
      })),
    [allocations]
  );

  // Weighted expense ratio
  const weightedER = useMemo(
    () =>
      allocations.reduce((sum, a) => {
        const fund = fundMap[a.ticker];
        return sum + (fund?.expenseRatio || 0) * (a.weight / 100);
      }, 0),
    [allocations]
  );

  // Projection data
  const projectionData = useMemo(() => {
    const initial = 50_000_000; // $50M COP
    const years = [0, 1, 2, 3, 5, 7, 10, 15, 20];
    return years.map((y) => ({
      year: y,
      name: `Año ${y}`,
      conservador: Math.round(initial * Math.pow(1 + portfolio.expectedReturnLow / 100, y)),
      base: Math.round(initial * Math.pow(1 + portfolio.expectedReturnMid / 100, y)),
      optimista: Math.round(initial * Math.pow(1 + portfolio.expectedReturnHigh / 100, y)),
    }));
  }, [portfolio]);

  // Radar data
  const radarData = useMemo(() => {
    const labels: Record<string, string> = {
      riskTolerance: 'Tolerancia al Riesgo',
      timeHorizon: 'Horizonte',
      incomeNeed: 'Necesidad de Renta',
      esgPreference: 'ESG',
      internationalInterest: 'Internacional',
      liquidityNeed: 'Liquidez',
      investmentSophistication: 'Sofisticación',
      volatilityComfort: 'Volatilidad',
    };
    return Object.entries(labels).map(([key, label]) => ({
      dimension: label,
      value: Math.round(((finalScores as unknown as Record<string, number>)[key] || 0) * 10) / 10,
      fullMark: 10,
    }));
  }, [finalScores]);

  return (
    <section id="prototype" className="section-padding">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Su Portafolio Recomendado
          </h2>
          <p className="text-co-muted">Basado en sus respuestas y perfil de inversionista</p>
        </motion.div>

        {/* Portfolio Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-gray-900">{portfolio.name}</h3>
              <p className="text-sm text-co-muted mt-1 max-w-xl">{portfolio.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-co-muted uppercase tracking-wider mb-1">Retorno Esperado</p>
                <p className="text-xl font-bold text-co-green">{portfolio.expectedReturnMid}% <span className="text-sm font-normal text-co-muted">anual</span></p>
              </div>
            </div>
          </div>

          {/* Risk Meter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Nivel de Riesgo</span>
              <span className="text-sm font-bold text-gray-900">{portfolio.riskLevel}/10</span>
            </div>
            <RiskMeter level={portfolio.riskLevel} />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-co-muted">Conservador</span>
              <span className="text-xs text-co-muted">Agresivo</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-co-green" />
              </div>
              <div>
                <p className="text-xs text-co-muted">Retorno Rango</p>
                <p className="text-sm font-semibold">{portfolio.expectedReturnLow}% – {portfolio.expectedReturnHigh}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-co-muted">Costo Ponderado</p>
                <p className="text-sm font-semibold">{(weightedER * 100).toFixed(2)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-co-muted">ETFs en Portafolio</p>
                <p className="text-sm font-semibold">{allocations.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-co-muted">Temas Aplicados</p>
                <p className="text-sm font-semibold">{result.selectedThemes.length || 'Ninguno'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-8"
          >
            <h4 className="font-display text-lg font-bold text-gray-900 mb-6">Distribución del Portafolio</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-co-muted">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card p-8"
          >
            <h4 className="font-display text-lg font-bold text-gray-900 mb-6">Perfil del Inversionista</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
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
        </div>

        {/* Projection Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="card p-8 mb-8"
        >
          <h4 className="font-display text-lg font-bold text-gray-900 mb-2">Proyección de Crecimiento</h4>
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
                  formatter={(value: number) => formatCOP(value)}
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

        {/* Fund Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h4 className="font-display text-lg font-bold text-gray-900 mb-6">Composición Detallada</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {allocations.map((a) => {
              const fund = fundMap[a.ticker];
              if (!fund) return null;
              const color = assetClassColors[fund.assetClass];
              return (
                <div key={a.ticker} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className="inline-block text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: color + '15', color }}
                      >
                        {a.ticker}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-2 leading-snug">{fund.name}</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{a.weight}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-co-muted">
                    <span>{fund.category}</span>
                    <span>TER: {fund.expenseRatio}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Restart */}
        <div className="text-center mt-12">
          <button onClick={onRestart} className="btn-outline gap-2">
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
      </div>
    </section>
  );
}
