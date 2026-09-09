'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Trash2, GripVertical } from 'lucide-react';

export default function ProtocolosPage() {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', steps: [{ title: '', tool: '', description: '' }] });
  const [adding, setAdding] = useState(false);

  const load = () => {
    fetch('/api/pro/protocols').then(r => r.json()).then(setProtocols).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, { title: '', tool: '', description: '' }] }));
  const removeStep = (idx: number) => setForm(f => ({ ...f, steps: f.steps.filter((_: any, i: number) => i !== idx) }));
  const updateStep = (idx: number, field: string, value: string) => {
    setForm(f => {
      const steps = [...f.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...f, steps };
    });
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/pro/protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description, steps: form.steps }),
      });
      if (res.ok) { setShowAdd(false); setForm({ name: '', description: '', steps: [{ title: '', tool: '', description: '' }] }); load(); }
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/pro/protocols/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Biblioteca de Protocolos</h1>
          <p className="text-muted-foreground text-sm mt-1">Salve sequências de ferramentas reutilizáveis</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Protocolo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Criar Protocolo</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Protocolo Alta Autoimagem" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Etapas do Protocolo</Label>
                {form.steps.map((step: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Etapa {idx + 1}</span>
                      {form.steps.length > 1 && <button onClick={() => removeStep(idx)}><Trash2 className="w-3 h-3 text-destructive" /></button>}
                    </div>
                    <Input value={step.title} onChange={(e: any) => updateStep(idx, 'title', e.target.value)} placeholder="Título da etapa" />
                    <Input value={step.tool} onChange={(e: any) => updateStep(idx, 'tool', e.target.value)} placeholder="Ferramenta (ex: Diálogo Interior)" />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStep} className="w-full"><Plus className="w-3 h-3 mr-1" /> Adicionar Etapa</Button>
              </div>
              <Button onClick={handleAdd} disabled={adding || !form.name} className="w-full">{adding ? 'Salvando...' : 'Salvar Protocolo'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : protocols.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Nenhum protocolo salvo.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {protocols.map((p: any) => {
            const steps = (() => { try { return JSON.parse(p.stepsJson); } catch { return []; } })();
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.description && <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {steps.map((s: any, i: number) => (
                          <span key={i} className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-full">{i + 1}. {s.title || s.tool}</span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
