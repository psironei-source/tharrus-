'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, CheckCircle, MessageSquare, Lightbulb, ClipboardCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SessaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [reflWhat, setReflWhat] = useState('');
  const [reflBlock, setReflBlock] = useState('');
  const [reflNext, setReflNext] = useState('');
  const [checklist, setChecklist] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/pro/sessions/${id}`).then(r => r.json()).then(s => {
      setSession(s);
      setNotes(s.sessionNotes || '');
      setReflWhat(s.reflectionWhat || '');
      setReflBlock(s.reflectionBlock || '');
      setReflNext(s.reflectionNext || '');
      try { setChecklist(JSON.parse(s.checklistJson || '[]')); } catch { setChecklist([]); }
    }).finally(() => setLoading(false));
  }, [id]);

  const brief = (() => { try { return JSON.parse(session?.briefJson || '{}'); } catch { return {}; } })();
  const questions: string[] = (() => { try { return JSON.parse(session?.suggestedQuestionsJson || '[]'); } catch { return []; } })();

  const save = async (data: any) => {
    setSaving(true);
    await fetch(`/api/pro/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
  };

  const toggleChecklist = (idx: number) => {
    const updated = [...checklist];
    updated[idx] = { ...updated[idx], done: !updated[idx].done };
    setChecklist(updated);
    save({ checklistJson: JSON.stringify(updated) });
  };

  const startSession = () => save({ status: 'in_progress' }).then(() => setSession((s: any) => ({ ...s, status: 'in_progress' })));
  const completeSession = () => save({ status: 'completed', sessionNotes: notes, reflectionWhat: reflWhat, reflectionBlock: reflBlock, reflectionNext: reflNext })
    .then(() => setSession((s: any) => ({ ...s, status: 'completed' })));

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!session) return <p className="text-center py-12 text-muted-foreground">Sessão não encontrada.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pro/sessoes"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{session.title || `Sessão ${session.sessionNumber}`}</h1>
          <p className="text-sm text-muted-foreground">{session.client?.name} {session.program ? `• ${session.program.name}` : ''}</p>
        </div>
        {session.status === 'scheduled' && (
          <Button onClick={startSession} className="gap-1.5"><Play className="w-4 h-4" /> Iniciar</Button>
        )}
        {session.status === 'in_progress' && (
          <Button onClick={completeSession} className="gap-1.5" variant="default"><CheckCircle className="w-4 h-4" /> Concluir</Button>
        )}
      </div>

      {/* Brief pré-sessão */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Brief Pré-Sessão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="text-sm font-medium">{brief.clientName ?? 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Trava em Foco</p>
              <p className="text-sm font-medium">{brief.travaFoco ? `${brief.travaFoco.key} (${brief.travaFoco.normalized}%)` : 'N/A'}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Última sessão</p>
            <p className="text-sm">{brief.lastSessionSummary ?? 'Primeira sessão'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary" /> Checklist da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checklist.map((item: any, idx: number) => (
              <label key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(idx)} className="rounded border-border" />
                <span className={cn('text-sm', item.done && 'line-through text-muted-foreground')}>{item.text}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Perguntas sugeridas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> Perguntas Sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {questions.map((q: string, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                “{q}”
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notas da sessão */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Notas da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e: any) => setNotes(e.target.value)}
            placeholder="Anotações durante a sessão..."
            rows={4}
            onBlur={() => save({ sessionNotes: notes })}
          />
        </CardContent>
      </Card>

      {/* Reflexão pós-sessão */}
      {(session.status === 'in_progress' || session.status === 'completed') && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reflexão Pós-Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">O que funcionou?</p>
              <Textarea value={reflWhat} onChange={(e: any) => setReflWhat(e.target.value)} rows={2} onBlur={() => save({ reflectionWhat: reflWhat })} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">O que travou?</p>
              <Textarea value={reflBlock} onChange={(e: any) => setReflBlock(e.target.value)} rows={2} onBlur={() => save({ reflectionBlock: reflBlock })} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Próximo passo</p>
              <Textarea value={reflNext} onChange={(e: any) => setReflNext(e.target.value)} rows={2} onBlur={() => save({ reflectionNext: reflNext })} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
