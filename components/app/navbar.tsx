'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Brain, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const END_USER_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/questionario', label: 'Questionário' },
  { href: '/modulos', label: 'Módulos' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/diario', label: 'Diário' },
  { href: '/evolucao', label: 'Evolução' },
  { href: '/consentimentos', label: 'Consentimentos' },
];

const PRO_LINKS = [
  { href: '/pro', label: 'Painel' },
  { href: '/pro/clientes', label: 'Clientes' },
  { href: '/pro/sessoes', label: 'Sessões' },
  { href: '/pro/metas', label: 'Metas' },
  { href: '/pro/intervencoes', label: 'Intervenções' },
  { href: '/pro/programas', label: 'Programas' },
  { href: '/pro/autoridade', label: 'Autoridade' },
  { href: '/pro/analytics', label: 'Analytics' },
  { href: '/pro/resultados', label: 'Resultados' },
];

export function AppNavbar({ userName, role }: { userName: string; role: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isPro = role === 'professional';
  const links = isPro ? PRO_LINKS : END_USER_LINKS;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={isPro ? '/pro' : '/dashboard'} className="flex items-center gap-2 font-display font-bold text-lg">
          <Brain className="w-6 h-6 text-primary" />
          <span>Tharrus</span>
          {isPro && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">PRO</span>}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === l.href || pathname.startsWith(l.href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{userName}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium',
                pathname === l.href || pathname.startsWith(l.href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t pt-2 mt-2">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
