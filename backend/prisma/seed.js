const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: adminPassword,
      nombre: 'Administrador FNC',
      rol: 'ADMIN',
      activo: true
    }
  });
  console.log('✓ Admin created:', admin.username);

  // Crear usuario de prueba
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.users.upsert({
    where: { username: 'usuario' },
    update: {},
    create: {
      username: 'usuario',
      password_hash: userPassword,
      nombre: 'Usuario Prueba',
      rol: 'USUARIO',
      activo: true
    }
  });
  console.log('✓ User created:', user.username);

  console.log('✅ Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());