'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, ShieldX, UserCheck } from 'lucide-react';

type ConsentLink = {
  id: string;
  status: string;
  consentGiven: boolean;
  consentDate: string | null;
  createdAt: string;
  professional: { id: string; name: string | null; email: string };
};

const STATUS_META: Record<string, { label: string; className: string; icon: any }> = {
  pending: {
    label: 'Aguardando sua autorização',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ShieldAlert,
  },
  active: {
    label: 'Acesso autorizado',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
  },
  revoked: {
    label: 'Acesso revogado',
    className: 'bg-muted text-muted-foreground border-border',
    icon: ShieldX,
  },
};

export default function ConsentimentosPage() {
  const [links, setLinks] = useState<ConsentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () =>
    fetch('/api/consentimentos')
      .then((r) => r.json())
      .then((d) => setLinks(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const act = async (linkId: string, action: 'grant' | 'revoke') => {
    setBusy(linkId);
    await fetch('/api/consentimentos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, action }),
    });
    await load();
    setBusy(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Consentimentos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Você decide quais profissionais podem ver o seu relatório e a sua evolução. Pode revogar o acesso a qualquer
          momento — o efeito é imediato.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum profissional solicitou acesso aos seus dados.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Quando um profissional convidar você, o pedido aparecerá aqui para a sua autorização.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((l) => {
            const meta = STATUS_META[l.status] ?? STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <Card key={l.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{l.professional.name || l.professional.email}</p>
                    <p className="text-xs text-muted-foreground truncate" suppressHydrationWarning>
                      {l.professional.email}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 mt-2 text-xs px-2 py-0.5 rounded-full border ${meta.className}`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {meta.label}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {l.status !== 'active' && (
                      <Button size="sm" disabled={busy === l.id} onClick={() => act(l.id, 'grant')}>
                        {busy === l.id ? 'Salvando...' : 'Autorizar acesso'}
                      </Button>
                    )}
                    {l.status === 'active' && (
                      <Button size="sm" variant="outline" disabled={busy === l.id} onClick={() => act(l.id, 'revoke')}>
                        {busy === l.id ? 'Salvando...' : 'Revogar acesso'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">O que o profissional vê ao ser autorizado:</strong> o seu relatório de
          travas, o histórico de avaliações e os programas que ele mesmo criou para você. Ele nunca vê o seu diário
          pessoal nem a sua senha. Ao revogar, o acesso é cortado na mesma hora.
        </CardContent>
      </Card>
    </div>
  );
}
