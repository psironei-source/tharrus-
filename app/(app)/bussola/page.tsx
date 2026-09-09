'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/animate';
import { Compass, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BussolaItem {
  id: string;
  acao: string;
  dataLimite: string | null;
  territorio: string | null;
  responsavel: string | null;
  motivo: string | null;
  como: string | null;
  custo: string | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: 'bg-gray-200 text-gray-700' },
  { value: 'em_andamento', label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-700' },
];

const EMPTY_ITEM: Omit<BussolaItem, 'id'> = {
  acao: '', dataLimite: null, territorio: null, responsavel: null,
  motivo: null, como: null, custo: null, status: 'pendente',
};

export default function BussolaPage() {
  const [items, setItems] = useState<BussolaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<Omit<BussolaItem, 'id'>>(EMPTY_ITEM);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/bussola');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    if (!newItem?.acao?.trim?.()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/bussola', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        toast.success('Ação adicionada!');
        setNewItem(EMPTY_ITEM);
        fetchItems();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (item: BussolaItem, field: string, value: string) => {
    try {
      await fetch('/api/bussola', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, [field]: value }),
      });
      setItems((prev: BussolaItem[]) => (prev ?? []).map((i: BussolaItem) => i.id === item.id ? { ...i, [field]: value } : i));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/bussola?id=${id}`, { method: 'DELETE' });
      setItems((prev: BussolaItem[]) => (prev ?? []).filter((i: BussolaItem) => i.id !== id));
      toast.success('Ação removida.');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Bússola de Ação</h1>
            <p className="text-muted-foreground text-sm">Organize seu plano de ação estratégico.</p>
          </div>
        </div>
      </FadeIn>

      {/* Add new */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Nova Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input placeholder="Ação *" value={newItem?.acao ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, acao: e.target.value }))} />
              <Input type="date" placeholder="Data limite" value={newItem?.dataLimite ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, dataLimite: e.target.value || null }))} />
              <Input placeholder="Território" value={newItem?.territorio ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, territorio: e.target.value || null }))} />
              <Input placeholder="Responsável" value={newItem?.responsavel ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, responsavel: e.target.value || null }))} />
              <Input placeholder="Motivo" value={newItem?.motivo ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, motivo: e.target.value || null }))} />
              <Input placeholder="Como" value={newItem?.como ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, como: e.target.value || null }))} />
              <Input placeholder="Custo" value={newItem?.custo ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem((p: any) => ({ ...p, custo: e.target.value || null }))} />
              <Button onClick={handleAdd} disabled={adding || !newItem?.acao?.trim?.()} className="gap-1.5">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Items table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (items ?? []).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Compass className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma ação criada ainda. Comece adicionando sua primeira ação acima.</p>
          </CardContent>
        </Card>
      ) : (
        <FadeIn delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Ação</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Data</th>
                  <th className="pb-2 font-medium hidden md:table-cell">Território</th>
                  <th className="pb-2 font-medium hidden md:table-cell">Responsável</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {(items ?? []).map((item: BussolaItem) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-2 max-w-[200px]">
                      <span className="truncate block">{item?.acao ?? ''}</span>
                    </td>
                    <td className="py-2 pr-2 hidden sm:table-cell text-muted-foreground">{item?.dataLimite ?? '—'}</td>
                    <td className="py-2 pr-2 hidden md:table-cell text-muted-foreground">{item?.territorio ?? '—'}</td>
                    <td className="py-2 pr-2 hidden md:table-cell text-muted-foreground">{item?.responsavel ?? '—'}</td>
                    <td className="py-2 pr-2">
                      <select
                        value={item?.status ?? 'pendente'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdate(item, 'status', e.target.value)}
                        className="text-xs border rounded-md px-2 py-1 bg-background"
                      >
                        {STATUS_OPTIONS.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <button onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive/80 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
