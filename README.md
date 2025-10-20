# Studio 2

> **Independent Clone** of the original NCP Studio application for safe development and testing.

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![Database](https://img.shields.io/badge/database-SQLite-blue)
![Framework](https://img.shields.io/badge/framework-Next.js_14-black)

---

## 🎯 Purpose

Studio 2 is a **completely isolated** clone of NCP Studio, designed to allow:
- Structural changes and formula modifications
- Questionnaire updates and expansions
- Testing new features without production risk
- Independent development cycles

**Zero interference** with the original deployed Studio app.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Getting Started

```bash
# Navigate to project
cd /home/ubuntu/studio_2

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Visit: `http://localhost:3000`

### Login Credentials

```
Email: john@doe.com
Password: johndoe123
Role: Master Coach
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [STUDIO_2_MIGRATION_GUIDE.md](./STUDIO_2_MIGRATION_GUIDE.md) | Complete setup and migration guide |
| [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) | Detailed list of all changes |
| [README.md](./README.md) | This file - project overview |

---

## 🏗️ Project Structure

```
studio_2/
├── app/                    # Next.js app directory (pages & routes)
├── components/             # React components
├── lib/                    # Utility libraries & business logic
├── prisma/                 # Database schema & migrations
├── scripts/                # Database & utility scripts
├── data/                   # Static data files (schemas, modes)
├── public/                 # Static assets
├── .env                    # Environment configuration
├── studio_2.db            # SQLite database (generated)
└── Documentation files
```

---

## 🔧 Key Features

- **NextAuth.js** authentication with credentials provider
- **Prisma ORM** with SQLite database
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components
- Schema therapy analysis engine
- Client profile management
- Assessment import & processing
- Coaching hub with note-taking

---

## 🗄️ Database

**Provider:** SQLite  
**File:** `studio_2.db` (local file-based database)

### Database Commands

```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (caution!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

---

## 📝 Development Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Database GUI
npx prisma migrate   # Manage migrations

# Linting
npm run lint         # Check code quality
```

---

## 🔒 Complete Isolation

Studio 2 is **100% independent** from the original Studio:

✅ Separate database (SQLite vs PostgreSQL)  
✅ Different authentication secret  
✅ Independent project directory  
✅ Updated branding throughout  
✅ Isolated file storage paths  
✅ Separate session management  

**Result:** Zero risk to production environment.

---

## 🔄 Making Changes

Feel free to modify:

1. **Formulas & Calculations** → `/lib/utils/` directory
2. **Database Schema** → `prisma/schema.prisma` + migrate
3. **UI Components** → `components/` directory
4. **Assessment Logic** → `/lib/utils/` files
5. **Data Files** → `/data/` directory

After database schema changes:
```bash
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

---

## 🌳 Git Repository

Initialized and ready for version control:

```bash
# View status
git status

# Create new feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "Your commit message"
```

---

## ⚠️ Important Notes

1. **Never mix environments** - Keep Studio and Studio 2 completely separate
2. **Backup database** - Copy `studio_2.db` before major changes
3. **Test thoroughly** - All changes in Studio 2 before considering for production
4. **Document changes** - Keep track of modifications for future reference

---

## 🐛 Troubleshooting

### Issue: Database connection error
```bash
# Check DATABASE_URL in .env
cat .env

# Should be: DATABASE_URL="file:./studio_2.db"
```

### Issue: Prisma Client not found
```bash
npx prisma generate
```

### Issue: Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Port already in use
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.28 | React framework |
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type safety |
| Prisma | 6.7.0 | Database ORM |
| SQLite | (via Prisma) | Database |
| NextAuth.js | 4.24.11 | Authentication |
| Tailwind CSS | 3.3.3 | Styling |
| Radix UI | Latest | Component library |

---

## 🔗 Related Resources

- **Original Studio**: `/home/ubuntu/Uploads/`
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org

---

## 📊 Comparison with Original Studio

| Aspect | Original Studio | Studio 2 |
|--------|----------------|----------|
| **Name** | NCP Studio | Studio 2 |
| **Location** | /home/ubuntu/Uploads | /home/ubuntu/studio_2 |
| **Database** | PostgreSQL (Remote) | SQLite (Local) |
| **Purpose** | Production | Development/Testing |
| **Risk Level** | High (live users) | Low (isolated) |

---

## ✅ Status

- [x] Complete isolation achieved
- [x] Database migrated and seeded
- [x] All dependencies updated
- [x] Documentation created
- [x] Git repository initialized
- [x] Ready for development

---

## 🎉 Ready to Use!

Studio 2 is fully set up and ready for development. Make changes confidently without affecting the production Studio app!

For detailed information, see [STUDIO_2_MIGRATION_GUIDE.md](./STUDIO_2_MIGRATION_GUIDE.md)

---

**Version:** 1.0  
**Last Updated:** October 20, 2025  
**Status:** ✅ Production Ready
