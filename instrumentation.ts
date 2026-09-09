import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Captura erros de rotas de API, componentes de servidor e proxy.
 * O filtro de privacidade (lib/sentry-scrub.ts) roda antes do envio e remove
 * corpo da requisição, cookies, cabeçalhos e query string.
 */
export const onRequestError: Instrumentation.onRequestError = Sentry.captureRequestError;
