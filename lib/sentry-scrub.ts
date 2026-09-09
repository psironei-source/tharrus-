/**
 * Filtro de privacidade para o monitoramento de erros.
 *
 * O app lida com respostas de questionário psicométrico e conteúdo de diário —
 * dados sensíveis sob a LGPD. Nada disso pode sair do servidor dentro de um
 * relatório de erro. Este filtro remove corpo de requisição, cabeçalhos,
 * cookies, query string e e-mail do usuário antes do envio, preservando apenas
 * o que é necessário para diagnosticar a falha (mensagem, rastreamento, id).
 */

type SentryEventLike = {
  request?: {
    data?: unknown;
    cookies?: unknown;
    headers?: Record<string, string> | unknown;
    query_string?: unknown;
    url?: string;
  };
  user?: { id?: string; email?: string; username?: string; ip_address?: string; [k: string]: unknown };
  breadcrumbs?: Array<{ data?: unknown; [k: string]: unknown }>;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  contexts?: Record<string, unknown>;
};

const SENSITIVE_KEYS = /(answer|respost|password|senha|token|secret|content|conteudo|conteúdo|diary|diario|diário|manifesto|note|nota|body)/i;

function stripUrlQuery(url?: string): string | undefined {
  if (!url) return url;
  const q = url.indexOf('?');
  return q === -1 ? url : url.slice(0, q);
}

function stripSensitiveKeys(obj: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!obj) return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = SENSITIVE_KEYS.test(k) ? '[removido]' : v;
  }
  return out;
}

export function scrubEvent<T>(event: T): T {
  const e = event as unknown as SentryEventLike;

  if (e.request) {
    delete e.request.data;
    delete e.request.cookies;
    delete e.request.query_string;
    e.request.url = stripUrlQuery(e.request.url);
    if (e.request.headers && typeof e.request.headers === 'object') {
      const h = e.request.headers as Record<string, string>;
      e.request.headers = {
        ...(h['user-agent'] ? { 'user-agent': h['user-agent'] } : {}),
      };
    }
  }

  if (e.user) {
    e.user = { id: e.user.id };
  }

  if (Array.isArray(e.breadcrumbs)) {
    e.breadcrumbs = e.breadcrumbs.map((b) => {
      if (b && typeof b.data === 'object' && b.data !== null) {
        return { ...b, data: stripSensitiveKeys(b.data as Record<string, unknown>) };
      }
      return b;
    });
  }

  e.extra = stripSensitiveKeys(e.extra);

  return event;
}

/** Configuração comum a servidor, edge e navegador. */
export const sharedSentryOptions = {
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  // Rastreamento de desempenho desligado: o plano gratuito prioriza a cota de
  // erros, e o tracing gera ids aleatórios durante a renderização no servidor,
  // o que conflita com o modo estrito do framework.
  tracesSampleRate: 0,
  sendDefaultPii: false,
  maxBreadcrumbs: 30,
  beforeSend: scrubEvent,
} as const;
