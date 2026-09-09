'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SDR_QUESTIONS, type SDRQuestion } from '@/lib/sdr-questions';
import { LIKERT_LABELS } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/animate';
import { BarChart3, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const SDRBarChart = dynamic(() => import('@/components/app/sdr-bar-chart'), { ssr: false, loading: () => <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div> });

const PER_PAGE = 6;

export default function SDRPage() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ sociabilidade: number; dominancia: number; receptividade: number } | null>(null);
  const [pastResults, setPastResults] = useState<any[]>([]);

  const totalPages = Math.ceil((SDR_QUESTIONS?.length ?? 0) / PER_PAGE);
  const currentQs = useMemo(() => (SDR_QUESTIONS ?? []).slice(page * PER_PAGE, (page + 1) * PER_PAGE), [page]);
  const progress = Math.round((Object.keys(answers ?? {}).length / (SDR_QUESTIONS?.length ?? 1)) * 100);
  const allCurrentDone = currentQs.every((q: SDRQuestion) => answers?.[q?.id] !== undefined);
  const allDone = (SDR_QUESTIONS ?? []).every((q: SDRQuestion) => answers?.[q?.id] !== undefined);
  const isLast = page >= totalPages - 1;

  useEffect(() => {
    fetch('/api/sdr/results').then((r: Response) => r.json()).then((d: any) => setPastResults(d ?? [])).catch(() => {});
  }, []);

  const handleAnswer = useCallback((qid: string, val: number) => {
    setAnswers((p: Record<string, number>) => ({ ...(p ?? {}), [qid]: val }));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/sdr/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold tracking-tight">Resultado da Escala SDR</h1>
          <p className="text-muted-foreground mt-1">Seu perfil de Sociabilidade, Dominância e Receptividade.</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="p-6">
              <SDRBarChart sociabilidade={result?.sociabilidade ?? 0} dominancia={result?.dominancia ?? 0} receptividade={result?.receptividade ?? 0} />
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Sociabilidade', value: result?.sociabilidade ?? 0, color: 'text-blue-600' },
              { label: 'Dominância', value: result?.dominancia ?? 0, color: 'text-red-600' },
              { label: 'Receptividade', value: result?.receptividade ?? 0, color: 'text-green-600' },
            ].map((d: any) => (
              <Card key={d.label}>
                <CardContent className="p-4 text-center">
                  <p className={`text-3xl font-bold font-mono ${d.color}`}>{d.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
        <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); setPage(0); setStarted(false); }}>
          Refazer teste
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <FadeIn>
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Escala SDR</h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                A Escala SDR mede 3 dimensões do seu perfil relacional: <strong>Sociabilidade</strong>, <strong>Dominância</strong> e <strong>Receptividade</strong>. São {SDR_QUESTIONS?.length ?? 39} frases rápidas — responda com sua primeira reação.
              </p>
              <Button size="lg" onClick={() => setStarted(true)} className="gap-2">
                Começar <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {(pastResults ?? []).length > 0 && (
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader><CardTitle className="text-base font-display">Histórico</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(pastResults ?? []).slice(0, 5).map((r: any) => (
                    <div key={r?.id} className="flex justify-between text-sm border-b pb-2">
                      <span className="text-muted-foreground">{r?.completedAt ? new Date(r.completedAt).toLocaleDateString('pt-BR') : ''}</span>
                      <div className="flex gap-3">
                        <Badge variant="outline">S: {r?.sociabilidade ?? 0}</Badge>
                        <Badge variant="outline">D: {r?.dominancia ?? 0}</Badge>
                        <Badge variant="outline">R: {r?.receptividade ?? 0}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Escala SDR</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-3">
        {(currentQs ?? []).map((q: SDRQuestion, idx: number) => (
          <FadeIn key={q?.id ?? idx} delay={idx * 0.05}>
            <Card className={answers?.[q?.id] !== undefined ? 'border-primary/30' : ''}>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">{page * PER_PAGE + idx + 1}. {q?.text ?? ''}</p>
                <div className="flex flex-wrap gap-2">
                  {LIKERT_LABELS.map((label: string, val: number) => (
                    <button
                      key={val}
                      onClick={() => handleAnswer(q?.id, val + 1)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        answers?.[q?.id] === val + 1
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setPage((p: number) => Math.max(0, p - 1))} disabled={page === 0} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        {isLast ? (
          <Button onClick={handleSubmit} disabled={!allDone || submitting} className="gap-1.5">
            {submitting ? 'Enviando...' : 'Finalizar'} {!submitting && <CheckCircle className="w-4 h-4" />}
          </Button>
        ) : (
          <Button onClick={() => setPage((p: number) => p + 1)} disabled={!allCurrentDone} className="gap-1.5">
            Próxima <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
