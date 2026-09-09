'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeIn, SlideIn } from '@/components/ui/animate';
import { FileDown, Brain, Heart, Shield, MessageCircle, Lock, Cloud, User, Compass, AlertCircle, ArrowRight, Loader2, Sparkles, Star, Lightbulb, Link2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RadarChartComponent = dynamic(() => import('@/components/app/radar-chart'), { ssr: false, loading: () => <div className="h-80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> });
const BarChartComponent = dynamic(() => import('@/components/app/bar-chart'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> });

const ICON_MAP: Record<string, any> = {
  brain: Brain, heart: Heart, shield: Shield, 'message-circle': MessageCircle,
  lock: Lock, cloud: Cloud, user: User, compass: Compass,
};

interface EnhancedReport {
  id: string;
  completedAt: string;
  totalAnswered: number;
  scores: { travaKey: string; name: string; normalized: number; band: string; consistency: string; variance: number }[];
  momentoEspelho: string;
  patternName: string | null;
  patternDescription: string | null;
  patternFoundation: string | null;
  travaCards: {
    travaKey: string; name: string; shortName: string; definition: string; icon: string;
    normalized: number; band: string;
    consistency: string; consistencyText: string;
    comoAparece: string; mecanismoProvavel: string; oqueCusta: string; oqueNaoSignifica: string;
    ferramentaRecomendada: string[];
    topResponses: { text: string; value: number }[];
    professionalReferral: string | null;
  }[];
  narrativaIntegrada: string;
  connectionMap: string;
  internalResources: string;
  closingInvite: string;
  lowReliability?: boolean;
}

export function ReportClient({ assessmentId }: { assessmentId: string }) {
  const [report, setReport] = useState<EnhancedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setGenerating(true);
        const res = await fetch(`/api/report/${assessmentId}/enhanced`);
        if (!res.ok) throw new Error('Erro ao gerar relatório.');
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err?.message ?? 'Erro ao carregar.');
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };
    fetchReport();
  }, [assessmentId]);

  const handleExportPDF = useCallback(async () => {
    if (!report) return;
    setPdfLoading(true);
    try {
      const htmlContent = generatePDFHtml(report);
      const createRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: htmlContent }),
      });
      const createData = await createRes.json();
      if (!createData?.success) throw new Error(createData?.error ?? 'Falha ao criar PDF.');
      const requestId = createData.request_id;
      let attempts = 0;
      const poll = async (): Promise<void> => {
        if (attempts > 150) throw new Error('Timeout.');
        attempts++;
        const statusRes = await fetch('/api/generate-pdf/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: requestId }),
        });
        const statusData = await statusRes.json();
        if (statusData?.status === 'SUCCESS' && statusData?.pdf_base64) {
          const bytes = Uint8Array.from(atob(statusData.pdf_base64), (c: string) => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Tharrus-Relatorio.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
        if (statusData?.status === 'FAILED') throw new Error(statusData?.error ?? 'Falha.');
        await new Promise((r: any) => setTimeout(r, 2000));
        return poll();
      };
      await poll();
    } catch (err: any) {
      console.error('PDF error:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  }, [report]);

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Gerando seu relatório personalizado...</p>
        <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-destructive">{error || 'Relatório não encontrado.'}</p>
          <Link href="/dashboard"><Button variant="outline" className="mt-4">Voltar ao início</Button></Link>
        </CardContent>
      </Card>
    );
  }

  const bandLabel = (b: string) => b === 'alta' ? 'Alta influência' : b === 'moderada' ? 'Influência moderada' : 'Baixa influência';
  const bandColor = (b: string) => b === 'alta' ? 'destructive' : b === 'moderada' ? 'secondary' : 'default';

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Seu Relatório</h1>
            <p className="text-sm text-muted-foreground mt-1">Mapeamento das Travas Neuropsicológicas</p>
          </div>
          <Button onClick={handleExportPDF} disabled={pdfLoading} variant="outline" className="gap-2">
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {pdfLoading ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </FadeIn>

      {/* BLOCO 0 — Transparência Metodológica */}
      <FadeIn delay={0.02}>
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 space-y-2">
          <p>Este relatório foi construído a partir das suas {report.totalAnswered || 'N'} respostas em escala de 1 a 5. Ele mapeia padrões atuais de comportamento e pensamento — não é um diagnóstico clínico.</p>
          {report.lowReliability && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 text-amber-700 dark:text-amber-400 text-xs">
              ⚠️ <strong>Nota de confiabilidade:</strong> Algumas respostas de controle de atenção não foram respondidas conforme esperado. Recomendamos refazer o questionário com mais calma para resultados mais precisos.
            </div>
          )}
        </div>
      </FadeIn>

      {/* BLOCO 1 — Momento Espelho */}
      {report.momentoEspelho && (
        <FadeIn delay={0.05}>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-primary">O que o mapeamento revelou</h2>
              </div>
              <p className="text-base leading-relaxed italic">{report.momentoEspelho}</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* BLOCO 2 — Visão Geral Visual (radar + barras) */}
      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Visão Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChartComponent scores={report.scores} />
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Ranking das Travas</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent scores={report.scores} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* BLOCO 3 — Nome do Padrão Dominante */}
      {report.patternName && (
        <FadeIn delay={0.2}>
          <Card className="border-primary/20 bg-primary/5 text-center">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Seu padrão atual</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {report.patternName}
              </h2>
              {report.patternDescription && (
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">{report.patternDescription}</p>
              )}
              {report.patternFoundation && (
                <p className="text-xs text-muted-foreground mt-2 max-w-lg mx-auto">{report.patternFoundation}</p>
              )}
              <p className="text-xs text-muted-foreground mt-3 italic">
                Este é um padrão atual, não uma identidade permanente. Ele pode ser trabalhado e transformado.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* BLOCO 4 — Card por Trava (6 partes) */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Análise Detalhada</h2>
        {(report.travaCards ?? []).map((card, idx) => {
          const IconComp = ICON_MAP[card.icon] ?? Brain;
          return (
            <FadeIn key={card.travaKey} delay={0.1 + idx * 0.04}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  {/* Header do card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{card.name}</h3>
                        <p className="text-xs text-muted-foreground">{card.definition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono">{card.normalized}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      <div className="mt-1">
                        <Badge variant={bandColor(card.band) as any}>{bandLabel(card.band)}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Parte 0: Consistência da Leitura */}
                  {card.consistencyText && (
                    <div className={`text-xs px-3 py-2 rounded-md ${card.consistency === 'alta' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400'}`}>
                      📊 {card.consistencyText}
                    </div>
                  )}

                  {/* Parte 1: Como isso aparece em você */}
                  {card.comoAparece && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Como isso aparece em você</p>
                      <p className="text-sm leading-relaxed">{card.comoAparece}</p>
                    </div>
                  )}

                  {/* Parte 2: Mecanismo provável */}
                  {card.mecanismoProvavel && (
                    <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mecanismo provável</p>
                      <p className="text-sm leading-relaxed">{card.mecanismoProvavel}</p>
                    </div>
                  )}

                  {/* Parte 3: O que isso custa hoje */}
                  {card.oqueCusta && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">O que isso custa hoje</p>
                      <p className="text-sm leading-relaxed">{card.oqueCusta}</p>
                    </div>
                  )}

                  {/* Parte 4: O que isso NÃO significa sobre você */}
                  {card.oqueNaoSignifica && (card.band === 'moderada' || card.band === 'alta') && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">O que isso NÃO significa sobre você</p>
                      <p className="text-sm leading-relaxed">{card.oqueNaoSignifica}</p>
                    </div>
                  )}

                  {/* Parte 5: Ferramenta recomendada */}
                  {(card.ferramentaRecomendada ?? []).length > 0 && (card.band === 'moderada' || card.band === 'alta') && (
                    <div className="bg-primary/5 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">🔧 Ferramenta recomendada</p>
                      <ul className="text-sm leading-relaxed">
                        {card.ferramentaRecomendada.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Top respostas */}
                  {(card.topResponses ?? []).length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Respostas que mais pesaram:</p>
                      <ul className="space-y-1">
                        {card.topResponses.map((r, i) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            • "{r.text}" (nota {r.value}/5)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Encaminhamento profissional */}
                  {card.professionalReferral && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">{card.professionalReferral}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      {/* BLOCO 9 — Narrativa Integrada (Seção 14.0) */}
      {report.narrativaIntegrada && (
        <FadeIn delay={0.23}>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-primary">Sua Narrativa Integrada</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3 italic">Por que você age do jeito que age — uma visão conectada</p>
              <div className="text-sm leading-relaxed whitespace-pre-line">{report.narrativaIntegrada}</div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* BLOCO 6 — Mapa de Conexões */}
      {report.connectionMap && (
        <FadeIn delay={0.25}>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Como suas travas se conectam</h2>
              </div>
              <p className="text-sm leading-relaxed">{report.connectionMap}</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* BLOCO 7 — Recursos Internos */}
      {report.internalResources && (
        <FadeIn delay={0.28}>
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="font-display text-lg font-semibold text-green-700 dark:text-green-300">Seus recursos internos</h2>
              </div>
              <p className="text-sm leading-relaxed">{report.internalResources}</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* BLOCO 8 — Fechamento com Convite */}
      <FadeIn delay={0.3}>
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Próximo Passo</h2>
            {report.closingInvite ? (
              <p className="text-sm leading-relaxed">{report.closingInvite}</p>
            ) : (
              <p className="text-sm leading-relaxed">Escolha 1 exercício do relatório e pratique por 7 dias consecutivos. Depois, reavalie em 30-60 dias para medir sua evolução.</p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href="/bussola">
                <Button className="gap-1.5">
                  <Compass className="w-4 h-4" /> Bússola de Ação
                </Button>
              </Link>
              <Link href="/diario">
                <Button variant="outline" className="gap-1.5">
                  Começar Diário <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/modulos">
                <Button variant="outline" className="gap-1.5">
                  Ver módulos <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Disclaimer */}
      <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
        ⚠️ Este relatório é uma ferramenta de autoconhecimento e mentoring. Não constitui diagnóstico psicológico, psiquiátrico ou médico. Se você está em sofrimento ou precisa de apoio profissional, procure um psicólogo ou psiquiatra. Seus dados são tratados com segurança conforme a LGPD.
      </div>
    </div>
  );
}

function generateGaugeSvg(score: number, color: string): string {
  const angle = (score / 100) * 180;
  const rad = (angle - 180) * (Math.PI / 180);
  const x = 100 + 80 * Math.cos(rad);
  const y = 100 + 80 * Math.sin(rad);
  const largeArc = angle > 180 ? 1 : 0;
  return `<svg width="200" height="120" viewBox="0 0 200 120" style="max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" stroke-width="16" stroke-linecap="round"/>
    <path d="M 20 100 A 80 80 0 ${largeArc} 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
    <text x="100" y="95" text-anchor="middle" font-size="28" font-weight="bold" fill="${color}">${score}</text>
    <text x="100" y="112" text-anchor="middle" font-size="10" fill="#888">/100</text>
  </svg>`;
}

function generateConnectionDiagramSvg(cards: EnhancedReport['travaCards']): string {
  const topCards = cards.filter(c => c.band !== 'baixa').slice(0, 4);
  if (topCards.length < 2) return '';
  const cx = 300, cy = 150, r = 100;
  const nodes = topCards.map((c, i) => {
    const a = (i / topCards.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), name: c.shortName, score: c.normalized };
  });
  const arrows = [];
  for (let i = 0; i < nodes.length; i++) {
    const j = (i + 1) % nodes.length;
    arrows.push(`<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="#3b9b8f" stroke-width="2" marker-end="url(#arr)"/>`);
  }
  const nodesSvg = nodes.map(n => `
    <circle cx="${n.x}" cy="${n.y}" r="36" fill="#f0fdfa" stroke="#3b9b8f" stroke-width="2"/>
    <text x="${n.x}" y="${n.y - 5}" text-anchor="middle" font-size="9" font-weight="bold" fill="#1a1a2e">${n.name}</text>
    <text x="${n.x}" y="${n.y + 10}" text-anchor="middle" font-size="10" fill="#3b9b8f">${n.score}</text>
  `).join('');
  return `<svg width="600" height="300" viewBox="0 0 600 300" style="max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
    <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#3b9b8f"/></marker></defs>
    ${arrows.join('')}
    ${nodesSvg}
  </svg>`;
}

function generateRadarSvg(scores: EnhancedReport['scores']): string {
  const n = scores.length;
  const cx = 200, cy = 200, r = 150;
  const points = scores.map((s, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const dist = (s.normalized / 100) * r;
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a), lx: cx + (r + 24) * Math.cos(a), ly: cy + (r + 24) * Math.sin(a), name: s.name };
  });
  const gridLines = [0.33, 0.66, 1].map(f => {
    const pts = scores.map((_, i) => {
      const a = (i / n) * 2 * Math.PI - Math.PI / 2;
      return `${cx + f * r * Math.cos(a)},${cy + f * r * Math.sin(a)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
  }).join('');
  const axes = scores.map((_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="#e5e7eb" stroke-width="1"/>`;
  }).join('');
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  const labels = points.map(p => `<text x="${p.lx}" y="${p.ly}" text-anchor="middle" font-size="9" fill="#555">${p.name}</text>`).join('');
  return `<svg width="480" height="380" viewBox="-40 10 480 380" style="max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
    ${gridLines}${axes}
    <polygon points="${polygon}" fill="rgba(59,155,143,0.2)" stroke="#3b9b8f" stroke-width="2"/>
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#3b9b8f"/>`).join('')}
    ${labels}
  </svg>`;
}

function generateBarsSvg(scores: EnhancedReport['scores']): string {
  const sorted = [...scores].sort((a, b) => b.normalized - a.normalized);
  const bh = 24, gap = 6, lw = 140, bw = 290;
  const h = sorted.length * (bh + gap) + 20;
  const bars = sorted.map((s, i) => {
    const y = 10 + i * (bh + gap);
    const w = (s.normalized / 100) * bw;
    const color = s.band === 'alta' ? '#ef4444' : s.band === 'moderada' ? '#eab308' : '#22c55e';
    return `<text x="${lw - 6}" y="${y + bh / 2 + 4}" text-anchor="end" font-size="10" fill="#555">${s.name}</text>
      <rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="#f3f4f6"/>
      <rect x="${lw}" y="${y}" width="${w}" height="${bh}" rx="4" fill="${color}"/>
      <text x="${lw + w + 6}" y="${y + bh / 2 + 4}" font-size="11" font-weight="bold" fill="${color}">${s.normalized}</text>`;
  }).join('');
  return `<svg width="480" height="${h}" viewBox="0 0 480 ${h}" style="max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

function generatePDFHtml(report: EnhancedReport): string {
  const bandLabel = (b: string) => b === 'alta' ? 'Alta' : b === 'moderada' ? 'Moderada' : 'Baixa';
  const bandColor = (b: string) => b === 'alta' ? '#ef4444' : b === 'moderada' ? '#eab308' : '#22c55e';
  const completedDate = report.completedAt ? new Date(report.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  const needsReferral = (report.travaCards ?? []).some(c => c.professionalReferral);

  // Página 1 — Capa
  const p1 = `<div style="page-break-after:always;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:95vh;text-align:center">
    <div style="margin-bottom:40px">
      <h1 style="font-size:36px;color:#3b9b8f;margin:0">Tharrus</h1>
      <p style="font-size:14px;color:#888;margin-top:8px">Seu mapa de travas e potencial</p>
    </div>
    <div style="width:80px;height:4px;background:#3b9b8f;border-radius:2px;margin:20px 0"></div>
    <p style="font-size:12px;color:#666;margin-top:20px">Relatório personalizado</p>
    <p style="font-size:11px;color:#999;margin-top:4px">${completedDate}</p>
  </div>`;

  // Página 2 — Nota Metodológica + Momento Espelho
  const reliabilityNote = report.lowReliability ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin:12px 0;font-size:11px;color:#92400e">
    ⚠️ <strong>Nota de confiabilidade:</strong> Algumas respostas de controle de atenção não foram respondidas conforme esperado. Recomendamos refazer o questionário com mais calma para resultados mais precisos.
  </div>` : '';
  const p2 = `<div style="page-break-after:always">
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Transparência Metodológica</h2>
    <div style="background:#f8fafb;padding:16px;border-radius:8px;margin-bottom:16px">
      <p style="font-size:12px;line-height:1.7;margin:0">Este relatório foi construído a partir das suas <strong>${report.totalAnswered || 'N'}</strong> respostas em escala de 1 a 5 (Discordo totalmente a Concordo totalmente). Ele mapeia padrões atuais de comportamento e pensamento — <strong>não é um diagnóstico clínico</strong>. Cada pontuação reflete a média normalizada (0–100) dos seus 8 itens naquela dimensão, classificada em: Baixa (0–33), Moderada (34–66) ou Alta (67–100) influência.</p>
    </div>
    ${reliabilityNote}
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:24px">O que o mapeamento revelou</h2>
    <div style="background:linear-gradient(135deg,#f0fdfa,#e8faf4);padding:20px;border-radius:12px;border-left:4px solid #3b9b8f">
      <p style="font-size:13px;line-height:1.7;font-style:italic;margin:0">${report.momentoEspelho || ''}</p>
    </div>
  </div>`;

  // Página 3 — Radar + Barras + Padrão
  const radarSvg = generateRadarSvg(report.scores);
  const barsSvg = generateBarsSvg(report.scores);
  const p3 = `<div style="page-break-after:always">
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Visão Geral</h2>
    <div style="text-align:center;margin-bottom:8px">${radarSvg}</div>
    <div style="text-align:center;margin-bottom:12px">${barsSvg}</div>
    ${report.patternName ? `<div style="text-align:center;padding:16px;border:2px solid #3b9b8f;border-radius:12px;margin-top:12px">
      <p style="font-size:10px;color:#3b9b8f;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">Seu padrão atual</p>
      <p style="font-size:22px;font-weight:bold;color:#1a1a2e;margin:0 0 4px">${report.patternName}</p>
      ${report.patternDescription ? `<p style="font-size:11px;color:#666;margin:0">${report.patternDescription}</p>` : ''}
      ${report.patternFoundation ? `<p style="font-size:10px;color:#999;margin:6px 0 0;font-style:italic">${report.patternFoundation}</p>` : ''}
      <p style="font-size:9px;color:#aaa;margin-top:8px;font-style:italic">Este é um padrão atual, não uma identidade permanente.</p>
    </div>` : ''}
  </div>`;

  // Páginas 4-11 — Cards individuais (1 por página, com gauge)
  const cardPages = (report.travaCards ?? []).map((c, idx) => {
    const gauge = generateGaugeSvg(c.normalized, bandColor(c.band));
    const isLast = idx === (report.travaCards?.length ?? 0) - 1;
    return `<div style="page-break-after:${isLast ? 'always' : 'always'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
        <div>
          <h2 style="color:#3b9b8f;font-size:18px;margin:0 0 4px">${c.name}</h2>
          <p style="font-size:10px;color:#888;margin:0">${c.definition}</p>
        </div>
        <div style="text-align:center">${gauge}<p style="font-size:10px;color:${bandColor(c.band)};font-weight:bold;margin:2px 0 0">${bandLabel(c.band)} influência</p></div>
      </div>
      ${c.consistencyText ? `<div style="font-size:10px;padding:8px 12px;border-radius:6px;margin-bottom:10px;${c.consistency === 'alta' ? 'background:#f0fdf4;color:#166534' : 'background:#fffbeb;color:#92400e'}">📊 ${c.consistencyText}</div>` : ''}
      ${c.comoAparece ? `<div style="margin-bottom:12px"><p style="font-size:9px;font-weight:bold;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">Como isso aparece em você</p><p style="font-size:11px;line-height:1.6;margin:0">${c.comoAparece}</p></div>` : ''}
      ${c.mecanismoProvavel ? `<div style="background:#f8f8f8;padding:12px;border-radius:8px;margin-bottom:10px"><p style="font-size:9px;font-weight:bold;color:#666;text-transform:uppercase;margin:0 0 4px">Mecanismo provável</p><p style="font-size:11px;line-height:1.6;margin:0">${c.mecanismoProvavel}</p></div>` : ''}
      ${c.oqueCusta ? `<div style="background:#fffbeb;padding:12px;border-radius:8px;margin-bottom:10px"><p style="font-size:9px;font-weight:bold;color:#92400e;text-transform:uppercase;margin:0 0 4px">O que isso custa hoje</p><p style="font-size:11px;line-height:1.6;margin:0">${c.oqueCusta}</p></div>` : ''}
      ${c.oqueNaoSignifica && (c.band === 'moderada' || c.band === 'alta') ? `<div style="background:#f0fdf4;padding:12px;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:10px"><p style="font-size:9px;font-weight:bold;color:#166534;text-transform:uppercase;margin:0 0 4px">O que isso NÃO significa sobre você</p><p style="font-size:11px;line-height:1.6;margin:0">${c.oqueNaoSignifica}</p></div>` : ''}
      ${(c.ferramentaRecomendada ?? []).length > 0 && (c.band === 'moderada' || c.band === 'alta') ? `<div style="background:#f0fdfa;padding:12px;border-radius:8px;margin-bottom:10px"><p style="font-size:9px;font-weight:bold;color:#3b9b8f;text-transform:uppercase;margin:0 0 4px">🔧 Ferramenta recomendada</p><p style="font-size:11px;margin:0">${c.ferramentaRecomendada.join(' • ')}</p></div>` : ''}
      ${c.professionalReferral ? `<div style="background:#dbeafe;padding:12px;border-radius:8px;border:1px solid #93c5fd;margin-top:8px"><p style="font-size:11px;line-height:1.5;margin:0">${c.professionalReferral}</p></div>` : ''}
    </div>`;
  }).join('');

  // Página 12 — Narrativa Integrada
  const p12 = `<div style="page-break-after:always">
    <h2 style="color:#3b9b8f;font-size:20px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Sua Narrativa Integrada</h2>
    <p style="font-size:11px;color:#888;font-style:italic;margin:0 0 16px">Por que você age do jeito que age — uma visão conectada</p>
    <div style="background:linear-gradient(135deg,#f0fdfa,#e8faf4);padding:24px;border-radius:12px;border-left:4px solid #3b9b8f">
      <p style="font-size:12px;line-height:1.8;margin:0;white-space:pre-line">${report.narrativaIntegrada || 'Gerando narrativa...'}</p>
    </div>
  </div>`;

  // Página 13 — Mapa de Conexões
  const connDiagram = generateConnectionDiagramSvg(report.travaCards);
  const p13 = `<div style="page-break-after:always">
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Mapa de Conexões</h2>
    ${connDiagram ? `<div style="text-align:center;margin:20px 0">${connDiagram}</div>` : ''}
    <div style="background:#fefce8;padding:16px;border-radius:8px">
      <p style="font-size:12px;line-height:1.7;margin:0">${report.connectionMap || ''}</p>
    </div>
  </div>`;

  // Página 14 — Recursos Internos
  const p14 = `<div style="page-break-after:always">
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Seus Recursos Internos</h2>
    <div style="background:#f0fdf4;padding:20px;border-radius:12px;border-left:4px solid #22c55e">
      <p style="font-size:12px;line-height:1.7;margin:0">${report.internalResources || ''}</p>
    </div>
    <div style="margin-top:20px;padding:16px;background:#f8f8f8;border-radius:8px">
      <p style="font-size:11px;color:#666;margin:0;line-height:1.6">Estas áreas de baixa pontuação indicam forças e recursos naturais que você já tem disponíveis. Eles podem servir como ponto de apoio para trabalhar as áreas de maior influência.</p>
    </div>
  </div>`;

  // Página 15 — Fechamento com Convite
  const p15 = `<div style="page-break-after:${needsReferral ? 'always' : 'always'}">
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Próximo Passo</h2>
    <div style="background:#f0fdfa;padding:20px;border-radius:12px;border-left:4px solid #3b9b8f">
      <p style="font-size:13px;line-height:1.7;margin:0">${report.closingInvite || 'Escolha 1 exercício do relatório e pratique por 7 dias consecutivos. Depois, reavalie em 30-60 dias para medir sua evolução.'}</p>
    </div>
    <div style="text-align:center;margin-top:30px">
      <p style="font-size:12px;color:#666">Recomendamos reavaliar em 30–60 dias para acompanhar sua evolução.</p>
    </div>
  </div>`;

  // Página 16 — Encaminhamento profissional (condicional)
  const referrals = (report.travaCards ?? []).filter(c => c.professionalReferral);
  const p16 = needsReferral ? `<div style="page-break-after:always">
    <h2 style="color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0">Apoio Profissional Recomendado</h2>
    <div style="background:#dbeafe;padding:20px;border-radius:12px;border:1px solid #93c5fd">
      ${referrals.map(c => `<div style="margin-bottom:12px"><p style="font-size:11px;font-weight:bold;color:#1e40af;margin:0 0 4px">${c.name}</p><p style="font-size:12px;line-height:1.6;margin:0">${c.professionalReferral}</p></div>`).join('')}
    </div>
    <div style="margin-top:16px;padding:12px;background:#f0f9ff;border-radius:8px">
      <p style="font-size:11px;color:#1e40af;margin:0;line-height:1.5">Buscar apoio profissional é um ato de coragem e cuidado consigo mesmo(a). Não há vergonha nisso — é um passo inteligente de quem leva a sério sua própria evolução.</p>
    </div>
  </div>` : '';

  // Página 17 — Disclaimer / Contracapa
  const p17 = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:80vh;text-align:center">
    <div style="max-width:450px">
      <h2 style="color:#3b9b8f;font-size:16px;border:none;margin:0 0 16px">Aviso Importante</h2>
      <p style="font-size:11px;line-height:1.7;color:#666;margin:0 0 20px">
        Este relatório é uma ferramenta de autoconhecimento e mentoring baseada na metodologia de Neuromentoring. <strong>Não constitui diagnóstico psicológico, psiquiátrico ou médico.</strong> Se você está em sofrimento ou precisa de apoio profissional, procure um psicólogo ou psiquiatra.
      </p>
      <p style="font-size:10px;color:#999;margin:0 0 16px">Seus dados são tratados com segurança conforme a LGPD.</p>
      <div style="width:60px;height:3px;background:#3b9b8f;border-radius:2px;margin:20px auto"></div>
      <p style="font-size:13px;color:#3b9b8f;font-weight:bold;margin:16px 0 4px">Tharrus</p>
      <p style="font-size:10px;color:#888">Mapeando suas travas. Liberando seu potencial.</p>
    </div>
  </div>`;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>
    @page{size:A4;margin:24mm 18mm}
    body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1a1a2e;line-height:1.5;margin:0;padding:0}
    h2{color:#3b9b8f;font-size:18px;border-bottom:2px solid #3b9b8f;padding-bottom:4px;margin-top:0}
  </style></head><body>
    ${p1}${p2}${p3}${cardPages}${p12}${p13}${p14}${p15}${p16}${p17}
  </body></html>`;
}
