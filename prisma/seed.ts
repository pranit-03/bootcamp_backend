import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default users...');

  const users = [
    {
      username: 'admin',
      email: 'admin@inventrack.com',
      password: 'Admin@1234',
      name: 'Administrator',
      role: 'ADMINISTRATOR',
      phone: '9800000001',
    },
    {
      username: 'manager',
      email: 'manager@inventrack.com',
      password: 'Manager@1234',
      name: 'Manager User',
      role: 'MANAGER',
      phone: '9800000002',
    },
    {
      username: 'sales',
      email: 'sales@inventrack.com',
      password: 'Sales@1234',
      name: 'Sales User',
      role: 'SALES',
      phone: '9800000003',
    },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { username: user.username } });
    if (existing) {
      console.log(`User "${user.username}" already exists, skipping.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
    console.log(`Created user: ${user.username} (${user.role})`);
  }

  console.log('\nDone! Login credentials:');
  console.log('---------------------------');
  console.log('ADMINISTRATOR -> username: admin     | password: Admin@1234');
  console.log('MANAGER       -> username: manager   | password: Manager@1234');
  console.log('SALES         -> username: sales     | password: Sales@1234');
  console.log('---------------------------');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
