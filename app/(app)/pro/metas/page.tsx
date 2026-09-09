'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target, Plus, CheckCircle, XCircle, Clock, ClipboardList, Calendar } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { TRAVA_META } from '@/lib/questions';
import { cn } from '@/lib/utils';

const TRAVAS = Object.entries(TRAVA_META).map(([key, v]: [string, any]) => ({ key, name: v.name }));

export default function MetasPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [goals, setGoals] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'goals' | 'homework'>('goals');

  // Forms
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ travaKey: '', title: '', description: '', measurable: '', deadline: '' });
  const [showHwForm, setShowHwForm] = useState(false);
  const [hwForm, setHwForm] = useState({ title: '', description: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/pro/clients').then(r => r.json()).then(raw => {
      const c = Array.isArray(raw) ? raw : [];
      setClients(c);
      if (c.length > 0) setSelectedClient(c[0].client?.id || '');
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    Promise.all([
      fetch(`/api/pro/goals?clientId=${selectedClient}`).then(r => r.json()),
      fetch(`/api/pro/homework?clientId=${selectedClient}`).then(r => r.json()),
    ]).then(([g, h]) => { setGoals(Array.isArray(g) ? g : []); setHomework(Array.isArray(h) ? h : []); });
  }, [selectedClient]);

  const submitGoal = async () => {
    if (!goalForm.title.trim() || !goalForm.travaKey) return;
    setSubmitting(true);
    await fetch('/api/pro/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: selectedClient, ...goalForm }),
    });
    setGoalForm({ travaKey: '', title: '', description: '', measurable: '', deadline: '' });
    setShowGoalForm(false);
    setSubmitting(false);
    const g = await fetch(`/api/pro/goals?clientId=${selectedClient}`).then(r => r.json());
    setGoals(Array.isArray(g) ? g : []);
  };

  const submitHw = async () => {
    if (!hwForm.title.trim()) return;
    setSubmitting(true);
    await fetch('/api/pro/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: selectedClient, ...hwForm }),
    });
    setHwForm({ title: '', description: '', dueDate: '' });
    setShowHwForm(false);
    setSubmitting(false);
    const h = await fetch(`/api/pro/homework?clientId=${selectedClient}`).then(r => r.json());
    setHomework(Array.isArray(h) ? h : []);
  };

  const updateGoalStatus = async (id: string, status: string) => {
    await fetch('/api/pro/goals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const g = await fetch(`/api/pro/goals?clientId=${selectedClient}`).then(r => r.json());
    setGoals(Array.isArray(g) ? g : []);
  };

  const updateHwStatus = async (id: string, status: string) => {
    await fetch('/api/pro/homework', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const h = await fetch(`/api/pro/homework?clientId=${selectedClient}`).then(r => r.json());
    setHomework(Array.isArray(h) ? h : []);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Metas e Tarefas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Metas SMART e tarefas de casa por cliente</p>
        </div>
      </FadeIn>

      {/* Seletor de cliente */}
      <select
        className="w-full p-2 rounded-md border border-border bg-background text-sm"
        value={selectedClient}
        onChange={(e: any) => setSelectedClient(e.target.value)}
      >
        <option value="">Selecione um cliente...</option>
        {clients.map((c: any) => <option key={c.client?.id} value={c.client?.id}>{c.client?.name || c.client?.email}</option>)}
      </select>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('goals')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'goals' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
          <Target className="w-4 h-4 inline mr-1.5" /> Metas SMART
        </button>
        <button onClick={() => setTab('homework')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'homework' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
          <ClipboardList className="w-4 h-4 inline mr-1.5" /> Tarefas de Casa
        </button>
      </div>

      {!selectedClient ? (
        <p className="text-sm text-muted-foreground">Selecione um cliente para gerenciar metas e tarefas.</p>
      ) : tab === 'goals' ? (
        <div className="space-y-4">
          <Button onClick={() => setShowGoalForm(!showGoalForm)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Meta
          </Button>
          {showGoalForm && (
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <Input placeholder="Título da meta" value={goalForm.title} onChange={(e: any) => setGoalForm({ ...goalForm, title: e.target.value })} />
                <select className="w-full p-2 rounded-md border border-border bg-background text-sm" value={goalForm.travaKey} onChange={(e: any) => setGoalForm({ ...goalForm, travaKey: e.target.value })}>
                  <option value="">Trava vinculada...</option>
                  {TRAVAS.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
                </select>
                <Textarea placeholder="Descrição (específica, atingível, relevante)" value={goalForm.description} onChange={(e: any) => setGoalForm({ ...goalForm, description: e.target.value })} rows={2} />
                <Input placeholder="Como medir (mensurável)" value={goalForm.measurable} onChange={(e: any) => setGoalForm({ ...goalForm, measurable: e.target.value })} />
                <Input type="date" placeholder="Prazo" value={goalForm.deadline} onChange={(e: any) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowGoalForm(false)}>Cancelar</Button>
                  <Button onClick={submitGoal} disabled={submitting}>{submitting ? 'Salvando...' : 'Criar Meta'}</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma meta definida para este cliente.</p>
          ) : (
            <div className="space-y-3">
              {goals.map((g: any) => {
                const meta = (TRAVA_META as any)[g.travaKey];
                return (
                  <Card key={g.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">{g.title}</h3>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', g.status === 'achieved' ? 'bg-emerald-100 text-emerald-700' : g.status === 'abandoned' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                              {g.status === 'achieved' ? 'Alcançada' : g.status === 'abandoned' ? 'Abandonada' : 'Ativa'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{meta?.name ?? g.travaKey}</p>
                          {g.description && <p className="text-xs text-muted-foreground mt-1">{g.description}</p>}
                          {g.measurable && <p className="text-xs mt-1"><span className="font-medium">Medir:</span> {g.measurable}</p>}
                          {g.deadline && <p suppressHydrationWarning className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {new Date(g.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                        </div>
                        {g.status === 'active' && (
                          <div className="flex gap-1">
                            <button onClick={() => updateGoalStatus(g.id, 'achieved')} className="p-1 hover:bg-emerald-50 rounded" title="Marcar como alcançada"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                            <button onClick={() => updateGoalStatus(g.id, 'abandoned')} className="p-1 hover:bg-red-50 rounded" title="Abandonar meta"><XCircle className="w-4 h-4 text-red-400" /></button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button onClick={() => setShowHwForm(!showHwForm)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Tarefa
          </Button>
          {showHwForm && (
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <Input placeholder="Título da tarefa" value={hwForm.title} onChange={(e: any) => setHwForm({ ...hwForm, title: e.target.value })} />
                <Textarea placeholder="Descrição / instruções" value={hwForm.description} onChange={(e: any) => setHwForm({ ...hwForm, description: e.target.value })} rows={2} />
                <Input type="date" placeholder="Prazo" value={hwForm.dueDate} onChange={(e: any) => setHwForm({ ...hwForm, dueDate: e.target.value })} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowHwForm(false)}>Cancelar</Button>
                  <Button onClick={submitHw} disabled={submitting}>{submitting ? 'Salvando...' : 'Criar Tarefa'}</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {homework.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa atribuída para este cliente.</p>
          ) : (
            <div className="space-y-3">
              {homework.map((h: any) => (
                <Card key={h.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{h.title}</h3>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                            h.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            h.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            h.status === 'skipped' ? 'bg-gray-100 text-gray-600' :
                            'bg-amber-100 text-amber-700'
                          )}>
                            {h.status === 'completed' ? 'Concluída' : h.status === 'overdue' ? 'Atrasada' : h.status === 'skipped' ? 'Pulada' : 'Pendente'}
                          </span>
                        </div>
                        {h.description && <p className="text-xs text-muted-foreground mt-1">{h.description}</p>}
                        {h.dueDate && <p suppressHydrationWarning className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {new Date(h.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                      </div>
                      {h.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => updateHwStatus(h.id, 'completed')} className="p-1 hover:bg-emerald-50 rounded" title="Marcar como feita"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                          <button onClick={() => updateHwStatus(h.id, 'skipped')} className="p-1 hover:bg-red-50 rounded" title="Pular"><XCircle className="w-4 h-4 text-red-400" /></button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
