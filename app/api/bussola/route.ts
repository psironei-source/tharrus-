export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const items = await prisma.bussolaItem.findMany({
      where: { userId: session.user.id },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(items.map((item: any) => ({
      id: item.id,
      acao: item.acao ?? '',
      dataLimite: item.dataLimite,
      territorio: item.territorio,
      responsavel: item.responsavel,
      motivo: item.motivo,
      como: item.como,
      custo: item.custo,
      status: item.status ?? 'pendente',
      position: item.position ?? 0,
    })));
  } catch (error: any) {
    console.error('Bussola GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar itens.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const { acao, dataLimite, territorio, responsavel, motivo, como, custo, status } = body ?? {};

    if (!acao || String(acao).trim() === '') {
      return NextResponse.json({ error: 'Ação é obrigatória.' }, { status: 400 });
    }

    const count = await prisma.bussolaItem.count({ where: { userId: session.user.id } });

    const item = await prisma.bussolaItem.create({
      data: {
        userId: session.user.id,
        acao: String(acao).trim(),
        dataLimite: dataLimite ? String(dataLimite) : null,
        territorio: territorio ? String(territorio) : null,
        responsavel: responsavel ? String(responsavel) : null,
        motivo: motivo ? String(motivo) : null,
        como: como ? String(como) : null,
        custo: custo ? String(custo) : null,
        status: status ? String(status) : 'pendente',
        position: count,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Bussola POST error:', error);
    return NextResponse.json({ error: 'Erro ao criar item.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.bussolaItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    }

    const updated = await prisma.bussolaItem.update({
      where: { id },
      data: {
        acao: data.acao !== undefined ? String(data.acao) : undefined,
        dataLimite: data.dataLimite !== undefined ? (data.dataLimite ? String(data.dataLimite) : null) : undefined,
        territorio: data.territorio !== undefined ? (data.territorio ? String(data.territorio) : null) : undefined,
        responsavel: data.responsavel !== undefined ? (data.responsavel ? String(data.responsavel) : null) : undefined,
        motivo: data.motivo !== undefined ? (data.motivo ? String(data.motivo) : null) : undefined,
        como: data.como !== undefined ? (data.como ? String(data.como) : null) : undefined,
        custo: data.custo !== undefined ? (data.custo ? String(data.custo) : null) : undefined,
        status: data.status !== undefined ? String(data.status) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Bussola PUT error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.bussolaItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    }

    await prisma.bussolaItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Bussola DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao excluir item.' }, { status: 500 });
  }
}
