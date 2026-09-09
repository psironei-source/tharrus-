'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookMarked, Plus, Wrench, Star } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { TRAVA_META } from '@/lib/questions';
import { cn } from '@/lib/utils';

const TRAVAS = Object.entries(TRAVA_META).map(([key, v]: [string, any]) => ({ key, name: v.name }));

export default function IntervencoesPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTrava, setFilterTrava] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', travaKey: '', instructions: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    const url = filterTrava ? `/api/pro/interventions?travaKey=${filterTrava}` : '/api/pro/interventions';
    fetch(url).then(r => r.json()).then(d => setInterventions(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterTrava]);

  const submit = async () => {
    if (!form.name.trim() || !form.travaKey) return;
    setSubmitting(true);
    await fetch('/api/pro/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', description: '', travaKey: '', instructions: '' });
    setShowForm(false);
    setSubmitting(false);
    load();
  };

  const grouped = TRAVAS.reduce((acc, t) => {
    acc[t.key] = interventions.filter((i: any) => i.travaKey === t.key);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-primary" /> Biblioteca de Intervenções
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Técnicas e ferramentas organizadas por trava</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Intervenção
          </Button>
        </div>
      </FadeIn>

      {/* Filtro por trava */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterTrava('')} className={cn('px-3 py-1.5 rounded-full text-sm border transition-all', !filterTrava ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/50')}>Todas</button>
        {TRAVAS.map(t => (
          <button key={t.key} onClick={() => setFilterTrava(t.key)} className={cn('px-3 py-1.5 rounded-full text-sm border transition-all', filterTrava === t.key ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/50')}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Form nova intervenção */}
      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Nome da intervenção" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <select
              className="w-full p-2 rounded-md border border-border bg-background text-sm"
              value={form.travaKey}
              onChange={(e: any) => setForm({ ...form, travaKey: e.target.value })}
            >
              <option value="">Selecione a trava...</option>
              {TRAVAS.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
            </select>
            <Textarea placeholder="Descrição" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} rows={2} />
            <Textarea placeholder="Instruções de aplicação" value={form.instructions} onChange={(e: any) => setForm({ ...form, instructions: e.target.value })} rows={3} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filterTrava ? (
        <div className="space-y-3">
          {interventions.map((i: any) => (
            <InterventionCard key={i.id} intervention={i} />
          ))}
          {interventions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma intervenção para esta trava.</p>}
        </div>
      ) : (
        Object.entries(grouped).filter(([, items]) => items.length > 0).map(([key, items]) => {
          const meta = (TRAVA_META as any)[key];
          return (
            <div key={key}>
              <h2 className="font-display font-semibold text-lg mb-3">{meta?.name ?? key}</h2>
              <div className="space-y-3">
                {items.map((i: any) => <InterventionCard key={i.id} intervention={i} />)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function InterventionCard({ intervention: i }: { intervention: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', i.isNative ? 'bg-primary/10' : 'bg-amber-500/10')}>
            {i.isNative ? <Wrench className="w-4 h-4 text-primary" /> : <Star className="w-4 h-4 text-amber-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">{i.name}</h3>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', i.isNative ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700')}>
                {i.isNative ? 'Nativa' : 'Personalizada'}
              </span>
            </div>
            {i.description && <p className="text-xs text-muted-foreground mt-0.5">{i.description}</p>}
          </div>
        </div>
        {expanded && i.instructions && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium text-xs text-muted-foreground mb-1">Instruções de aplicação:</p>
            <p className="whitespace-pre-wrap">{i.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
