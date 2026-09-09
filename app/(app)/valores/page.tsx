'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, BookOpen, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'motivam', label: 'Motivam', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', desc: 'Valores que te energizam e movem para a ação.' },
  { key: 'realizam', label: 'Realizam', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', desc: 'Valores que trazem sensação de realização e propósito.' },
  { key: 'direcionam', label: 'Direcionam', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', desc: 'Valores que servem como bússola para suas decisões.' },
] as const;

type Category = typeof CATEGORIES[number]['key'];

interface ValorItem {
  valor: string;
  category: Category;
}

export default function ValoresPage() {
  const [step, setStep] = useState<'intro' | 'ilha' | 'categorize' | 'result'>('intro');
  const [ilhaInput, setIlhaInput] = useState('');
  const [valores, setValores] = useState<ValorItem[]>([]);
  const [newValor, setNewValor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<ValorItem[] | null>(null);

  useEffect(() => {
    fetch('/api/valores')
      .then(r => r.json())
      .then(data => {
        if (data?.valores?.length) {
          setSaved(data.valores);
          setValores(data.valores);
          setIlhaInput(data.ilhaDeserta || '');
          setStep('result');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addValor = useCallback(() => {
    const v = newValor.trim();
    if (!v) return;
    setValores(prev => [...prev, { valor: v, category: 'motivam' }]);
    setNewValor('');
  }, [newValor]);

  const removeValor = useCallback((idx: number) => {
    setValores(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const changeCategory = useCallback((idx: number, cat: Category) => {
    setValores(prev => prev.map((v, i) => i === idx ? { ...v, category: cat } : v));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/valores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ilhaDeserta: ilhaInput, valores }),
      });
      setSaved(valores);
      setStep('result');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleRedo = () => {
    setStep('intro');
    setValores([]);
    setIlhaInput('');
    setSaved(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clareza dos Valores Essenciais</h1>
          <p className="text-muted-foreground mt-1">Descubra o que realmente importa para você através do exercício da ilha deserta.</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">O Exercício da Ilha Deserta</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Imagine que você ficará em uma ilha deserta por um ano. Não há ameaças físicas — comida, água e abrigo estão garantidos. 
              Porém, você só pode levar <strong>5 coisas intangíveis</strong> (sentimentos, qualidades, princípios) que vão te sustentar emocionalmente durante esse período.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Esse exercício revela seus valores essenciais: aquilo que, se removido, faria sua vida perder significado.
            </p>
            <Button onClick={() => setStep('ilha')} className="w-full sm:w-auto">
              Começar o exercício <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'ilha') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Ilha Deserta</h1>
          <p className="text-muted-foreground mt-1">Reflita e escreva livremente sobre o que levaria com você.</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Descreva as 5 coisas intangíveis que levaria. Pode ser um parágrafo livre ou uma lista — o importante é ser honesto(a) consigo.</p>
            <textarea
              className="w-full min-h-[160px] rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              placeholder="Ex: Amor da minha família, liberdade de expressão, curiosidade, paz interior, senso de propósito..."
              value={ilhaInput}
              onChange={e => setIlhaInput(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Agora, extraia de tudo o que escreveu os valores individuais que mais importam:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Digite um valor (ex: Liberdade)"
                value={newValor}
                onChange={e => setNewValor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addValor()}
              />
              <Button onClick={addValor} size="icon" variant="outline" disabled={!newValor.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {valores.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {valores.map((v, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1 px-3 gap-1">
                    {v.valor}
                    <button onClick={() => removeValor(i)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('intro')}>Voltar</Button>
              <Button onClick={() => setStep('categorize')} disabled={valores.length === 0}>
                Categorizar valores ({valores.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'categorize') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Categorize seus valores</h1>
          <p className="text-muted-foreground mt-1">Para cada valor, escolha a categoria que melhor descreve seu papel na sua vida.</p>
        </div>
        <div className="grid gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center gap-2 text-sm">
              <Badge className={cn('text-xs', cat.color)}>{cat.label}</Badge>
              <span className="text-muted-foreground">{cat.desc}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {valores.map((v, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <span className="font-medium">{v.valor}</span>
                <div className="flex gap-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => changeCategory(i, cat.key)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all',
                        v.category === cat.key
                          ? cat.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep('ilha')}>Voltar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : 'Salvar valores'}
          </Button>
        </div>
      </div>
    );
  }

  // Result
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: valores.filter(v => v.category === cat.key),
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Seus Valores Essenciais</h1>
          <p className="text-muted-foreground mt-1">Lista priorizada dos valores que guiam sua vida.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRedo}>Refazer</Button>
      </div>
      {grouped.map(g => (
        <Card key={g.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge className={cn('text-xs', g.color)}>{g.label}</Badge>
              <span className="text-muted-foreground text-sm font-normal">{g.desc}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {g.items.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum valor nesta categoria.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {g.items.map((v, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1 px-3">{v.valor}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {ilhaInput && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Sua reflexão da Ilha Deserta</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ilhaInput}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
