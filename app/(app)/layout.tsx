import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppNavbar } from '@/components/app/navbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Profissionais devem usar /pro
  const role = session.user.role ?? 'end_user';

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar userName={session.user?.name ?? ''} role={role} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            ⚠️ Tharrus é uma ferramenta de autoconhecimento e mentoring. Não substitui acompanhamento psicológico ou psiquiátrico.
          </p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
            <Link href="/feedback" className="underline underline-offset-2 hover:text-foreground">
              Enviar feedback
            </Link>
            <Link href="/termos" className="underline underline-offset-2 hover:text-foreground">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-foreground">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
