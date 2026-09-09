'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TRAVA_META } from '@/lib/questions';
import { Users, TrendingDown, Award, BarChart3 } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';

export default function ResultadosPage() {
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pro/dashboard').then(r => r.json()),
      fetch('/api/pro/clients').then(r => r.json()),
    ]).then(([d, c]) => { setData(d); setClients(c); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const d = data ?? {};
  const clientsWithAssessment = clients.filter((c: any) => c.lastAssessment);

  // Calcular média de melhora por trava (clientes com 2+ avaliações)
  // Simplificado: mostrar dados agregados disponíveis

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard de Resultados</h1>
          <p className="text-muted-foreground text-sm mt-1">Indicadores de impacto da sua prática</p>
        </div>
      </FadeIn>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold font-mono">{d.clientCount ?? 0}</p><p className="text-xs text-muted-foreground">Clientes Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4"><Award className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold font-mono">{d.activePrograms ?? 0}</p><p className="text-xs text-muted-foreground">Programas Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4"><BarChart3 className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold font-mono">{d.completedSessions ?? 0}</p><p className="text-xs text-muted-foreground">Sessões Realizadas</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingDown className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold font-mono">{clientsWithAssessment.length}</p><p className="text-xs text-muted-foreground">Clientes Diagnosticados</p></CardContent></Card>
      </div>

      {/* Travas mais recorrentes (agregado) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Travas Mais Recorrentes na Carteira</CardTitle>
          <p className="text-xs text-muted-foreground">Média de pontuação entre todos os clientes diagnosticados</p>
        </CardHeader>
        <CardContent>
          {(d.travaStats?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado disponível. Diagnósticos dos clientes aparecerão aqui.</p>
          ) : (
            <div className="space-y-3">
              {d.travaStats.map((t: any, idx: number) => {
                const meta = (TRAVA_META as any)[t.travaKey];
                return (
                  <div key={t.travaKey}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{idx + 1}. {meta?.name ?? t.travaKey}</span>
                      <span className="font-mono text-muted-foreground">{t.avg}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${t.avg >= 67 ? 'bg-red-400' : t.avg >= 34 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${t.avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Por cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resultados por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsWithAssessment.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cliente diagnosticado ainda.</p>
          ) : (
            <div className="space-y-3">
              {clientsWithAssessment.map((c: any) => {
                const scores = c.lastAssessment?.scores?.sort((a: any, b: any) => b.normalized - a.normalized) ?? [];
                const top = scores[0];
                const topMeta = top ? (TRAVA_META as any)[top.travaKey] : null;
                return (
                  <div key={c.linkId} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{c.client.name || c.client.email}</p>
                        {top && <p className="text-xs text-muted-foreground">Trava principal: {topMeta?.name ?? top.travaKey} ({top.normalized}%)</p>}
                      </div>
                      <span suppressHydrationWarning className="text-xs text-muted-foreground">
                        {c.lastAssessment?.completedAt ? new Date(c.lastAssessment.completedAt).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {scores.slice(0, 4).map((s: any) => {
                        const m = (TRAVA_META as any)[s.travaKey];
                        return (
                          <span key={s.travaKey} className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.band === 'alta' ? 'bg-red-100 text-red-700' : s.band === 'moderada' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {m?.shortName ?? s.travaKey}: {s.normalized}%
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
