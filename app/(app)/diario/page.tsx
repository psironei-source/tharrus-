'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Smile, Frown, Meh, Heart, Zap } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { TRAVA_META } from '@/lib/questions';
import { cn } from '@/lib/utils';

const MOODS = [
  { label: 'Bem', icon: Smile, color: 'text-emerald-500' },
  { label: 'Neutro', icon: Meh, color: 'text-gray-400' },
  { label: 'Ansioso', icon: Zap, color: 'text-amber-500' },
  { label: 'Triste', icon: Frown, color: 'text-blue-400' },
  { label: 'Grato', icon: Heart, color: 'text-pink-500' },
];

export default function DiarioPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadEntries = () => fetch('/api/diary').then(r => r.json()).then(setEntries).finally(() => setLoading(false));
  useEffect(() => { loadEntries(); }, []);

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, mood: mood || null }),
    });
    setContent('');
    setMood('');
    setShowForm(false);
    setSubmitting(false);
    loadEntries();
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Meu Diário
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Registre pensamentos e sentimentos entre sessões</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nova Entrada
          </Button>
        </div>
      </FadeIn>

      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Como você está se sentindo?</p>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.label}
                      onClick={() => setMood(mood === m.label ? '' : m.label)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all',
                        mood === m.label ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', m.color)} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">O que está na sua mente hoje?</p>
              <Textarea
                value={content}
                onChange={(e: any) => setContent(e.target.value)}
                placeholder="Descreva seus pensamentos, sentimentos, reflexões do dia..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={!content.trim() || submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma entrada no diário ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">Comece registrando como você está se sentindo hoje.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {e.mood && (() => {
                      const m = MOODS.find(x => x.label === e.mood);
                      if (!m) return null;
                      const Icon = m.icon;
                      return <Icon className={cn('w-5 h-5', m.color)} />;
                    })()}
                    <span suppressHydrationWarning className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </span>
                  </div>
                  {e.mood && <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{e.mood}</span>}
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{e.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
