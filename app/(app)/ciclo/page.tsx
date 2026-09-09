'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CicloEntry {
  id?: string;
  situacao: string;
  pensamento: string;
  emocao: string;
  reacao: string;
  resultado: string;
  createdAt?: string;
}

const FIELDS = [
  { key: 'situacao' as const, label: 'Situação', placeholder: 'O que aconteceu? Descreva a situação.' },
  { key: 'pensamento' as const, label: 'Pensamento automático', placeholder: 'Qual pensamento surgiu na hora?' },
  { key: 'emocao' as const, label: 'Emoção', placeholder: 'Que emoção isso gerou? (raiva, medo, tristeza...)' },
  { key: 'reacao' as const, label: 'Reação / Comportamento', placeholder: 'O que você fez ou deixou de fazer?' },
  { key: 'resultado' as const, label: 'Resultado', placeholder: 'Qual foi a consequência da reação?' },
];

export default function CicloPage() {
  const [entries, setEntries] = useState<CicloEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CicloEntry>({ situacao: '', pensamento: '', emocao: '', reacao: '', resultado: '' });

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/ciclo');
      const data = await res.json();
      setEntries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!form.situacao.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/ciclo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchEntries();
        setForm({ situacao: '', pensamento: '', emocao: '', reacao: '', resultado: '' });
        setShowForm(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/ciclo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchEntries();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Ciclo de Pensar e Sentir</h1>
          <p className="text-muted-foreground mt-1">Reflexão guiada: Situação → Pensamento → Emoção → Reação → Resultado.</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Novo registro
        </Button>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Como funciona</p>
              <p>Registre situações do dia a dia que geraram reações emocionais. Ao mapear a cadeia completa (da situação ao resultado), você identifica padrões automáticos e ganha consciência para fazer escolhas diferentes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Novo ciclo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium mb-1 block">{f.label}</label>
                <textarea
                  className="w-full min-h-[60px] rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.situacao.trim()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Salvar
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && !showForm ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum registro ainda. Clique em "Novo registro" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((e, i) => (
            <Card key={e.id || i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-muted-foreground">
                    {e.createdAt ? new Date(e.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                  </p>
                  {e.id && (
                    <button onClick={() => handleDelete(e.id!)} className="p-1 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {FIELDS.map((f, fi) => (
                    <div key={f.key} className="flex items-center gap-2">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{f.label}</p>
                        <p className="mt-0.5">{e[f.key] || '—'}</p>
                      </div>
                      {fi < FIELDS.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
