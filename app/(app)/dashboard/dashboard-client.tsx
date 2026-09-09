'use client';

import Link from 'next/link';
import { Brain, FileText, ArrowRight, Compass, BarChart3, Target, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, SlideIn } from '@/components/ui/animate';
import { TRAVA_META } from '@/lib/questions';
import { SafeDate } from '@/components/safe-format';

interface DashboardData {
  userName: string;
  assessmentCount: number;
  lastAssessmentId: string | null;
  lastAssessmentDate: string | null;
  lastScores: { travaKey: string; normalized: number; band: string }[];
  sdrCount: number;
  bussolaCount: number;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const hasAssessment = (data?.assessmentCount ?? 0) > 0;
  const firstName = data?.userName?.split?.(' ')?.[0] ?? 'você';

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasAssessment
              ? 'Aqui está um resumo da sua jornada de autoconhecimento.'
              : 'Comece sua jornada de autoconhecimento fazendo o questionário das travas.'}
          </p>
        </div>
      </FadeIn>

      {!hasAssessment && (
        <SlideIn from="bottom">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-lg font-semibold">Faça seu primeiro diagnóstico</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Responda o questionário das 8 travas neuropsicológicas e descubra o que pode estar limitando seu potencial.
                </p>
              </div>
              <Link href="/questionario">
                <Button className="gap-2">
                  Iniciar <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {hasAssessment && (
        <FadeIn delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{data.assessmentCount}</p>
                    <p className="text-xs text-muted-foreground">Avaliações</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {data.lastAssessmentDate ? <SafeDate date={data.lastAssessmentDate} options={{ dateStyle: 'medium' }} /> : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Última avaliação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{data.sdrCount}</p>
                    <p className="text-xs text-muted-foreground">Testes SDR</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{data.bussolaCount}</p>
                    <p className="text-xs text-muted-foreground">Ações na Bússola</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      )}

      {hasAssessment && (data.lastScores ?? []).length > 0 && (
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Suas Travas — Última Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...(data.lastScores ?? [])].sort((a: any, b: any) => (b?.normalized ?? 0) - (a?.normalized ?? 0)).map((s: any) => {
                  const meta = TRAVA_META?.[s.travaKey];
                  const bandColor = s.band === 'alta' ? 'bg-red-500' : s.band === 'moderada' ? 'bg-yellow-500' : 'bg-green-500';
                  return (
                    <div key={s.travaKey} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-40 truncate">{meta?.shortName ?? s.travaKey}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${bandColor}`}
                          style={{ width: `${Math.max(s?.normalized ?? 0, 2)}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-10 text-right">{s?.normalized ?? 0}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-4">
                {data.lastAssessmentId && (
                  <Link href={`/relatorio/${data.lastAssessmentId}`}>
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      Ver relatório completo <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
                <Link href="/questionario">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Refazer avaliação
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Quick actions */}
      <FadeIn delay={0.3}>
        <h2 className="font-display text-xl font-semibold mb-4">Módulos complementares</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/sdr">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Escala SDR</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mapeie sua Sociabilidade, Dominância e Receptividade nas relações.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/bussola">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Bússola de Ação</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Organize seu plano de ação com as 8 colunas estratégicas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
