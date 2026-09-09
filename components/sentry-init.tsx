'use client';

import { useEffect } from 'react';

/**
 * Inicializa o monitoramento de erros no navegador.
 *
 * O carregamento é dinâmico e só acontece depois da hidratação, para não pesar
 * no primeiro carregamento da página nem interferir na renderização no servidor.
 * Sem o endereço de monitoramento configurado, nada é carregado.
 */
export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    let cancelled = false;
    Promise.all([import('@sentry/nextjs'), import('@/lib/sentry-scrub')])
      .then(([Sentry, { sharedSentryOptions }]) => {
        if (cancelled || Sentry.getClient()) return;
        Sentry.init({
          dsn,
          ...sharedSentryOptions,
          replaysSessionSampleRate: 0,
          replaysOnErrorSampleRate: 0,
        });
      })
      .catch(() => {
        /* monitoramento é acessório: nunca deve quebrar a página */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
