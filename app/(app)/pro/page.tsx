'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, Award, BarChart3, ArrowRight, AlertTriangle, Bell, Target, BookMarked, Activity } from 'lucide-react';
import { TRAVA_META } from '@/lib/questions';
import { FadeIn } from '@/components/ui/animate';
import { cn } from '@/lib/utils';

export default function ProDashboard() {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pro/dashboard').then(r => r.json()),
      fetch('/api/pro/alerts').then(r => r.json()),
    ]).then(([d, a]) => { setData(d); setAlerts(Array.isArray(a) ? a : []); }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const d = data ?? {};

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Painel do Profissional</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral da sua prática e clientes</p>
        </div>
      </FadeIn>

      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Esta ferramenta apoia a organização e mensuração do processo. Não substitui formação clínica, supervisão ou julgamento profissional.</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clientes Ativos', value: d.clientCount ?? 0, icon: Users, href: '/pro/clientes' },
          { label: 'Programas Ativos', value: d.activePrograms ?? 0, icon: Award, href: '/pro/programas' },
          { label: 'Sessões Concluídas', value: d.completedSessions ?? 0, icon: CalendarDays, href: '/pro/sessoes' },
          { label: 'Travas Mapeadas', value: d.travaStats?.length ?? 0, icon: BarChart3, href: '/pro/resultados' },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <kpi.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Próximas Sessões</CardTitle>
            <Link href="/pro/sessoes" className="text-xs text-primary hover:underline flex items-center gap-1">Ver todas <ArrowRight className="w-3 h-3" /></Link>
          </div>
        </CardHeader>
        <CardContent>
          {(d.upcomingSessions?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão agendada.</p>
          ) : (
            <div className="space-y-2">
              {d.upcomingSessions.map((s: any) => (
                <Link key={s.id} href={`/pro/sessoes/${s.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-medium">{s.client?.name ?? 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">{s.title} {s.program ? `• ${s.program.name}` : ''}</p>
                  </div>
                  <span suppressHydrationWarning className="text-xs text-muted-foreground">
                    {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sem data'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de risco */}
      {alerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" /> Pontos de Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((a: any) => (
                <div key={a.id} className={cn('p-3 rounded-lg text-sm flex items-start gap-2', a.severity === 'warning' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800')}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{a.client?.name}: </span>
                    <span>{a.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links rápidos para novas features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/pro/metas">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Metas e Tarefas</p>
                <p className="text-xs text-muted-foreground">SMART goals e homework</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/pro/intervencoes">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <BookMarked className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Intervenções</p>
                <p className="text-xs text-muted-foreground">Biblioteca por trava</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/pro/analytics">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">Correlações e tendências</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {(d.travaStats?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Travas Mais Recorrentes (Média dos Clientes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {d.travaStats.slice(0, 5).map((t: any) => {
                const meta = (TRAVA_META as any)[t.travaKey];
                return (
                  <div key={t.travaKey} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{meta?.name ?? t.travaKey}</span>
                        <span className="text-muted-foreground font-mono">{t.avg}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${t.avg >= 67 ? 'bg-red-400' : t.avg >= 34 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${t.avg}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
