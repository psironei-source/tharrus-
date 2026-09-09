export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role: rawRole } = body ?? {};
    const role = rawRole === 'professional' ? 'professional' : 'end_user';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Validação de formato de e-mail
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json({ error: 'Digite um email válido (ex.: nome@dominio.com).' }, { status: 400 });
    }

    // Força da senha
    const pwd = String(password);
    if (pwd.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return NextResponse.json({ error: 'A senha deve conter pelo menos uma letra e um número.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Caso especial: conta criada por convite de profissional (sem senha definida).
    // O cadastro completa a conta em vez de bloquear com "email já cadastrado".
    if (existing && !existing.password) {
      const hashedNew = await bcrypt.hash(pwd, 12);
      const completed = await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hashedNew,
          name: name ? String(name).trim() : existing.name,
        },
      });
      return NextResponse.json({ id: completed.id, email: completed.email }, { status: 201 });
    }

    if (existing) {
      return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(pwd, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: name ? String(name).trim() : null,
        role,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
