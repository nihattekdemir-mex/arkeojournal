# ArkeoJournal - Next.js Editorial Platform

A comprehensive editorial management system built with Next.js 14, TypeScript, Tailwind CSS, and Prisma ORM for managing archaeological news and articles with multi-role support and editorial workflow.

## Features

- **Multi-Role System**: Admin, Editor, Correspondents (Academic/Museum/Expert), Students, and Guests
- **Editorial Workflow**: Draft → Submitted → Under Review → Approved/Rejected → Published
- **Role-Based Access Control (RBAC)**: Granular permission system per role
- **Admin Dashboard**: Comprehensive admin panel for system management
- **News Management**: Full CRUD operations with category-based publishing
- **Approval System**: Editorial approval queue with status tracking
- **Authentication**: NextAuth.js v4 with secure session management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL with Prisma ORM 6.7.0
- **Authentication**: NextAuth.js v4
- **UI Components**: shadcn/ui
- **Notifications**: Sonner
- **Container**: Docker & Docker Compose
- **Package Manager**: npm

## Project Structure

```
nextjs_space/
├── app/
│   ├── api/                    # API routes
│   │   ├── approvals/          # Editorial approval endpoints
│   │   ├── auth/               # Authentication endpoints
│   │   ├── haberler/           # News management endpoints
│   │   ├── my-submissions/     # User submissions endpoints
│   │   └── [...nextauth]/      # NextAuth configuration
│   ├── admin/                  # Admin dashboard pages
│   │   ├── approvals/          # Approval queue page
│   │   └── users/              # User management
│   ├── haber/                  # News pages
│   │   └── yeni/               # New news submission page
│   ├── my-submissions/         # User submissions page
│   └── page.tsx                # Home page
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── constants.ts            # Role/category/status labels
│   ├── db.ts                   # Prisma client singleton
│   ├── permissions.ts          # RBAC permission system
│   └── utils.ts                # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding script
├── docker-compose.yml          # PostgreSQL development container
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Quick Start

### Option 1: Docker Setup (Recommended)

**Prerequisites**: Docker and Docker Compose

1. **Clone and navigate**
   ```bash
   git clone https://github.com/nihattekdemir-mex/arkeojournal.git
   cd arkeojournal/nextjs_space
   ```

2. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

3. **Wait for database to be ready**
   ```bash
   sleep 5
   ```

4. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

5. **Generate Prisma client and run migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Seed database with test data**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Open browser**
   ```
   http://localhost:3000
   ```

### Option 2: Manual Setup

If you have PostgreSQL installed locally:

1. **Create database**
   ```bash
   createdb arkeojournal
   ```

2. **Update .env file**
   ```bash
   cp .env.example .env
   # Edit DATABASE_URL to point to your local PostgreSQL
   ```

3. **Follow steps 4-8 from Option 1**

## Test Accounts

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@arkeojournal.com | Admin123! |
| **Editor** | editor@arkeojournal.com | Editor123! |
| **Correspondent (Academic)** | academic@arkeojournal.com | Academic123! |
| **Correspondent (Museum)** | museum@arkeojournal.com | Museum123! |
| **Correspondent (Expert)** | expert@arkeojournal.com | Expert123! |
| **Student** | student@arkeojournal.com | Student123! |

## Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Seed database
npm run seed
```

## Database Management

```bash
# View database UI
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (development only!)
npx prisma migrate reset

# Reset database without seeding
npx prisma db push --force-reset
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### News Management
- `GET /api/haberler` - List published news (with pagination/filters)
- `POST /api/haberler` - Create new news (authenticated users)
- `GET /api/haberler/[id]` - Get news details
- `PUT /api/haberler/[id]` - Update news (author only)
- `DELETE /api/haberler/[id]` - Delete news (author only)

### Editorial Approvals
- `GET /api/approvals` - List news pending approval (admin/editor)
- `POST /api/approvals/[newsId]` - Approve/reject news
- `GET /api/approvals/[newsId]` - Get news approval details

### User Submissions
- `GET /api/my-submissions` - Get user's submitted news

## Database Schema

### Core Models
- **User**: User accounts with role, organization, department
- **News**: News articles with editorial workflow status
- **NewsApproval**: Approval records for editorial workflow
- **Comment**: Comments on news articles

### Enums
- **Role**: ADMIN, EDITOR, CORRESPONDENT_ACADEMIC, CORRESPONDENT_MUSEUM, CORRESPONDENT_EXPERT, STUDENT, GUEST
- **Kategori**: KAZIDAN_HABERLER, OKULDAN_HABERLER, MUZEDEN_HABERLER
- **NewsStatus**: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PUBLISHED, ARCHIVED
- **ApprovalStatus**: PENDING, APPROVED, REJECTED

## Role Permissions Matrix

| Role | Create News | Approve | Manage Users | Publish | View Analytics |
|------|:-----------:|:-------:|:------------:|:-------:|:---------------:|
| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ |
| EDITOR | ✗ | ✓ | ✗ | ✓ | ✓ |
| CORRESPONDENT_* | ✓ | ✗ | ✗ | ✗ | ✗ |
| STUDENT | ✗ | ✗ | ✗ | ✗ | ✗ |
| GUEST | ✗ | ✗ | ✗ | ✗ | ✗ |

## Editorial Workflow States

```
┌─────────┐
│ DRAFT   │ (Author creates/edits)
└────┬────┘
     │ (Author submits)
     ↓
┌──────────────┐
│ SUBMITTED    │ (Waiting for editor review)
└────┬─────────┘
     │ (Editor starts review)
     ↓
┌─────────────┐
│ UNDER_REVIEW│ (Editor reviewing)
└────┬────────┘
     │
     ├──→ ┌──────────┐ (If approved)
     │    │ APPROVED │
     │    └────┬─────┘
     │         │ (Editor publishes)
     │         ↓
     │    ┌───────────┐
     │    │ PUBLISHED │
     │    └───────────┘
     │
     └──→ ┌──────────┐ (If rejected)
          │ REJECTED │
          └──────────┘
```

## Docker Commands

```bash
# Start PostgreSQL container
docker-compose up -d

# View database logs
docker-compose logs -f postgres

# Stop containers
docker-compose down

# View Docker statistics
docker stats

# Access PostgreSQL directly
docker exec -it arkeojournal_db psql -U arkeojournal_user -d arkeojournal
```

## Known Issues

### Prisma Generate on macOS

If `npx prisma generate` fails with `mkdir '/home/ubuntu'` error on macOS:

**Solution**: Use docker-compose PostgreSQL setup which works around this issue.

## Performance Tips

1. **Use pagination** for news listing: `?page=1&limit=20`
2. **Filter by category**: `?kategori=KAZIDAN_HABERLER`
3. **Search functionality**: `?search=keyword`
4. **Enable query caching** with proper TTL headers

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL container
docker-compose ps

# Restart database
docker-compose restart postgres

# Check database health
docker-compose exec postgres pg_isready -U arkeojournal_user
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Regenerate Prisma client
npx prisma generate
```

### Port already in use
```bash
# Change port in docker-compose.yml or .env
# Or kill process using port 5432
lsof -ti:5432 | xargs kill -9
```

## License

This project is part of ArkeoJournal - a project for archaeological news management.

## Support

For issues and questions, please create an issue in the GitHub repository.

---

**Last Updated**: July 2026  
**Version**: 1.0.0
