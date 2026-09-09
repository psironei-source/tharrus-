export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const protocols = await prisma.protocolTemplate.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(protocols);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, steps, targetProfile } = body ?? {};

  if (!name || !steps) {
    return NextResponse.json({ error: 'Nome e etapas são obrigatórios.' }, { status: 400 });
  }

  const protocol = await prisma.protocolTemplate.create({
    data: {
      professionalId: session.user.id,
      name,
      description: description || null,
      stepsJson: JSON.stringify(steps),
      targetProfile: targetProfile ? JSON.stringify(targetProfile) : null,
    },
  });

  return NextResponse.json(protocol, { status: 201 });
}
