'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/animate';
import { TrendingUp, Loader2, ArrowRight, Info } from 'lucide-react';
import { TRAVA_META, TRAVA_KEYS } from '@/lib/questions';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const EvolutionChart = dynamic(() => import('@/components/app/evolution-chart'), { ssr: false, loading: () => <div className="h-80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div> });

interface HistoryEntry {
  id: string;
  completedAt: string;
  scores: { travaKey: string; normalized: number; band: string }[];
}

export default function EvolucaoPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assessment/history')
      .then((r: Response) => r.json())
      .then((d: any) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard de Evolução</h1>
            <p className="text-muted-foreground text-sm">Acompanhe como suas travas evoluem ao longo do tempo.</p>
          </div>
        </div>
      </FadeIn>

      {(history ?? []).length < 1 ? (
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Você ainda não completou nenhuma avaliação.</p>
              <Link href="/questionario">
                <Button className="gap-1.5">Fazer a primeira avaliação <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <>
          {(history ?? []).length >= 2 ? (
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base">Evolução por Trava</CardTitle>
                </CardHeader>
                <CardContent>
                  <EvolutionChart history={history} />
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <FadeIn delay={0.1}>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Refaça o questionário em 30–60 dias</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      O gráfico de evolução aparecerá após sua segunda avaliação. Recomendamos um intervalo de 30 a 60 dias entre as aplicações para perceber a mudança.
                    </p>
                    <Link href="/questionario" className="inline-block mt-3">
                      <Button size="sm" variant="secondary" className="gap-1.5">
                        Refazer avaliação <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          <FadeIn delay={0.2}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">Histórico de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(history ?? []).map((entry: HistoryEntry, idx: number) => (
                    <div key={entry?.id ?? idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <span className="text-sm font-medium">Avaliação {(history?.length ?? 0) - idx}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {entry?.completedAt ? new Date(entry.completedAt).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                      <Link href={`/relatorio/${entry?.id}`}>
                        <Button variant="ghost" size="sm">Ver relatório</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  );
}
