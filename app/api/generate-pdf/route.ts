export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { html_content } = await request.json();

    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        html_content,
        pdf_options: { format: 'A4', margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }, print_background: true },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({ error: 'Falha ao criar PDF.' }));
      return NextResponse.json({ success: false, error: error?.error }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ success: false, error: 'Sem request ID.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, request_id });
  } catch (error: any) {
    console.error('PDF create error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar PDF.' }, { status: 500 });
  }
}
