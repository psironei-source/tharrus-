import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Termos de Uso | Tharrus',
  description: 'Termos de uso da plataforma Tharrus.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold">
            <Brain className="w-5 h-5 text-primary" /> Tharrus
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mt-2">Versão 1.0 — vigente desde o lançamento do MVP.</p>

        <div className="prose prose-sm max-w-none mt-8 space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold">1. O que é esta plataforma</h2>
            <p className="text-muted-foreground mt-2">
              Tharrus é uma ferramenta digital de <strong>autoconhecimento e mentoring</strong>. Ela
              organiza as suas respostas a um questionário estruturado e devolve uma leitura de padrões de
              comportamento (as “travas”), com sugestões práticas de ação.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">2. O que esta plataforma não é</h2>
            <p className="text-muted-foreground mt-2">
              A plataforma <strong>não é um instrumento diagnóstico</strong> e não realiza avaliação psicológica,
              psiquiátrica ou médica. Os resultados não são laudo, não têm valor clínico ou pericial e não
              substituem acompanhamento profissional. Se você está em sofrimento intenso, em crise ou com
              pensamentos de se machucar, procure ajuda profissional imediatamente. No Brasil, o CVV atende
              gratuitamente pelo telefone 188, 24 horas por dia.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">3. Sua conta</h2>
            <p className="text-muted-foreground mt-2">
              Você precisa ter 18 anos ou mais para criar uma conta. Você é responsável por manter a sua senha em
              sigilo e pela veracidade das informações que fornece. Contas podem ser encerradas por você a qualquer
              momento, mediante solicitação pelo canal de contato.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">4. Uso adequado</h2>
            <p className="text-muted-foreground mt-2">
              É vedado usar a plataforma para fins ilegais, tentar acessar dados de outras pessoas, aplicar
              engenharia reversa, automatizar acessos em massa ou revender os conteúdos gerados como se fossem
              avaliação técnica de terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">5. Profissionais e acesso a dados de clientes</h2>
            <p className="text-muted-foreground mt-2">
              Profissionais cadastrados podem convidar clientes. O acesso do profissional aos dados do cliente só
              é liberado após <strong>consentimento explícito do próprio cliente</strong>, dado dentro da conta dele.
              O cliente pode revogar esse acesso a qualquer momento, com efeito imediato. O profissional é o único
              responsável pela conduta técnica e ética do seu atendimento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">6. Conteúdo gerado</h2>
            <p className="text-muted-foreground mt-2">
              Parte do relatório é redigida com apoio de inteligência artificial a partir das suas pontuações. O
              texto pode conter impreciões de linguagem e deve ser lido como hipótese de trabalho, nunca como
              afirmação sobre a sua saúde.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">7. Limitação de responsabilidade</h2>
            <p className="text-muted-foreground mt-2">
              A plataforma é oferecida “no estado em que se encontra”. Não garantimos disponibilidade
              ininterrupta nem que os conteúdos produzam qualquer resultado específico. As decisões tomadas a
              partir do relatório são de sua responsabilidade.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">8. Alterações</h2>
            <p className="text-muted-foreground mt-2">
              Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas dentro do produto. O uso
              continuado após a atualização significa concordância com a nova versão.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">9. Contato</h2>
            <p className="text-muted-foreground mt-2">
              Dúvidas sobre estes termos podem ser enviadas pelo{' '}
              <Link href="/feedback" className="text-primary underline underline-offset-2">
                canal de contato e feedback
              </Link>{' '}
              da plataforma.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t text-sm">
          <Link href="/privacidade" className="text-primary underline underline-offset-2">
            Ler a Política de Privacidade
          </Link>
        </div>
      </main>
    </div>
  );
}
