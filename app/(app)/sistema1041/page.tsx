'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, ChevronRight, Plus, Trash2, Star, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalItem {
  id?: string;
  text: string;
  level: 'ten' | 'four' | 'one';
}

export default function Sistema1041Page() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [activeLevel, setActiveLevel] = useState<'ten' | 'four' | 'one'>('ten');

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/sistema1041');
      const data = await res.json();
      setGoals(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = async () => {
    const text = newGoal.trim();
    if (!text) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sistema1041', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level: activeLevel }),
      });
      if (res.ok) {
        await fetchGoals();
        setNewGoal('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const promoteGoal = async (id: string, newLevel: 'four' | 'one') => {
    try {
      await fetch('/api/sistema1041', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, level: newLevel }),
      });
      await fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await fetch('/api/sistema1041', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const tens = goals.filter(g => g.level === 'ten');
  const fours = goals.filter(g => g.level === 'four');
  const ones = goals.filter(g => g.level === 'one');

  const LEVELS = [
    { key: 'ten' as const, label: '10 Objetivos', icon: Target, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', items: tens, max: 10, desc: 'Liste tudo o que deseja conquistar' },
    { key: 'four' as const, label: '4 Prioridades', icon: Star, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', items: fours, max: 4, desc: 'Selecione as 4 mais importantes' },
    { key: 'one' as const, label: '1 Meta', icon: Trophy, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', items: ones, max: 1, desc: 'A meta que será seu foco absoluto' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Sistema de Realização 10-4-1</h1>
        <p className="text-muted-foreground mt-1">Funil de objetivos: comece com 10, priorize 4, focalize 1.</p>
      </div>

      {/* Funnel visual */}
      <div className="flex items-center justify-center gap-2 py-4">
        {LEVELS.map((lvl, i) => (
          <div key={lvl.key} className="flex items-center gap-2">
            <button
              onClick={() => setActiveLevel(lvl.key)}
              className={cn(
                'flex flex-col items-center p-3 rounded-xl transition-all border-2',
                activeLevel === lvl.key ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:bg-muted/50'
              )}
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', lvl.color)}>
                <lvl.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium mt-1">{lvl.label}</span>
              <Badge variant="outline" className="text-[10px] mt-1">{lvl.items.length}/{lvl.max}</Badge>
            </button>
            {i < LEVELS.length - 1 && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Active level card */}
      {LEVELS.map(lvl => lvl.key === activeLevel && (
        <Card key={lvl.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge className={cn('text-xs', lvl.color)}>{lvl.label}</Badge>
              <span className="text-muted-foreground text-sm font-normal">{lvl.desc}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lvl.items.length < lvl.max && (
              <div className="flex gap-2">
                <Input
                  placeholder={lvl.key === 'ten' ? 'Adicionar um objetivo...' : lvl.key === 'four' ? 'Adicionar uma prioridade...' : 'Definir sua meta principal...'}
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addGoal()}
                />
                <Button onClick={addGoal} disabled={saving || !newGoal.trim()} size="icon" variant="outline">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            )}
            {lvl.items.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                {lvl.key === 'ten' ? 'Comece listando seus objetivos.' : lvl.key === 'four' ? 'Promova objetivos da lista de 10 ou adicione diretamente.' : 'Promova uma prioridade ou defina sua meta.'}
              </p>
            ) : (
              <div className="space-y-2">
                {lvl.items.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 group">
                    <span className="flex-1 text-sm">{g.text}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {lvl.key === 'ten' && fours.length < 4 && (
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => promoteGoal(g.id!, 'four')}>→ 4</Button>
                      )}
                      {lvl.key === 'four' && ones.length < 1 && (
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => promoteGoal(g.id!, 'one')}>→ 1</Button>
                      )}
                      <button onClick={() => deleteGoal(g.id!)} className="p-1 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
