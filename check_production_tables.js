const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://67a8040cb1f6f29fff6e965b617d5a8191bc40350789b08502623f87b1fdd7f6:sk_VWPvTwVcPa9sQIYExD_rc@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function checkTables() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    console.log('Tables in database:', tables);
    console.log('\nTotal tables:', tables.length);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
