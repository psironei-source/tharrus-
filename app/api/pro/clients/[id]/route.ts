export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: detalhe de um cliente
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;

  // Verificar vínculo
  const link = await prisma.clientLink.findFirst({
    where: { professionalId: session.user.id, clientId: id, status: 'active' },
  });
  if (!link) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  }

  const client = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const assessments = await prisma.assessment.findMany({
    where: { userId: id },
    orderBy: { completedAt: 'desc' },
    include: { scores: true },
  });

  const programs = await prisma.program.findMany({
    where: { clientId: id, professionalId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { sessions: { orderBy: { sessionNumber: 'asc' } } },
  });

  const sdrResults = await prisma.sDRResult.findMany({
    where: { userId: id },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });

  return NextResponse.json({ client, assessments, programs, sdrResults, link });
}

// DELETE: revogar vínculo
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;

  await prisma.clientLink.updateMany({
    where: { professionalId: session.user.id, clientId: id },
    data: { status: 'revoked' },
  });

  return NextResponse.json({ success: true });
}
