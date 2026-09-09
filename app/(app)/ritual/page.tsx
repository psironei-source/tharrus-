'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, SunMedium, Moon, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RitualData {
  date: string;
  mpiCriacao: boolean;
  mpiAprendizado: boolean;
  mpiConquista: boolean;
  mpiGratidao: boolean;
  npiReflexao: boolean;
  npiPlanejamento: boolean;
  npiGratidaoNoturna: boolean;
  npiDescanso: boolean;
}

const MORNING_ITEMS = [
  { key: 'mpiCriacao' as const, label: 'O que vou criar hoje?', desc: 'Defina uma ação criativa ou produtiva para o dia.' },
  { key: 'mpiAprendizado' as const, label: 'O que vou aprender hoje?', desc: 'Escolha algo novo para explorar, mesmo que pequeno.' },
  { key: 'mpiConquista' as const, label: 'O que vou conquistar hoje?', desc: 'Defina uma meta concreta e alcançável para hoje.' },
  { key: 'mpiGratidao' as const, label: 'Pelo que sou grato(a)?', desc: 'Reconheça algo bom que já existe na sua vida.' },
];

const NIGHT_ITEMS = [
  { key: 'npiReflexao' as const, label: 'O que aprendi hoje?', desc: 'Reflita sobre os aprendizados do dia.' },
  { key: 'npiPlanejamento' as const, label: 'O que farei diferente amanhã?', desc: 'Identifique um ajuste para o próximo dia.' },
  { key: 'npiGratidaoNoturna' as const, label: 'Pelo que sou grato(a) hoje?', desc: 'Encerre o dia com reconhecimento.' },
  { key: 'npiDescanso' as const, label: 'Estou em paz para descansar?', desc: 'Verifique se há algo pendente em sua mente.' },
];

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function RitualPage() {
  const [data, setData] = useState<RitualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<RitualData[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ritual');
      const json = await res.json();
      const today = getTodayStr();
      const todayData = json.find((r: RitualData) => r.date === today);
      setHistory(json || []);
      setData(todayData || {
        date: today,
        mpiCriacao: false, mpiAprendizado: false, mpiConquista: false, mpiGratidao: false,
        npiReflexao: false, npiPlanejamento: false, npiGratidaoNoturna: false, npiDescanso: false,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleItem = async (key: keyof RitualData) => {
    if (!data || key === 'date') return;
    const updated = { ...data, [key]: !data[key] };
    setData(updated);
    setSaving(true);
    try {
      await fetch('/api/ritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const morningDone = data ? MORNING_ITEMS.filter(i => data[i.key]).length : 0;
  const nightDone = data ? NIGHT_ITEMS.filter(i => data[i.key]).length : 0;
  const totalDone = morningDone + nightDone;
  const totalItems = MORNING_ITEMS.length + NIGHT_ITEMS.length;

  // Last 7 days streak
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const entry = history.find(h => h.date === ds);
    const count = entry ? MORNING_ITEMS.filter(mi => entry[mi.key]).length + NIGHT_ITEMS.filter(ni => entry[ni.key]).length : 0;
    return { date: ds, day: d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3), count };
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Ritual de Ativação e Crescimento</h1>
        <p className="text-muted-foreground mt-1">Checklist diário com as 4 perguntas cruciais para manhã e noite.</p>
      </div>

      {/* Progress today */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Progresso de hoje</p>
              <p className="text-2xl font-bold text-primary">{totalDone}/{totalItems}</p>
            </div>
            <div className="flex gap-1">
              {last7.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium',
                    d.count === totalItems ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    d.count > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {d.count}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Morning */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <SunMedium className="w-5 h-5 text-amber-500" />
            Ritual da Manhã
            <Badge variant="outline" className="text-xs">{morningDone}/{MORNING_ITEMS.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MORNING_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all',
                data?.[item.key] ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-muted/50'
              )}
            >
              {data?.[item.key]
                ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              }
              <div>
                <p className={cn('text-sm font-medium', data?.[item.key] && 'line-through text-muted-foreground')}>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Night */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            Ritual da Noite
            <Badge variant="outline" className="text-xs">{nightDone}/{NIGHT_ITEMS.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {NIGHT_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all',
                data?.[item.key] ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-muted/50'
              )}
            >
              {data?.[item.key]
                ? <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              }
              <div>
                <p className={cn('text-sm font-medium', data?.[item.key] && 'line-through text-muted-foreground')}>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {saving && <p className="text-xs text-muted-foreground text-center">Salvando...</p>}
    </div>
  );
}
