export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const programs = await prisma.program.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, email: true } },
      sessions: { select: { id: true, status: true, sessionNumber: true } },
    },
  });

  return NextResponse.json(programs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, name, description, promise, durationWeeks, milestones } = body ?? {};

  if (!clientId || !name) {
    return NextResponse.json({ error: 'clientId e nome são obrigatórios.' }, { status: 400 });
  }

  // Verificar vínculo
  const link = await prisma.clientLink.findFirst({
    where: { professionalId: session.user.id, clientId, status: 'active' },
  });
  if (!link) {
    return NextResponse.json({ error: 'Cliente não vinculado.' }, { status: 403 });
  }

  const program = await prisma.program.create({
    data: {
      professionalId: session.user.id,
      clientId,
      name,
      description: description || null,
      promise: promise || null,
      durationWeeks: durationWeeks || 8,
      milestones: milestones ? JSON.stringify(milestones) : null,
    },
  });

  return NextResponse.json(program, { status: 201 });
}
