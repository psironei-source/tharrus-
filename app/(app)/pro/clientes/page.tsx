'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { TRAVA_META } from '@/lib/questions';
import { cn } from '@/lib/utils';

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadClients = () => {
    fetch('/api/pro/clients').then(r => r.json()).then(setClients).finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const handleAdd = async () => {
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/pro/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, name: newName }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d?.error ?? 'Erro ao vincular.');
        return;
      }
      setShowAdd(false);
      setNewEmail('');
      setNewName('');
      loadClients();
    } catch {
      setError('Erro de conexão.');
    } finally {
      setAdding(false);
    }
  };

  const filtered = clients.filter((c: any) => {
    const q = search.toLowerCase();
    return !q || c.client?.name?.toLowerCase().includes(q) || c.client?.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua carteira de clientes</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Vincular Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label>Nome do cliente</Label>
                <Input value={newName} onChange={(e: any) => setNewName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Email do cliente</Label>
                <Input value={newEmail} onChange={(e: any) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" type="email" />
              </div>
              <p className="text-xs text-muted-foreground">
                O cliente será convidado a acessar a plataforma. O acesso aos dados dele só é liberado depois que ele
                autorizar expressamente, na página de Consentimentos da conta dele.
              </p>
              <Button onClick={handleAdd} disabled={adding || !newEmail} className="w-full">
                {adding ? 'Vinculando...' : 'Vincular'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Buscar por nome ou email..." className="pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Nenhum cliente vinculado ainda.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c: any) => {
            const topTrava = c.lastAssessment?.scores?.sort((a: any, b: any) => b.normalized - a.normalized)?.[0];
            const meta = topTrava ? (TRAVA_META as any)[topTrava.travaKey] : null;
            return (
              <Link key={c.linkId} href={`/pro/clientes/${c.client.id}`}>
                <Card className="hover:border-primary/20 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.client.name || c.client.email}</p>
                      <p className="text-xs text-muted-foreground">{c.client.email}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {c.linkStatus !== 'active' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Aguardando consentimento do cliente
                          </span>
                        )}
                        {topTrava && c.linkStatus === 'active' && (
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', topTrava.band === 'alta' ? 'bg-red-100 text-red-700' : topTrava.band === 'moderada' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                            Foco: {meta?.shortName ?? topTrava.travaKey} ({topTrava.normalized}%)
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{c.programCount} programa(s)</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
