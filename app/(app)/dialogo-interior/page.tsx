'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, MessageCircle, Edit2, Save, X } from 'lucide-react';

interface DialogoEntry {
  id?: string;
  palavra: string;
  significado: string;
  sentimento: string;
  comportamento: string;
  resultado: string;
}

const EMPTY_ENTRY: DialogoEntry = { palavra: '', significado: '', sentimento: '', comportamento: '', resultado: '' };

export default function DialogoInteriorPage() {
  const [entries, setEntries] = useState<DialogoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<DialogoEntry>(EMPTY_ENTRY);
  const [showAdd, setShowAdd] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/dialogo-interior');
      const data = await res.json();
      setEntries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!form.palavra.trim()) return;
    setSaving(true);
    try {
      const isEdit = editing !== null && entries[editing]?.id;
      const res = await fetch('/api/dialogo-interior', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...form, id: entries[editing!].id } : form),
      });
      if (res.ok) {
        await fetchEntries();
        setForm(EMPTY_ENTRY);
        setEditing(null);
        setShowAdd(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/dialogo-interior', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchEntries();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (idx: number) => {
    setEditing(idx);
    setForm(entries[idx]);
    setShowAdd(true);
  };

  const FIELDS = [
    { key: 'palavra' as const, label: 'Palavra / Frase interna', placeholder: 'Ex: "Eu não consigo"' },
    { key: 'significado' as const, label: 'O que significa para mim', placeholder: 'Ex: Que sou incapaz' },
    { key: 'sentimento' as const, label: 'Sentimento gerado', placeholder: 'Ex: Frustração, impotência' },
    { key: 'comportamento' as const, label: 'Comportamento resultante', placeholder: 'Ex: Procrastinar, desistir' },
    { key: 'resultado' as const, label: 'Resultado na minha vida', placeholder: 'Ex: Projetos incompletos' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Diálogo Interior</h1>
          <p className="text-muted-foreground mt-1">Mapeie a cadeia: Palavra → Significado → Sentimento → Comportamento → Resultado.</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setEditing(null); setForm(EMPTY_ENTRY); }} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Nova entrada
        </Button>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Como usar este módulo</p>
              <p>Identifique uma frase ou pensamento recorrente do seu diálogo interno. Depois, preencha cada coluna para enxergar a cadeia completa — da palavra ao resultado concreto na sua vida.</p>
              <p>Ao tornar visível esse mecanismo, você ganha poder de escolha sobre ele.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAdd && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{editing !== null ? 'Editar entrada' : 'Nova entrada'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium mb-1 block">{f.label}</label>
                <Input
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.palavra.trim()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                {editing !== null ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setEditing(null); setForm(EMPTY_ENTRY); }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && !showAdd ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum registro ainda. Clique em "Nova entrada" para começar a mapear seu diálogo interior.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-muted/50">
                {FIELDS.map(f => <th key={f.key} className="text-left p-3 font-medium">{f.label}</th>)}
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id || i} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{e.palavra}</td>
                  <td className="p-3">{e.significado}</td>
                  <td className="p-3">{e.sentimento}</td>
                  <td className="p-3">{e.comportamento}</td>
                  <td className="p-3">{e.resultado}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(i)} className="p-1 hover:text-primary" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      {e.id && <button onClick={() => handleDelete(e.id!)} className="p-1 hover:text-destructive" title="Excluir"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
