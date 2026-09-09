'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TRAVA_META } from '@/lib/questions';
import { BarChart3, TrendingDown, TrendingUp, Minus, AlertTriangle, Activity, Users, ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [tab, setTab] = useState<'correlations' | 'churn' | 'trends'>('correlations');
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [churnData, setChurnData] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [trends, setTrends] = useState<any[]>([]);
  const [adherence, setAdherence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pro/analytics?type=correlations').then(r => r.json()),
      fetch('/api/pro/analytics?type=churn').then(r => r.json()),
      fetch('/api/pro/clients').then(r => r.json()),
    ]).then(([corr, ch, rawCl]) => {
      setCorrelations(Array.isArray(corr?.correlations) ? corr.correlations : []);
      setChurnData(Array.isArray(ch?.clients) ? ch.clients : []);
      const cl = Array.isArray(rawCl) ? rawCl : [];
      setClients(cl);
      if (cl.length > 0) setSelectedClient(cl[0].client?.id || '');
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    Promise.all([
      fetch(`/api/pro/analytics?type=trends&clientId=${selectedClient}`).then(r => r.json()),
      fetch(`/api/pro/analytics?type=adherence&clientId=${selectedClient}`).then(r => r.json()),
    ]).then(([t, a]) => {
      setTrends(Array.isArray(t?.trends) ? t.trends : []);
      setAdherence(a && !a.error ? a : null);
    });
  }, [selectedClient]);

  const tName = (key: string) => (TRAVA_META as any)[key]?.name ?? key;

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Analytics Avançado
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Correlações, tendências e indicadores de engajamento</p>
        </div>
      </FadeIn>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'correlations' as const, label: 'Correlações', icon: BarChart3 },
          { key: 'trends' as const, label: 'Tendências', icon: TrendingDown },
          { key: 'churn' as const, label: 'Risco de Churn', icon: AlertTriangle },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Correlações */}
      {tab === 'correlations' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapa de Causas Cruzadas</CardTitle>
            <p className="text-xs text-muted-foreground">Correlações entre travas baseadas nas respostas dos clientes. Quanto mais forte a correlação, mais as travas se alimentam mutuamente.</p>
          </CardHeader>
          <CardContent>
            {correlations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Dados insuficientes. São necessárias múltiplas avaliações de clientes para calcular correlações.</p>
            ) : (
              <div className="space-y-3">
                {correlations.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium min-w-[120px]">{tName(c.from)}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', c.strength > 0 ? 'bg-red-400' : 'bg-blue-400')}
                          style={{ width: `${Math.abs(c.strength) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs min-w-[40px] text-right">{c.strength > 0 ? '+' : ''}{c.strength}</span>
                    </div>
                    <span className="text-sm font-medium min-w-[120px] text-right">{tName(c.to)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tendências */}
      {tab === 'trends' && (
        <div className="space-y-4">
          <select className="w-full p-2 rounded-md border border-border bg-background text-sm" value={selectedClient} onChange={(e: any) => setSelectedClient(e.target.value)}>
            <option value="">Selecione um cliente...</option>
            {clients.map((c: any) => <option key={c.client?.id} value={c.client?.id}>{c.client?.name || c.client?.email}</option>)}
          </select>

          {/* Adesão x Resultado */}
          {adherence && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Correlação Adesão × Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold font-mono">{adherence.adherenceRate}%</p>
                    <p className="text-xs text-muted-foreground">Adesão Tarefas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold font-mono">{adherence.completedTasks}/{adherence.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">Tarefas Feitas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className={cn('text-2xl font-bold font-mono', adherence.avgScoreChange < 0 ? 'text-emerald-600' : adherence.avgScoreChange > 0 ? 'text-red-500' : '')}>
                      {adherence.avgScoreChange > 0 ? '+' : ''}{adherence.avgScoreChange}%
                    </p>
                    <p className="text-xs text-muted-foreground">Evolução Score</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">{adherence.insight}</p>
              </CardContent>
            </Card>
          )}

          {/* Tendência por trava */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Velocidade de Mudança por Trava</CardTitle>
              <p className="text-xs text-muted-foreground">Análise de tendência baseada nas reavaliações periódicas</p>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <p className="text-sm text-muted-foreground">Necessárias pelo menos 2 avaliações para análise de tendência.</p>
              ) : (
                <div className="space-y-3">
                  {trends.map((t: any) => {
                    const TrendIcon = t.trend === 'improving' ? TrendingDown : t.trend === 'worsening' ? TrendingUp : Minus;
                    const trendColor = t.trend === 'improving' ? 'text-emerald-500' : t.trend === 'worsening' ? 'text-red-500' : t.trend === 'stagnant' ? 'text-amber-500' : 'text-gray-400';
                    const trendLabel = t.trend === 'improving' ? 'Melhorando' : t.trend === 'worsening' ? 'Piorando' : t.trend === 'stagnant' ? 'Estagnado' : 'Oscilando';
                    return (
                      <div key={t.travaKey} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendIcon className={cn('w-4 h-4', trendColor)} />
                            <span className="text-sm font-medium">{tName(t.travaKey)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs px-2 py-0.5 rounded-full', trendColor, t.trend === 'improving' ? 'bg-emerald-50' : t.trend === 'worsening' ? 'bg-red-50' : t.trend === 'stagnant' ? 'bg-amber-50' : 'bg-gray-50')}>
                              {trendLabel}
                            </span>
                            <span className="font-mono text-xs">{t.lastValue}%</span>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {t.values.map((v: number, i: number) => (
                            <div key={i} className="flex-1 h-6 rounded bg-muted flex items-end">
                              <div className={cn('w-full rounded', v >= 67 ? 'bg-red-400' : v >= 34 ? 'bg-amber-400' : 'bg-emerald-400')} style={{ height: `${Math.max(v, 5)}%` }} />
                            </div>
                          ))}
                        </div>
                        {t.plateauCount >= 3 && (
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Platô detectado ({t.plateauCount} ciclos). Considere trocar a estratégia de intervenção.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risco de Churn */}
      {tab === 'churn' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Risco de Desistência
            </CardTitle>
            <p className="text-xs text-muted-foreground">Combinação de sinais: frequência de sessões, adesão às tarefas, diário e satisfação</p>
          </CardHeader>
          <CardContent>
            {churnData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente vinculado.</p>
            ) : (
              <div className="space-y-3">
                {churnData.map((c: any) => (
                  <div key={c.clientId} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.clientName}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        c.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        c.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      )}>
                        {c.riskLevel === 'high' ? 'Alto' : c.riskLevel === 'medium' ? 'Médio' : 'Baixo'} ({c.riskScore}%)
                      </span>
                    </div>
                    {c.signals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.signals.map((s: string, i: number) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
