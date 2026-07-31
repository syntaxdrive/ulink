const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
  console.log('Public tables:', tables);
  
  const triggers = await prisma.$queryRaw`SELECT trigger_name, event_object_table, action_statement FROM information_schema.triggers WHERE trigger_schema='public' OR event_object_schema='auth'`;
  console.log('Triggers:', triggers);
}
main().catch(console.error).finally(() => prisma.$disconnect());
