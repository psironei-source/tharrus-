'use client';

import { useState, useMemo, useCallback, useEffect, useRef, Component, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { shuffleQuestions, LIKERT_LABELS, QUESTIONS_VERSION, type Question } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUESTIONS_PER_PAGE = 5;
const STORAGE_KEY = 'movendose_quiz_state';

// ==================== Error Boundary ====================
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class QuizErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    const details = `${error?.name || 'Error'}: ${error?.message || ''}\n${(error?.stack || '').split('\n').slice(0, 6).join('\n')}\n--- componentStack ---${info?.componentStack || ''}`;
    console.error('[Questionário] Erro capturado:', details);
    try { sessionStorage.setItem('movendose_last_error', details); } catch {}
    this.setState({ error });
  }
  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const details = err ? `${err.name}: ${err.message}\n${(err.stack || '').split('\n').slice(0, 6).join('\n')}` : 'Erro desconhecido';
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h2 className="font-display text-xl font-bold">Algo deu errado</h2>
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro inesperado no questionário. Suas respostas foram salvas — você pode continuar de onde parou.
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => { this.setState({ hasError: false, error: null }); this.props.onReset(); }} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Continuar de onde parei
                </Button>
                <Button variant="outline" onClick={() => { try { navigator.clipboard?.writeText(details); } catch {} }}>
                  Copiar detalhes do erro
                </Button>
              </div>
              <details className="text-left mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">Detalhes técnicos (para suporte)</summary>
                <pre className="mt-2 text-[10px] bg-muted/50 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap">{details}</pre>
              </details>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==================== State helpers ====================
interface QuizState {
  seed: number;
  answers: Record<string, number>;
  currentPage: number;
  started: boolean;
  version?: number;
}

// Persistência: localStorage sobrevive ao fechamento da aba/navegador (requisito de
// "retomar de onde parou"). Fallback para sessionStorage caso localStorage esteja
// bloqueado (modo privado / iframe restrito).
function storage(): Storage | null {
  try {
    const t = '__mpm_probe__';
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch {
    try { return window.sessionStorage; } catch { return null; }
  }
}

function loadState(): QuizState | null {
  try {
    const s = storage();
    if (!s) return null;
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.seed === 'number' && parsed.answers) {
      if (parsed.version !== QUESTIONS_VERSION) {
        s.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    }
  } catch { /* storage blocked */ }
  return null;
}

function saveState(state: QuizState) {
  try { storage()?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* noop */ }
}

function clearState() {
  try {
    storage()?.removeItem(STORAGE_KEY);
    // limpar eventual resíduo do mecanismo antigo
    window.sessionStorage?.removeItem(STORAGE_KEY);
  } catch {}
}

// ==================== Quiz Content ====================
function QuizContent() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [seed, setSeed] = useState(42);
  const initialized = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadState();
    if (saved) {
      setSeed(saved.seed);
      setAnswers(saved.answers);
      setCurrentPage(saved.currentPage);
      setStarted(saved.started);
    } else {
      setSeed(Math.floor(Math.random() * 1000000));
    }
    setHydrated(true);
  }, []);

  const questions = useMemo(() => {
    try { return shuffleQuestions(seed); }
    catch { return []; }
  }, [seed]);

  const totalPages = Math.ceil((questions.length || 1) / QUESTIONS_PER_PAGE);

  // Persist state
  useEffect(() => {
    if (!hydrated) return;
    saveState({ seed, answers, currentPage, started, version: QUESTIONS_VERSION });
  }, [seed, answers, currentPage, started, hydrated]);

  const currentQuestions = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [questions, currentPage]);

  const validQuestionIds = useMemo(() => new Set(questions.map(q => q.id)), [questions]);
  const validAnswerCount = Object.keys(answers).filter(k => validQuestionIds.has(k)).length;
  const progress = questions.length > 0 ? Math.round((validAnswerCount / questions.length) * 100) : 0;
  const allCurrentAnswered = currentQuestions.every(q => answers[q.id] !== undefined);
  const allAnswered = questions.every(q => answers[q.id] !== undefined);
  const isLastPage = currentPage >= totalPages - 1;

  const handleAnswer = useCallback((questionId: string, value: number) => {
    if (!questionId) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const scrollToTop = useCallback(() => {
    try {
      // Usar scrollIntoView que funciona melhor em iframes que window.scrollTo
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      try { window.scrollTo(0, 0); } catch {}
    }
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
    // Delay scroll para dar tempo do React re-render
    setTimeout(scrollToTop, 50);
  }, [totalPages, scrollToTop]);

  const handlePrev = useCallback(() => {
    setCurrentPage(p => Math.max(0, p - 1));
    setTimeout(scrollToTop, 50);
  }, [scrollToTop]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const validAnswers: Record<string, number> = {};
      for (const [key, value] of Object.entries(answers)) {
        if (validQuestionIds.has(key)) validAnswers[key] = value;
      }
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: validAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Erro ao enviar. Tente novamente.');
        setSubmitting(false);
        return;
      }
      clearState();
      router.push(`/relatorio/${data?.assessmentId}`);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Questionário das Travas Neuropsicológicas
            </h1>
            <div className="text-muted-foreground text-sm space-y-3 text-left max-w-md mx-auto">
              <p>Você vai responder <strong>{questions.length} perguntas</strong> sobre como pensa, sente e age no dia a dia.</p>
              <p>Não existe resposta certa ou errada — responda com sinceridade, baseado(a) na sua primeira reação.</p>
              <p>As perguntas aparecem em ordem aleatória. Tempo estimado: <strong>10–15 minutos</strong>.</p>
              {validAnswerCount > 0 && (
                <p className="text-primary font-medium">✓ Você tem {validAnswerCount} respostas salvas. Seu progresso será mantido.</p>
              )}
            </div>
            <Button size="lg" onClick={() => setStarted(true)} className="gap-2">
              {validAnswerCount > 0 ? 'Continuar' : 'Começar'} <ArrowRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" ref={topRef}>
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso</span>
          <span>{progress}% completo</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Página {currentPage + 1} de {totalPages} · {validAnswerCount} de {questions.length} perguntas respondidas
        </p>
      </div>

      {/* Questions — sem animação para evitar crashes */}
      <div className="space-y-4">
        {currentQuestions.map((q, idx) => (
          <Card
            key={q.id}
            className={cn('transition-colors', answers[q.id] !== undefined ? 'border-primary/30' : '')}
          >
            <CardContent className="p-5">
              <p className="text-sm font-medium mb-4 leading-relaxed">
                {currentPage * QUESTIONS_PER_PAGE + idx + 1}. {q.text}
              </p>
              <div className="flex flex-wrap gap-2">
                {LIKERT_LABELS.map((label, value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleAnswer(q.id, value + 1)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      answers[q.id] === value + 1
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:border-border'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrev} disabled={currentPage === 0} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        {isLastPage ? (
          <Button onClick={handleSubmit} disabled={!allAnswered || submitting} className="gap-1.5">
            {submitting ? 'Enviando...' : 'Finalizar'}
            {!submitting && <CheckCircle className="w-4 h-4" />}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!allCurrentAnswered} className="gap-1.5">
            Próxima <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ==================== Page Export (with Error Boundary) ====================
export default function QuestionarioPage() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <QuizErrorBoundary key={resetKey} onReset={() => setResetKey(k => k + 1)}>
      <QuizContent />
    </QuizErrorBoundary>
  );
}
