const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('=== Database Verification ===\n');
  
  try {
    // 1. Check database connection
    console.log('✓ Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('  ✓ Database connection successful\n');

    // 2. Check tables
    console.log('✓ Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log(`  ✓ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`    - ${t.tablename}`));
    console.log('');

    // 3. Check migrations
    console.log('✓ Checking migrations...');
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at
    `;
    console.log(`  ✓ Found ${migrations.length} applied migrations:`);
    migrations.forEach(m => console.log(`    - ${m.migration_name}`));
    console.log('');

    // 4. Check critical tables structure
    console.log('✓ Checking User table structure...');
    const userCount = await prisma.user.count();
    console.log(`  ✓ User table accessible (${userCount} users)\n`);

    console.log('✓ Checking ClientProfile table structure...');
    const clientCount = await prisma.clientProfile.count();
    console.log(`  ✓ ClientProfile table accessible (${clientCount} profiles)\n`);

    console.log('✓ Checking Engagement table structure...');
    const engagementCount = await prisma.engagement.count();
    console.log(`  ✓ Engagement table accessible (${engagementCount} engagements)\n`);

    console.log('✓ Checking AssessmentImport table structure...');
    const importCount = await prisma.assessmentImport.count();
    console.log(`  ✓ AssessmentImport table accessible (${importCount} imports)\n`);

    console.log('=== Database Verification Complete ===');
    console.log('✓ All checks passed!');
    
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
