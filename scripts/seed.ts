import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Conta de teste obrigatória (oculta)
  const testEmail = 'abacus-342d125f@example.com';
  const testPassword = '2IGwh9$Ntm';
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  await prisma.user.upsert({
    where: { email: testEmail },
    update: { password: hashedPassword, name: 'Admin Test' },
    create: {
      email: testEmail,
      password: hashedPassword,
      name: 'Admin Test',
    },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
