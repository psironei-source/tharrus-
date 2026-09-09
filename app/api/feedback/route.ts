export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const TIPOS: Record<string, string> = {
  problema: 'Problema / erro',
  sugestao: 'Sugestão de melhoria',
  duvida: 'Dúvida',
  privacidade: 'Privacidade / meus dados',
  outro: 'Outro',
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const tipo = TIPOS[String(body?.tipo ?? '')] ? String(body.tipo) : 'outro';
    const mensagem = String(body?.mensagem ?? '').trim();
    const contatoInformado = String(body?.email ?? '').trim();

    if (mensagem.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Escreva um pouco mais para que a gente entenda o seu ponto.' },
        { status: 400 }
      );
    }
    if (mensagem.length > 5000) {
      return NextResponse.json(
        { success: false, message: 'Mensagem muito longa (limite de 5000 caracteres).' },
        { status: 400 }
      );
    }

    const contato = contatoInformado || session?.user?.email || 'não informado';
    const autor = session?.user?.name || 'Visitante';
    const pagina = String(body?.pagina ?? '').slice(0, 200);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#1f2937;border-bottom:2px solid #3b9b8f;padding-bottom:10px;">
          Novo feedback — Tharrus
        </h2>
        <div style="background:#f6faf9;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:8px 0;"><strong>Tipo:</strong> ${escapeHtml(TIPOS[tipo])}</p>
          <p style="margin:8px 0;"><strong>Enviado por:</strong> ${escapeHtml(autor)}</p>
          <p style="margin:8px 0;"><strong>Contato:</strong> ${escapeHtml(contato)}</p>
          ${pagina ? `<p style="margin:8px 0;"><strong>Página:</strong> ${escapeHtml(pagina)}</p>` : ''}
          <p style="margin:14px 0 8px;"><strong>Mensagem:</strong></p>
          <div style="background:#fff;padding:15px;border-radius:4px;border-left:4px solid #3b9b8f;white-space:pre-wrap;">${escapeHtml(
            mensagem
          )}</div>
        </div>
      </div>
    `;

    const appUrl = process.env.NEXTAUTH_URL || '';
    const hostname = appUrl ? new URL(appUrl).hostname : 'mail.abacusai.app';

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_FEEDBACK_DO_USURIO,
        subject: `[Feedback] ${TIPOS[tipo]} — ${autor}`,
        body: htmlBody,
        is_html: true,
        recipient_email: 'psi.ronei@gmail.com',
        reply_to: contato.includes('@') ? contato : undefined,
        sender_email: `noreply@${hostname}`,
        sender_alias: 'Tharrus',
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!result?.success && !result?.notification_disabled) {
      return NextResponse.json(
        { success: false, message: 'Não conseguimos enviar agora. Tente novamente em instantes.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Não conseguimos enviar agora. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}
