export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;

  const program = await prisma.program.findFirst({
    where: { id, professionalId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      sessions: { orderBy: { sessionNumber: 'asc' }, include: { client: { select: { name: true } } } },
    },
  });

  if (!program) {
    return NextResponse.json({ error: 'Programa não encontrado.' }, { status: 404 });
  }

  return NextResponse.json(program);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const program = await prisma.program.findFirst({
    where: { id, professionalId: session.user.id },
  });
  if (!program) {
    return NextResponse.json({ error: 'Programa não encontrado.' }, { status: 404 });
  }

  const updated = await prisma.program.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.promise !== undefined && { promise: body.promise }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.durationWeeks !== undefined && { durationWeeks: body.durationWeeks }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.milestones !== undefined && { milestones: JSON.stringify(body.milestones) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;

  await prisma.program.deleteMany({
    where: { id, professionalId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
