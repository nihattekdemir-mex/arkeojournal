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
│   │   └── users/              # User management (planned)
│   ├── haber/                  # News pages
│   │   └── yeni/               # New news submission page
│   ├── my-submissions/         # User submissions page
│   └── page.tsx                # Home page
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── constants.ts            # Role/category/status labels and mappings
│   ├── db.ts                   # Prisma client singleton
│   ├── permissions.ts          # Role-based permission system
│   └── utils.ts                # Utility functions
├── prisma/
│   └── schema.prisma           # Database schema definition
└── public/                     # Static assets
```

## Installation

### Prerequisites

- Node.js 18+ or later
- PostgreSQL database
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/nihattekdemir-mex/arkeojournal.git
   cd arkeojournal/nextjs_space
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Generate Prisma client** (see Known Issues below)
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### News Management
- `GET /api/haberler` - List published news (with filters)
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
- **User**: User accounts with role, organization, and department
- **News**: News articles with status and editorial workflow
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

## Known Issues

### Prisma Client Generation (BLOCKER)

**Issue**: Running `npx prisma generate` fails with the error:
```
Error: ENOENT: no such file or directory, mkdir '/home/ubuntu'
```

**Cause**: A bug in Prisma 6.7.0 trying to create a directory that doesn't exist on macOS systems.

**Workarounds**:

1. **Using Docker** (Recommended)
   ```bash
   docker run --rm -v $(pwd):/app -w /app node:18 npm install && npx prisma generate
   ```

2. **Using Linux/WSL**
   Run the generation commands on a Linux machine where the directory structure is different.

3. **Using Ubuntu container**
   ```bash
   docker run --rm -v $(pwd):/app -w /app ubuntu:22.04 bash -c "apt-get update && apt-get install -y nodejs npm && npm install && npx prisma generate"
   ```

**Next Steps**: Once Prisma client is properly generated, run:
```bash
npx prisma migrate dev --name add_editorial_workflow
npm run build
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is part of ArkeoJournal - a project for archaeological news management.

## Support

For issues and questions, please create an issue in the GitHub repository.
