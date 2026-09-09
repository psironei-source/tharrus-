export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: listar clientes vinculados ao profissional
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const links = await prisma.clientLink.findMany({
    where: { professionalId: session.user.id, status: { not: 'revoked' } },
    include: {
      client: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Para cada cliente, buscar a última avaliação
  const clientsWithData = await Promise.all(
    links.map(async (link: any) => {
      const lastAssessment = await prisma.assessment.findFirst({
        where: { userId: link.clientId },
        orderBy: { completedAt: 'desc' },
        include: { scores: true },
      });
      const programCount = await prisma.program.count({
        where: { clientId: link.clientId, professionalId: session.user.id },
      });
      return {
        linkId: link.id,
        linkStatus: link.status,
        consentGiven: link.consentGiven,
        notes: link.notes,
        client: link.client,
        lastAssessment: lastAssessment
          ? {
              id: lastAssessment.id,
              completedAt: lastAssessment.completedAt,
              scores: lastAssessment.scores,
            }
          : null,
        programCount,
      };
    })
  );

  return NextResponse.json(clientsWithData);
}

// POST: convidar/vincular um cliente
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { email, name, notes } = body ?? {};

  if (!email) {
    return NextResponse.json({ error: 'Email do cliente é obrigatório.' }, { status: 400 });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Encontrar ou criar usuário-cliente
  let clientUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!clientUser) {
    // Criar conta sem senha (cliente pode definir depois)
    clientUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name ? String(name).trim() : null,
        role: 'client_of_professional',
      },
    });
  }

  if (clientUser.id === session.user.id) {
    return NextResponse.json({ error: 'Você não pode se vincular a si mesmo.' }, { status: 400 });
  }

  // Verificar se já existe vínculo
  const existing = await prisma.clientLink.findUnique({
    where: {
      professionalId_clientId: {
        professionalId: session.user.id,
        clientId: clientUser.id,
      },
    },
  });

  if (existing && existing.status !== 'revoked') {
    return NextResponse.json({ error: 'Este cliente já está vinculado.' }, { status: 409 });
  }

  // O vínculo nasce PENDENTE. Só o próprio cliente pode dar o consentimento
  // explícito que libera o acesso do profissional aos seus dados.
  const link = existing
    ? await prisma.clientLink.update({
        where: { id: existing.id },
        data: {
          status: 'pending',
          consentGiven: false,
          consentDate: null,
          notes: notes || null,
        },
      })
    : await prisma.clientLink.create({
        data: {
          professionalId: session.user.id,
          clientId: clientUser.id,
          status: 'pending',
          consentGiven: false,
          notes: notes || null,
        },
      });

  return NextResponse.json(
    {
      linkId: link.id,
      clientId: clientUser.id,
      status: link.status,
      message:
        'Convite enviado. O acesso só será liberado depois que o cliente aceitar o consentimento na conta dele.',
    },
    { status: 201 }
  );
}
