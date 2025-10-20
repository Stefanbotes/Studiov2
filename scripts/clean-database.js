require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function cleanDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('🧹 Starting database cleanup...');

    // Delete in dependency order to avoid foreign key constraints
    await prisma.computedResult.deleteMany({});
    console.log('✅ Cleared computed results');

    await prisma.assessmentImport.deleteMany({});
    console.log('✅ Cleared assessment imports');

    await prisma.coachingNote.deleteMany({});
    console.log('✅ Cleared coaching notes');

    await prisma.coachingSession.deleteMany({});
    console.log('✅ Cleared coaching sessions');

    await prisma.sessionNote.deleteMany({});
    console.log('✅ Cleared session notes');

    await prisma.planItem.deleteMany({});
    console.log('✅ Cleared plan items');

    await prisma.plan.deleteMany({});
    console.log('✅ Cleared plans');

    await prisma.schemaResolution.deleteMany({});
    console.log('✅ Cleared schema resolutions');

    await prisma.engagement.deleteMany({});
    console.log('✅ Cleared engagements');

    await prisma.clientProfile.deleteMany({});
    console.log('✅ Cleared client profiles');

    await prisma.auditEvent.deleteMany({});
    console.log('✅ Cleared audit events');

    console.log('🎉 Database cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();