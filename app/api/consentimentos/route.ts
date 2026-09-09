export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: o cliente lista os profissionais que pediram (ou têm) acesso aos seus dados
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const links = await prisma.clientLink.findMany({
    where: { clientId: session.user.id },
    include: {
      professional: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    links.map((l: any) => ({
      id: l.id,
      status: l.status,
      consentGiven: l.consentGiven,
      consentDate: l.consentDate,
      createdAt: l.createdAt,
      professional: l.professional,
    }))
  );
}

// PUT: o cliente concede ou revoga o consentimento
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { linkId, action } = body ?? {};

  if (!linkId || !['grant', 'revoke'].includes(action)) {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  // Só o próprio cliente do vínculo pode alterá-lo
  const link = await prisma.clientLink.findFirst({
    where: { id: String(linkId), clientId: session.user.id },
  });

  if (!link) {
    return NextResponse.json({ error: 'Vínculo não encontrado.' }, { status: 404 });
  }

  const updated = await prisma.clientLink.update({
    where: { id: link.id },
    data:
      action === 'grant'
        ? { status: 'active', consentGiven: true, consentDate: new Date() }
        : { status: 'revoked', consentGiven: false, consentDate: null },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    consentGiven: updated.consentGiven,
    consentDate: updated.consentDate,
  });
}
