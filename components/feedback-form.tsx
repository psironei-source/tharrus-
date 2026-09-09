'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIPOS = [
  { value: 'problema', label: 'Problema / erro' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'duvida', label: 'Dúvida' },
  { value: 'privacidade', label: 'Meus dados' },
  { value: 'outro', label: 'Outro' },
];

export function FeedbackForm({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [tipo, setTipo] = useState('problema');
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (mensagem.trim().length < 5) {
      setError('Escreva um pouco mais para que a gente entenda o seu ponto.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, mensagem, email, pagina: pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(data?.message || 'Não conseguimos enviar agora. Tente novamente em instantes.');
      } else {
        setSent(true);
        setMensagem('');
      }
    } catch {
      setError('Não conseguimos enviar agora. Tente novamente em instantes.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="font-medium">Recebemos a sua mensagem.</p>
          <p className="text-sm text-muted-foreground mt-1">Obrigado por ajudar a melhorar a plataforma.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setSent(false)}>
            Enviar outra mensagem
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className={cn('space-y-4', compact ? 'p-4' : 'p-6')}>
        <div>
          <p className="text-sm font-medium mb-2">Sobre o que é?</p>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-all',
                  tipo === t.value ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/50'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Sua mensagem</p>
          <Textarea
            value={mensagem}
            onChange={(e: any) => setMensagem(e.target.value)}
            rows={compact ? 4 : 6}
            placeholder="Conte o que aconteceu, em que página, e o que você esperava que acontecesse."
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">E-mail para resposta (opcional)</p>
          <Input
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={submit} disabled={sending} className="gap-1.5 w-full sm:w-auto">
          <Send className="w-4 h-4" />
          {sending ? 'Enviando...' : 'Enviar'}
        </Button>
      </CardContent>
    </Card>
  );
}
