export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { request_id } = await request.json();
    const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({ request_id }),
    });

    const statusResult = await statusResponse.json();
    const status = statusResult?.status ?? 'FAILED';
    const result = statusResult?.result ?? null;

    if (status === 'SUCCESS') {
      if (result?.result) {
        return NextResponse.json({ status, pdf_base64: result.result });
      }
      return NextResponse.json({ status: 'FAILED', error: 'PDF sem dados.' });
    }
    if (status === 'FAILED') {
      return NextResponse.json({ status, error: result?.error ?? 'Falha na geração.' });
    }
    return NextResponse.json({ status });
  } catch (error: any) {
    console.error('PDF status error:', error);
    return NextResponse.json({ status: 'FAILED', error: 'Erro ao verificar status.' }, { status: 500 });
  }
}
