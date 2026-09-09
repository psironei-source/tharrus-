'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Plus, Clock, CheckCircle, PlayCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  scheduled: { label: 'Agendada', color: 'text-blue-600 bg-blue-50', icon: Clock },
  in_progress: { label: 'Em andamento', color: 'text-amber-600 bg-amber-50', icon: PlayCircle },
  completed: { label: 'Concluída', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
};

export default function SessoesPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ clientId: '', title: '', scheduledAt: '', toolUsed: '' });
  const [adding, setAdding] = useState(false);

  const load = () => {
    Promise.all([
      fetch('/api/pro/sessions').then(r => r.json()),
      fetch('/api/pro/clients').then(r => r.json()),
    ]).then(([s, c]) => { setSessions(s); setClients(c); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/pro/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowAdd(false); setForm({ clientId: '', title: '', scheduledAt: '', toolUsed: '' }); load(); }
    } finally { setAdding(false); }
  };

  const grouped = {
    scheduled: sessions.filter((s: any) => s.status === 'scheduled'),
    in_progress: sessions.filter((s: any) => s.status === 'in_progress'),
    completed: sessions.filter((s: any) => s.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Sessões</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie e acompanhe suas sessões</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Nova Sessão</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agendar Sessão</DialogTitle></DialogHeader>
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
                <Label>Título</Label>
                <Input value={form.title} onChange={(e: any) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Sessão 3 - Bússola" />
              </div>
              <div className="space-y-2">
                <Label>Data/hora</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e: any) => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Ferramenta sugerida</Label>
                <Input value={form.toolUsed} onChange={(e: any) => setForm(f => ({ ...f, toolUsed: e.target.value }))} placeholder="Ex: Diálogo Interior" />
              </div>
              <Button onClick={handleAdd} disabled={adding || !form.clientId} className="w-full">{adding ? 'Salvando...' : 'Agendar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Nenhuma sessão criada.</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {(['scheduled', 'in_progress', 'completed'] as const).map(status => {
            const items = grouped[status];
            if (items.length === 0) return null;
            const meta = STATUS_MAP[status];
            return (
              <div key={status}>
                <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <meta.icon className="w-4 h-4" /> {meta.label} ({items.length})
                </h2>
                <div className="space-y-2">
                  {items.map((s: any) => (
                    <Link key={s.id} href={`/pro/sessoes/${s.id}`}>
                      <Card className="hover:border-primary/20 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{s.title || `Sessão ${s.sessionNumber}`}</p>
                            <p className="text-xs text-muted-foreground">{s.client?.name || 'Cliente'} {s.program ? `• ${s.program.name}` : ''}</p>
                            {s.toolUsed && <p className="text-xs text-primary mt-0.5">Ferramenta: {s.toolUsed}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span suppressHydrationWarning className="text-xs text-muted-foreground">
                              {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
