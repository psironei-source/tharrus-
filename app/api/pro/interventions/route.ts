export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NATIVE_INTERVENTIONS } from '@/lib/interventions-native';

// GET: listar intervenções (nativas + custom do profissional)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const travaKey = searchParams.get('travaKey');

  // Intervenções nativas
  let nativeFiltered = NATIVE_INTERVENTIONS;
  if (travaKey) nativeFiltered = nativeFiltered.filter(i => i.travaKey === travaKey);
  const nativeList = nativeFiltered.map(i => ({ ...i, id: `native_${i.toolKey}`, isNative: true, category: 'native' }));

  // Intervenções custom do profissional
  const where: any = { creatorId: session.user.id };
  if (travaKey) where.travaKey = travaKey;
  const custom = await prisma.intervention.findMany({ where, orderBy: { createdAt: 'desc' } });

  return NextResponse.json([...nativeList, ...custom]);
}

// POST: criar intervenção custom
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, travaKey, toolKey, instructions } = body;
  if (!name?.trim() || !travaKey) return NextResponse.json({ error: 'Nome e trava são obrigatórios.' }, { status: 400 });

  const intervention = await prisma.intervention.create({
    data: {
      creatorId: session.user.id,
      name: name.trim(),
      description: description || null,
      travaKey,
      toolKey: toolKey || null,
      instructions: instructions || null,
      isNative: false,
      category: 'custom',
    },
  });
  return NextResponse.json(intervention, { status: 201 });
}
