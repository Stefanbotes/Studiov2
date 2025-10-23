# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database for Studio v2 using Prisma.

## Table of Contents
- [Overview](#overview)
- [Database Structure](#database-structure)
- [Initial Setup](#initial-setup)
- [Migration Management](#migration-management)
- [Vercel Deployment](#vercel-deployment)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## Overview

Studio v2 uses:
- **Database**: PostgreSQL (hosted at db002.hosteddb.reai.io)
- **ORM**: Prisma v6.7.0
- **Schema Location**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`

## Database Structure

The database contains 20+ tables including:

### Core Tables
- **User** - User accounts and authentication
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **Organization** - Organization management

### Client Management
- **ClientProfile** - Client information
- **Engagement** - Client engagements
- **AssessmentImport** - Assessment data imports
- **ComputedResult** - Computed assessment results

### Coaching Features
- **CoachingSession** - Scheduled coaching sessions
- **CoachingNote** - Coaching notes
- **SessionNote** - Session notes
- **Plan** & **PlanItem** - Coaching plans

### System Tables
- **AuditEvent** - Audit logging
- **MappingVersion** - Version management
- **SchemaPackVersion** - Schema versions
- **SchemaResolution** - Schema resolution data
- **Mode** - Mode definitions

## Initial Setup

### 1. Prerequisites
```bash
# Ensure you have Node.js and npm installed
node --version
npm --version

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file with your database connection:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?connect_timeout=15"
```

### 3. Generate Prisma Client
```bash
npm run postinstall
# or
npx prisma generate
```

### 4. Apply Migrations
```bash
npm run migrate:deploy
# or
npx prisma migrate deploy
```

## Migration Management

### Creating New Migrations (Development)

1. **Modify the Prisma schema** (`prisma/schema.prisma`)

2. **Create a migration**:
```bash
npx prisma migrate dev --name description_of_change
```

3. **Test the migration** locally before deploying

### Deploying Migrations (Production)

```bash
npm run migrate:deploy
```

This command:
- Applies all pending migrations
- Is safe to run multiple times (idempotent)
- Does not require user interaction
- Should be run before deploying the application

### Baseline Existing Database

If you have an existing database with tables but no migration history:

```bash
# Mark existing migrations as applied
npx prisma migrate resolve --applied "migration_name"
```

**Example**:
```bash
npx prisma migrate resolve --applied "20251020102014_init"
npx prisma migrate resolve --applied "20251020102138_update_mode_schema"
```

### Reset Development Database

⚠️ **WARNING**: This will delete all data!

```bash
npx prisma migrate reset
```

## Vercel Deployment

### Automatic Setup

The application is configured to automatically generate the Prisma client during Vercel builds via the `postinstall` script in `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Manual Migration Deployment

Migrations should be deployed **before** deploying the application:

1. **Set DATABASE_URL** in your local environment or Vercel CLI
2. **Run migrations**:
```bash
npm run migrate:deploy
```
3. **Deploy to Vercel**:
```bash
vercel --prod
```

### Environment Variables in Vercel

Ensure these environment variables are set in Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Your production URL
- Other application-specific variables

## Troubleshooting

### Error: "The table `public.User` does not exist"

**Cause**: Database migrations haven't been applied.

**Solution**:
```bash
npm run migrate:deploy
```

### Error: "The database schema is not empty"

**Cause**: Database has tables but no migration history.

**Solution**: Baseline the database:
```bash
npx prisma migrate resolve --applied "migration_name"
```

### Error: "Can't reach database server"

**Cause**: Database connection issues.

**Solutions**:
1. Check `DATABASE_URL` in `.env`
2. Verify network connectivity
3. Check database credentials
4. Ensure database server is running

### Error: "Prisma Client not generated"

**Cause**: Prisma client needs regeneration.

**Solution**:
```bash
npx prisma generate
```

### Migration Conflicts

If migrations are out of sync:

1. **Check migration status**:
```bash
npx prisma migrate status
```

2. **Resolve conflicts**:
```bash
# Mark as applied if already in database
npx prisma migrate resolve --applied "migration_name"

# Or mark as rolled back
npx prisma migrate resolve --rolled-back "migration_name"
```

### Connection Timeout Issues

If experiencing connection timeouts, adjust the `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?connect_timeout=30"
```

## Useful Commands

### Database Inspection

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate
```

### Database Operations

```bash
# Generate Prisma Client
npx prisma generate

# Deploy migrations (production)
npm run migrate:deploy

# Push schema changes (development, no migration)
npm run db:push

# Create migration (development)
npx prisma migrate dev --name migration_name

# Reset database (⚠️ destructive)
npx prisma migrate reset
```

### Testing Database Connection

Create a test script (`test-db.js`):
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log('Database connection successful!', result);
  await prisma.$disconnect();
}

main().catch(console.error);
```

Run it:
```bash
node test-db.js
```

## Database Verification Script

To verify your database setup, use the included verification script:

```bash
node verify_database.js
```

This script checks:
- Database connectivity
- Table existence
- Applied migrations
- Basic CRUD operations

## Best Practices

1. **Always backup production data** before running migrations
2. **Test migrations locally** before applying to production
3. **Run migrations** before deploying new code
4. **Use transactions** for data-critical operations
5. **Monitor migration performance** on large tables
6. **Keep DATABASE_URL secure** - never commit to version control
7. **Use connection pooling** for production deployments

## Schema Version

Current schema version: **2 migrations applied**
- `20251020102014_init` - Initial schema
- `20251020102138_update_mode_schema` - Mode schema updates

## Support

For issues or questions:
1. Check the [Prisma Documentation](https://www.prisma.io/docs)
2. Review error logs in `prisma/logs/`
3. Run database verification: `node verify_database.js`
4. Contact the development team

---

Last Updated: October 23, 2025
