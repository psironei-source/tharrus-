'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProgramasPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ clientId: '', name: '', description: '', promise: '', durationWeeks: '8' });
  const [adding, setAdding] = useState(false);

  const load = () => {
    Promise.all([
      fetch('/api/pro/programs').then(r => r.json()),
      fetch('/api/pro/clients').then(r => r.json()),
    ]).then(([p, c]) => { setPrograms(p); setClients(c); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/pro/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, durationWeeks: parseInt(form.durationWeeks) || 8 }),
      });
      if (res.ok) { setShowAdd(false); setForm({ clientId: '', name: '', description: '', promise: '', durationWeeks: '8' }); load(); }
    } finally { setAdding(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Programas</h1>
          <p className="text-muted-foreground text-sm mt-1">Crie processos transformacionais para seus clientes</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Programa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Criar Programa</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={(v: string) => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => <SelectItem key={c.client.id} value={c.client.id}>{c.client.name || c.client.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Programa</Label>
                <Input value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Clareza de Carreira" />
              </div>
              <div className="space-y-2">
                <Label>Promessa de Transformação</Label>
                <Textarea value={form.promise} onChange={(e: any) => setForm(f => ({ ...f, promise: e.target.value }))} placeholder="O que o cliente pode esperar ao final?" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Duração (semanas)</Label>
                <Input type="number" value={form.durationWeeks} onChange={(e: any) => setForm(f => ({ ...f, durationWeeks: e.target.value }))} />
              </div>
              <Button onClick={handleAdd} disabled={adding || !form.clientId || !form.name} className="w-full">{adding ? 'Criando...' : 'Criar Programa'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : programs.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Award className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Nenhum programa criado.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {programs.map((p: any) => {
            const completedCount = p.sessions?.filter((s: any) => s.status === 'completed').length ?? 0;
            const totalSessions = p.sessions?.length ?? 0;
            return (
              <Card key={p.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{p.name}</p>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : p.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600')}>{p.status === 'active' ? 'Ativo' : p.status === 'completed' ? 'Concluído' : 'Pausado'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.client?.name || p.client?.email} • {p.durationWeeks} semanas • {completedCount}/{totalSessions} sessões</p>
                      {p.promise && <p className="text-xs text-primary mt-1">{p.promise}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
