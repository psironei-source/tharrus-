export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const protocol = await prisma.protocolTemplate.findFirst({
    where: { id, professionalId: session.user.id },
  });
  if (!protocol) {
    return NextResponse.json({ error: 'Protocolo não encontrado.' }, { status: 404 });
  }

  const updated = await prisma.protocolTemplate.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.steps !== undefined && { stepsJson: JSON.stringify(body.steps) }),
      ...(body.targetProfile !== undefined && { targetProfile: JSON.stringify(body.targetProfile) }),
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

  await prisma.protocolTemplate.deleteMany({
    where: { id, professionalId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
