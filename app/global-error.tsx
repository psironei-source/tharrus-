'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    import('@sentry/nextjs')
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {
        /* monitoramento é acessório */
      });
  }, [error]);

  return (
    <html lang="pt-BR" translate="no">
      <body className="font-sans">
        <main className="min-h-screen flex items-center justify-center bg-[#f8fafb] px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdfa] text-2xl">
              ⚠️
            </div>
            <h1 className="mb-2 text-xl font-semibold text-[#1a1a2e]">
              Algo deu errado por aqui
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-[#666]">
              Tivemos um problema inesperado ao carregar esta página. Nossa equipe já foi
              avisada automaticamente. Você pode tentar de novo — seus dados estão salvos.
            </p>
            {error?.digest ? (
              <p className="mb-6 font-mono text-[11px] text-[#aaa]">
                Código do erro: {error.digest}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-lg bg-[#3b9b8f] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Tentar novamente
              </button>
              <a
                href="/dashboard"
                className="rounded-lg border border-[#e5e7eb] px-5 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f8fafb]"
              >
                Voltar ao início
              </a>
            </div>
            <p className="mt-6 text-xs text-[#999]">
              Se o problema continuar,{' '}
              <a href="/feedback" className="text-[#3b9b8f] underline underline-offset-2">
                nos avise por aqui
              </a>
              .
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
