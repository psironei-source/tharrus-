import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';
import { FeedbackForm } from '@/components/feedback-form';

export const metadata = {
  title: 'Fale com a gente | Tharrus',
  description: 'Canal de contato, sugestões e relato de problemas.',
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold">
            <Brain className="w-5 h-5 text-primary" /> Tharrus
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Fale com a gente</h1>
        <p className="text-muted-foreground mt-2">
          Encontrou um erro, quer sugerir algo ou precisa falar sobre os seus dados? Escreva aqui — lemos tudo.
        </p>

        <div className="mt-8">
          <FeedbackForm />
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Se você está em sofrimento intenso ou em crise, este não é um canal de emergência. No Brasil, o CVV atende
          gratuitamente pelo telefone 188, 24 horas por dia.
        </p>
      </main>
    </div>
  );
}
