import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Brain, ArrowRight, Shield, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            <span className="font-display text-xl font-bold tracking-tight">Tharrus</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Brain className="w-4 h-4" />
          Ferramenta de Autoconhecimento
        </div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Descubra as <span className="text-primary">travas</span> que limitam seu potencial
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Mapeie suas 8 travas neuropsicológicas com base em Neuromentoring e receba um relatório personalizado para iniciar sua transformação.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Fazer o diagnóstico grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Questionário estratégico',
              desc: 'Responda perguntas cuidadosamente elaboradas que mapeiam 8 dimensões do seu funcionamento interno.',
            },
            {
              icon: Target,
              title: 'Relatório personalizado',
              desc: 'Receba gráficos, interpretações e exercícios específicos para as suas travas mais ativas.',
            },
            {
              icon: Shield,
              title: 'Privacidade garantida',
              desc: 'Seus dados são tratados com segurança. Esta é uma ferramenta de mentoring, não diagnóstico clínico.',
            },
          ].map((item: { icon: any; title: string; desc: string }, i: number) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            ⚠️ Tharrus é uma ferramenta de autoconhecimento e mentoring. Não substitui acompanhamento psicológico, psiquiátrico ou qualquer tratamento de saúde mental. Se você está em sofrimento, procure um profissional qualificado.
          </p>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/termos" className="underline underline-offset-2 hover:text-foreground">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-foreground">
              Política de Privacidade
            </Link>
            <Link href="/feedback" className="underline underline-offset-2 hover:text-foreground">
              Fale com a gente
            </Link>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2026 Tharrus. Seus dados são tratados com segurança (LGPD).
          </p>
        </div>
      </footer>
    </div>
  );
}
