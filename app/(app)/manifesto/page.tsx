'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Scroll, Plus, Trash2, Loader2, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { cn } from '@/lib/utils';

interface Belief {
  limiting: string;
  origin: string;
  reinforcement: string;
  cost: string;
  empowering: string;
}

interface Manifesto {
  id: string;
  travaKey: string;
  beliefsJson: string;
  manifestoText: string | null;
  status: string;
  createdAt: string;
}

const EMPTY_BELIEF: Belief = { limiting: '', origin: '', reinforcement: '', cost: '', empowering: '' };

export default function ManifestoPage() {
  const [manifestos, setManifestos] = useState<Manifesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [beliefs, setBeliefs] = useState<Belief[]>([{ ...EMPTY_BELIEF }]);
  const [generating, setGenerating] = useState(false);
  const [viewManifesto, setViewManifesto] = useState<Manifesto | null>(null);
  const [error, setError] = useState('');
  const [expandedBelief, setExpandedBelief] = useState<number>(0);

  const load = async () => {
    try {
      const res = await fetch('/api/manifesto');
      const data = await res.json();
      setManifestos(Array.isArray(data) ? data : []);
    } catch { setManifestos([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateBelief = (idx: number, field: keyof Belief, value: string) => {
    setBeliefs(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };

  const addBelief = () => {
    setBeliefs(prev => [...prev, { ...EMPTY_BELIEF }]);
    setExpandedBelief(beliefs.length);
  };

  const removeBelief = (idx: number) => {
    if (beliefs.length <= 1) return;
    setBeliefs(prev => prev.filter((_, i) => i !== idx));
    if (expandedBelief >= beliefs.length - 1) setExpandedBelief(Math.max(0, expandedBelief - 1));
  };

  const generate = async () => {
    const valid = beliefs.filter(b => b.limiting.trim());
    if (valid.length === 0) { setError('Preencha pelo menos uma crença limitante.'); return; }
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beliefs: valid, generateManifesto: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao gerar.'); }
      else {
        setBeliefs([{ ...EMPTY_BELIEF }]);
        setExpandedBelief(0);
        await load();
        setViewManifesto(data);
      }
    } catch { setError('Erro de conexão.'); }
    setGenerating(false);
  };

  const saveDraft = async () => {
    const valid = beliefs.filter(b => b.limiting.trim());
    if (valid.length === 0) { setError('Preencha pelo menos uma crença.'); return; }
    setGenerating(true);
    try {
      await fetch('/api/manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beliefs: valid, generateManifesto: false }),
      });
      setBeliefs([{ ...EMPTY_BELIEF }]);
      await load();
    } catch { /* ignore */ }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (viewManifesto) {
    const manifestoBeliefs: Belief[] = (() => { try { return JSON.parse(viewManifesto.beliefsJson); } catch { return []; } })();

    return (
      <div className="space-y-6">
        <FadeIn>
          <Button variant="ghost" onClick={() => setViewManifesto(null)}>← Voltar</Button>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-primary/20">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Scroll className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Seu Manifesto Pessoal</CardTitle>
              <CardDescription>Gerado em {new Date(viewManifesto.createdAt).toLocaleDateString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Mapeamento de Crenças</h4>
                <div className="space-y-3">
                  {manifestoBeliefs.map((b, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200/50">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Crença Limitante</p>
                        <p className="text-sm">{b.limiting}</p>
                        {b.origin && <p className="text-xs text-muted-foreground mt-1">Origem: {b.origin}</p>}
                        {b.cost && <p className="text-xs text-muted-foreground">Custo: {b.cost}</p>}
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border border-emerald-200/50">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Crença Fortalecedora</p>
                        <p className="text-sm">{b.empowering || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewManifesto.manifestoText && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                  <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Manifesto
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    {viewManifesto.manifestoText.split('\n').filter(Boolean).map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed mb-3">{p}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Scroll className="w-7 h-7 text-primary" /> Manifesto de Crenças
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mapeie suas crenças limitantes, descubra suas origens e custos, e gere um manifesto pessoal de substituição para ler diariamente.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mapeamento Cruzado de Crenças</CardTitle>
            <CardDescription>Identifique cada crença limitante, sua origem, como ela se reforça no dia a dia e o que ela custa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {beliefs.map((belief, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedBelief(expandedBelief === idx ? -1 : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">
                    Crença {idx + 1}{belief.limiting ? `: ${belief.limiting.slice(0, 50)}${belief.limiting.length > 50 ? '...' : ''}` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {beliefs.length > 1 && (
                      <button
                        onClick={e => { e.stopPropagation(); removeBelief(idx); }}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {expandedBelief === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expandedBelief === idx && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Crença limitante *</label>
                      <Textarea
                        value={belief.limiting}
                        onChange={e => updateBelief(idx, 'limiting', e.target.value)}
                        placeholder="Ex: Eu não sou capaz de ter sucesso nas coisas que importam."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">De onde vem essa crença?</label>
                      <Input
                        value={belief.origin}
                        onChange={e => updateBelief(idx, 'origin', e.target.value)}
                        placeholder="Ex: Críticas constantes na infância."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Como essa crença se reforça?</label>
                      <Input
                        value={belief.reinforcement}
                        onChange={e => updateBelief(idx, 'reinforcement', e.target.value)}
                        placeholder="Ex: Evito desafios para não confirmar a crença."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">O que essa crença custa no dia a dia?</label>
                      <Input
                        value={belief.cost}
                        onChange={e => updateBelief(idx, 'cost', e.target.value)}
                        placeholder="Ex: Deixo de buscar oportunidades e me sinto estagnado(a)."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Crença fortalecedora substituta (opcional — a IA pode gerar)</label>
                      <Textarea
                        value={belief.empowering}
                        onChange={e => updateBelief(idx, 'empowering', e.target.value)}
                        placeholder="Ex: Eu posso aprender e crescer com cada desafio."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <Button variant="outline" onClick={addBelief} className="gap-1" size="sm">
                <Plus className="w-4 h-4" /> Adicionar Crença
              </Button>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={saveDraft} disabled={generating} size="sm">
                  Salvar Rascunho
                </Button>
                <Button onClick={generate} disabled={generating} className="gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? 'Gerando Manifesto...' : 'Gerar Manifesto'}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Seus Manifestos ({manifestos.length})</h3>
          {manifestos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Scroll className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Você ainda não criou nenhum manifesto.</p>
                <p className="text-xs mt-1">Mapeie suas crenças acima e gere seu manifesto pessoal.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {manifestos.map(m => {
                const mBeliefs: Belief[] = (() => { try { return JSON.parse(m.beliefsJson); } catch { return []; } })();
                return (
                  <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewManifesto(m)}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Scroll className="w-4 h-4 text-primary shrink-0" />
                            <h4 className="font-semibold">
                              {mBeliefs.length} crença{mBeliefs.length !== 1 ? 's' : ''} mapeada{mBeliefs.length !== 1 ? 's' : ''}
                            </h4>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              m.status === 'finalized' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            )}>
                              {m.status === 'finalized' ? 'Finalizado' : 'Rascunho'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {mBeliefs.map(b => b.limiting).filter(Boolean).join(' | ') || 'Sem crenças mapeadas'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
