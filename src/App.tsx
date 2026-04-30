import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import OpportunitySection from './components/OpportunitySection';
import HowItWorks from './components/HowItWorks';
import OperatingModels from './components/OperatingModels';
import PrototypeDemo from './components/PrototypeDemo';
import ResultsPage from './components/ResultsPage';
import DisclaimerFooter from './components/DisclaimerFooter';
import type { ScoringResult } from './engine/scoringEngine';
import { AudioProvider } from './audio/AudioProvider';
import { useAudio } from './audio/useAudio';
import MuteToggle from './audio/MuteToggle';

const CORRECT_PASSWORD = 'CO2026$';

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const audio = useAudio();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      audio.unlock();
      audio.playStaticVoice('welcome');
      onAuth();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-co-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card p-8 sm:p-12 w-full max-w-md text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-gray-600" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          BlackRock Colombia
        </h1>
        <p className="text-co-muted text-sm mb-8">
          Personalización Directa — Acceso Restringido
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-1.5">
              Código de acceso
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-co-green focus:border-transparent ${
                  error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ingrese el código"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-600 text-sm"
              >
                Código incorrecto. Intente nuevamente.
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-primary w-full">
            Acceder
          </button>
        </form>

        <p className="text-xs text-co-muted mt-8">
          Solo para uso interno — no distribuir
        </p>
      </motion.div>
    </div>
  );
}

function AppInner() {
  const [authenticated, setAuthenticated] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const handleAuth = useCallback(() => setAuthenticated(true), []);

  const handleResult = useCallback((r: ScoringResult) => {
    setResult(r);
  }, []);

  const handleBackToHome = useCallback(() => {
    setResult(null);
  }, []);

  // Scroll to top when entering results
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  if (!authenticated) {
    return <AuthGate onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-co-bg">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Minimal results header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
              <div className="container-max flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                    BlackRock
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-co-green text-white">
                    Personalización Directa
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleBackToHome}
                    className="flex items-center gap-1.5 text-sm font-medium text-co-muted hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al cuestionario
                  </button>
                  <MuteToggle />
                </div>
              </div>
            </div>

            <main className="pt-20">
              <ResultsPage result={result} onRestart={handleBackToHome} />
            </main>
            <DisclaimerFooter />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Header />
            <main>
              <HeroSection />
              <OpportunitySection />
              <HowItWorks />
              <OperatingModels />
              <PrototypeDemo onResult={handleResult} />
            </main>
            <DisclaimerFooter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppInner />
    </AudioProvider>
  );
}
