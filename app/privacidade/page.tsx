import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidade | Tharrus',
  description: 'Como a plataforma Tharrus trata os seus dados pessoais.',
};

export default function PrivacidadePage() {
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
        <h1 className="font-display text-3xl font-bold tracking-tight">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Versão 1.0 — elaborada de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold">1. Quais dados coletamos</h2>
            <ul className="text-muted-foreground mt-2 list-disc pl-5 space-y-1">
              <li>
                <strong>Dados de conta:</strong> nome, e-mail e senha (armazenada apenas como hash bcrypt — nunca
                em texto legível).
              </li>
              <li>
                <strong>Respostas do questionário:</strong> as notas de 1 a 5 que você atribui a cada item, e as
                pontuações calculadas por trava.
              </li>
              <li>
                <strong>Conteúdo que você escreve:</strong> diário, metas, exercícios dos módulos e plano de ação.
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Não pedimos e não queremos receber dados sobre uso de substâncias, quantidades ou frequência de uso.
              O questionário trabalha apenas em nível de padrão de comportamento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">2. Para que usamos</h2>
            <p className="text-muted-foreground mt-2">
              Exclusivamente para operar a plataforma: autenticar você, calcular as pontuações, gerar o relatório e
              o PDF, e mostrar a sua evolução ao longo do tempo. <strong>Não vendemos os seus dados</strong> e não
              os usamos para publicidade.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">3. Com quem compartilhamos</h2>
            <ul className="text-muted-foreground mt-2 list-disc pl-5 space-y-1">
              <li>
                <strong>Profissionais:</strong> apenas aqueles a quem você autorizou expressamente, na página de
                Consentimentos. Você pode revogar a qualquer momento, com efeito imediato.
              </li>
              <li>
                <strong>Provedor de infraestrutura e de inteligência artificial:</strong> os textos do relatório são
                redigidos por um modelo de linguagem a partir das suas pontuações. Esse processamento é feito para a
                geração do relatório e não alimenta treinamento de modelos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">4. Segurança</h2>
            <p className="text-muted-foreground mt-2">
              Todo o tráfego trafega por HTTPS/TLS. As senhas são armazenadas com hash bcrypt. O banco de dados fica
              em ambiente gerenciado, com acesso restrito por credencial e criptografia em repouso. As respostas do
              questionário e os identificadores de avaliação não são gravados em logs de aplicação.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">5. Por quanto tempo guardamos</h2>
            <p className="text-muted-foreground mt-2">
              Enquanto a sua conta existir, porque o histórico é o que permite comparar avaliações ao longo do
              tempo. Ao solicitar a exclusão da conta, os dados pessoais e as respostas são apagados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">6. Seus direitos (LGPD)</h2>
            <p className="text-muted-foreground mt-2">
              Você pode solicitar a qualquer momento: confirmação de tratamento, acesso aos seus dados, correção de
              dados incompletos ou incorretos, portabilidade, eliminação dos dados tratados com base no seu
              consentimento, informação sobre compartilhamentos e revogação do consentimento. Basta pedir pelo
              canal de contato.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">7. Cookies</h2>
            <p className="text-muted-foreground mt-2">
              Usamos apenas cookies estritamente necessários para manter a sua sessão autenticada. Não usamos
              cookies de rastreamento publicitário.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">8. Contato</h2>
            <p className="text-muted-foreground mt-2">
              Para exercer qualquer direito ou tirar dúvidas sobre esta política, use o{' '}
              <Link href="/feedback" className="text-primary underline underline-offset-2">
                canal de contato e feedback
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t text-sm">
          <Link href="/termos" className="text-primary underline underline-offset-2">
            Ler os Termos de Uso
          </Link>
        </div>
      </main>
    </div>
  );
}
