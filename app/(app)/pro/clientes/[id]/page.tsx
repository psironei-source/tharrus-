'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CalendarDays, Plus, TrendingUp, Target, ClipboardList, BookOpen, AlertTriangle, Activity } from 'lucide-react';
import { TRAVA_META } from '@/lib/questions';
import RadarChartComponent from '@/components/app/radar-chart';
import { cn } from '@/lib/utils';

export default function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trail, setTrail] = useState<any>(null);
  const [generatingTrail, setGeneratingTrail] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [diary, setDiary] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/pro/clients/${id}`).then(r => r.json()).then(setData).finally(() => setLoading(false));
    fetch(`/api/pro/goals?clientId=${id}`).then(r => r.json()).then(g => setGoals(Array.isArray(g) ? g : []));
    fetch(`/api/pro/homework?clientId=${id}`).then(r => r.json()).then(h => setHomework(Array.isArray(h) ? h : []));
    fetch(`/api/pro/analytics?type=trends&clientId=${id}`).then(r => r.json()).then(t => setTrends(t.trends || []));
    fetch('/api/pro/alerts').then(r => r.json()).then(a => setAlerts((Array.isArray(a) ? a : []).filter((x: any) => x.clientId === id)));
  }, [id]);

  const handleGenerateTrail = async () => {
    setGeneratingTrail(true);
    try {
      const res = await fetch('/api/pro/trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id }),
      });
      const d = await res.json();
      if (res.ok) setTrail(d);
    } finally {
      setGeneratingTrail(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data?.client) return <p className="text-center py-12 text-muted-foreground">Cliente não encontrado.</p>;

  const latestAssessment = data.assessments?.[0];
  const radarScores = latestAssessment?.scores?.map((s: any) => {
    const meta = (TRAVA_META as any)[s.travaKey];
    return { name: meta?.shortName ?? s.travaKey, normalized: s.normalized, band: s.band };
  }) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pro/clientes"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="font-display text-xl font-bold">{data.client.name || data.client.email}</h1>
          <p className="text-sm text-muted-foreground">{data.client.email}</p>
        </div>
      </div>

      {/* Radar do perfil atual */}
      {radarScores.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Perfil Atual das Travas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <RadarChartComponent scores={radarScores} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trilha recomendada */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Protocolo Guiado de Sessões</CardTitle>
            <Button size="sm" variant="outline" onClick={handleGenerateTrail} disabled={generatingTrail || !latestAssessment}>
              {generatingTrail ? 'Gerando...' : trail ? 'Regerar Trilha' : 'Gerar Trilha'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!latestAssessment && <p className="text-sm text-muted-foreground">O cliente precisa completar o diagnóstico primeiro.</p>}
          {trail && (
            <div className="space-y-3 mt-2">
              {trail.trail.map((step: any) => (
                <div key={step.sessionNumber} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{step.sessionNumber}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.phaseName} • {step.toolSuggested}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.objective}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de avaliações */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Histórico de Avaliações ({data.assessments?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {data.assessments?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
          ) : (
            <div className="space-y-2">
              {data.assessments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Avaliação</p>
                    <p suppressHydrationWarning className="text-xs text-muted-foreground">{new Date(a.completedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Link href={`/relatorio/${a.id}`}>
                    <Button size="sm" variant="outline" className="gap-1"><FileText className="w-3 h-3" /> Ver</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas do cliente */}
      {alerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Pontos de Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((a: any) => (
                <div key={a.id} className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">{a.message}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tendências */}
      {trends.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Tendência das Travas</CardTitle>
              <Link href={`/pro/analytics`}><Button size="sm" variant="outline" className="text-xs">Ver Analytics</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {trends.map((t: any) => {
                const meta = (TRAVA_META as any)[t.travaKey];
                const trendLabel = t.trend === 'improving' ? 'Melhorando' : t.trend === 'worsening' ? 'Piorando' : t.trend === 'stagnant' ? 'Estagnado' : 'Oscilando';
                const trendColor = t.trend === 'improving' ? 'text-emerald-600' : t.trend === 'worsening' ? 'text-red-500' : 'text-amber-500';
                return (
                  <div key={t.travaKey} className="p-2 rounded-lg bg-muted/50 text-xs">
                    <span className="font-medium">{meta?.shortName ?? t.travaKey}</span>
                    <span className={cn('ml-1', trendColor)}>{trendLabel}</span>
                    {t.plateauCount >= 3 && <span className="text-amber-500 ml-1">⚠ Platô</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metas SMART */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Metas ({goals.filter(g => g.status === 'active').length} ativas)</CardTitle>
            <Link href="/pro/metas"><Button size="sm" variant="outline" className="gap-1"><Plus className="w-3 h-3" /> Nova</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma meta definida.</p>
          ) : (
            <div className="space-y-2">
              {goals.slice(0, 5).map((g: any) => {
                const meta = (TRAVA_META as any)[g.travaKey];
                return (
                  <div key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{meta?.name ?? g.travaKey}</p>
                    </div>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', g.status === 'achieved' ? 'bg-emerald-100 text-emerald-700' : g.status === 'abandoned' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                      {g.status === 'achieved' ? 'Alcançada' : g.status === 'abandoned' ? 'Abandonada' : 'Ativa'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarefas de casa */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Tarefas de Casa ({homework.filter(h => h.status === 'pending').length} pendentes)</CardTitle>
            <Link href="/pro/metas"><Button size="sm" variant="outline" className="gap-1"><Plus className="w-3 h-3" /> Nova</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {homework.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa atribuída.</p>
          ) : (
            <div className="space-y-2">
              {homework.slice(0, 5).map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">{h.title}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', h.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {h.status === 'completed' ? 'Feita' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programas */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Programas ({data.programs?.length ?? 0})</CardTitle>
            <Link href="/pro/programas"><Button size="sm" variant="outline" className="gap-1"><Plus className="w-3 h-3" /> Novo</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.programs?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum programa criado para este cliente.</p>
          ) : (
            <div className="space-y-2">
              {data.programs.map((p: any) => (
                <Link key={p.id} href={`/pro/programas`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sessions?.length ?? 0} sessão(ões) • {p.status}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
