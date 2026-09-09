'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Loader2, FileText, Eye, Archive, Sparkles, User, Calendar } from 'lucide-react';
import { FadeIn } from '@/components/ui/animate';
import { cn } from '@/lib/utils';

interface CaseStudyNarrative {
  summary?: string;
  context?: string;
  journey?: string;
  keyInsights?: string[];
  outcome?: string;
  methodology?: string;
  suggestedTitle?: string;
}

interface CaseStudy {
  id: string;
  title: string;
  narrativeJson: string;
  travasFocus: string;
  anonymizedName: string;
  status: string;
  consentGiven: boolean;
  createdAt: string;
  client?: { name: string; email: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-amber-100 text-amber-800' },
  published: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-800' },
  archived: { label: 'Arquivado', color: 'bg-gray-100 text-gray-600' },
};

export default function AutoridadePage() {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [viewStudy, setViewStudy] = useState<CaseStudy | null>(null);
  const [error, setError] = useState('');

  const loadStudies = async () => {
    try {
      const res = await fetch('/api/pro/case-studies');
      const data = await res.json();
      setStudies(Array.isArray(data) ? data : []);
    } catch { setStudies([]); }
  };

  const loadClients = async () => {
    try {
      const res = await fetch('/api/pro/clients');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Mapear para formato simples: { id, name, consentGiven }
        setClients(
          data
            .filter((c: any) => c.consentGiven && c.linkStatus === 'active')
            .map((c: any) => ({ id: c.client?.id, name: c.client?.name, email: c.client?.email }))
            .filter((c: any) => c.id)
        );
      }
    } catch { setClients([]); }
  };

  useEffect(() => {
    Promise.all([loadStudies(), loadClients()]).finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (!selectedClient) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/pro/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao gerar.');
      } else {
        setSelectedClient('');
        await loadStudies();
      }
    } catch { setError('Erro de conexão.'); }
    setGenerating(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/pro/case-studies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await loadStudies();
    if (viewStudy?.id === id) setViewStudy(prev => prev ? { ...prev, status } : null);
  };

  const parseNarrative = (json: string): CaseStudyNarrative => {
    try { return JSON.parse(json); } catch { return {}; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (viewStudy) {
    const narrative = parseNarrative(viewStudy.narrativeJson);
    const st = STATUS_LABELS[viewStudy.status] || STATUS_LABELS.draft;

    return (
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setViewStudy(null)}>← Voltar</Button>
            <div className="flex gap-2">
              {viewStudy.status === 'draft' && (
                <Button size="sm" onClick={() => updateStatus(viewStudy.id, 'published')} className="gap-1">
                  <Eye className="w-4 h-4" /> Publicar
                </Button>
              )}
              {viewStudy.status === 'published' && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(viewStudy.id, 'archived')} className="gap-1">
                  <Archive className="w-4 h-4" /> Arquivar
                </Button>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{viewStudy.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <User className="w-3 h-3" /> {viewStudy.anonymizedName} (anonimizado)
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', st.color)}>{st.label}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {narrative.summary && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Resumo Executivo</h4>
                  <p className="text-base leading-relaxed">{narrative.summary}</p>
                </div>
              )}
              {narrative.context && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Contexto</h4>
                  <p className="text-sm leading-relaxed">{narrative.context}</p>
                </div>
              )}
              {narrative.journey && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Jornada de Transformação</h4>
                  <p className="text-sm leading-relaxed">{narrative.journey}</p>
                </div>
              )}
              {narrative.keyInsights && narrative.keyInsights.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Insights Principais</h4>
                  <ul className="space-y-2">
                    {narrative.keyInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {narrative.outcome && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Resultados</h4>
                  <p className="text-sm leading-relaxed">{narrative.outcome}</p>
                </div>
              )}
              {narrative.methodology && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Metodologia Aplicada</h4>
                  <p className="text-sm leading-relaxed">{narrative.methodology}</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Award className="w-7 h-7 text-primary" /> Material de Autoridade
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gere case studies profissionais a partir da evolução real dos seus clientes, com dados anonimizados e consentimento.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Gerar Novo Case Study
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um cliente com consentimento...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.email || c.id}
                  </option>
                ))}
              </select>
              <Button onClick={generate} disabled={!selectedClient || generating} className="gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Gerando...' : 'Gerar Case Study'}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                Nenhum cliente com consentimento ativo. O cliente precisa ter vínculo ativo com consentimento e pelo menos 2 avaliações realizadas.
              </p>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Seus Case Studies ({studies.length})</h3>
          {studies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Nenhum case study gerado ainda.</p>
                <p className="text-xs mt-1">Selecione um cliente acima para gerar seu primeiro material de autoridade.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {studies.map(study => {
                const narrative = parseNarrative(study.narrativeJson);
                const st = STATUS_LABELS[study.status] || STATUS_LABELS.draft;
                return (
                  <Card key={study.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewStudy(study)}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{study.title}</h4>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', st.color)}>{st.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {narrative.summary || 'Case study sem resumo.'}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{study.anonymizedName}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(study.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <Eye className="w-4 h-4" />
                        </Button>
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
