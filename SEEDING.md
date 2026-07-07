# Database Seeding Guide - ArkeoJournal

This guide explains how to seed the ArkeoJournal database with test data.

## Quick Start

### Using Docker Compose

```bash
# Start PostgreSQL
docker-compose up -d

# Wait for database
sleep 5

# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with test data
npm run seed
```

### Manual Database

```bash
# Assuming PostgreSQL is running locally
npm run seed
```

## Test Data Created

The seed script creates the following test data:

### Users (6 total)

| Email | Role | Password | Organization |
|-------|------|----------|---------------|
| admin@arkeojournal.com | ADMIN | Admin123! | ArkeoJournal |
| editor@arkeojournal.com | EDITOR | Editor123! | ArkeoJournal |
| academic@arkeojournal.com | CORRESPONDENT_ACADEMIC | Academic123! | Istanbul University |
| museum@arkeojournal.com | CORRESPONDENT_MUSEUM | Museum123! | Istanbul Archaeology Museum |
| expert@arkeojournal.com | CORRESPONDENT_EXPERT | Expert123! | Archaeology Institute |
| student@arkeojournal.com | STUDENT | Student123! | Istanbul University |

### News Articles (5 total)

#### 1. Draft News
- **Title**: Taslak Haber: Kazı Başladı
- **Status**: DRAFT
- **Author**: Academic Correspondent
- **Category**: Kazıdan Haberler

#### 2. Submitted News
- **Title**: Gönderilen Haber: Önemli Buluntular
- **Status**: SUBMITTED
- **Author**: Expert Correspondent
- **Category**: Kazıdan Haberler

#### 3. Under Review News
- **Title**: İncelemede: Müze Sergisi Açıldı
- **Status**: UNDER_REVIEW
- **Author**: Museum Correspondent
- **Category**: Müzeden Haberler
- **Pending Approval**: Yes (Editor)

#### 4. Published News #1
- **Title**: Yayında: Antik Şehir Keşfi
- **Status**: PUBLISHED
- **Author**: Academic Correspondent
- **Category**: Kazıdan Haberler
- **Comments**: 2

#### 5. Published News #2
- **Title**: Yayında: Öğrenci Araştırması Başarıyla Tamamlandı
- **Status**: PUBLISHED
- **Author**: Student
- **Category**: Okuldan Haberler

### Comments (2 total)

- Comment 1: "Harika bir araştırma! Tebrikler." (By Student)
- Comment 2: "Bu buluntular arkeoloji tarihinde..." (By Expert)

### Approvals (1 total)

- News: "İncelemede: Müze Sergisi Açıldı"
- Editor: Editor User
- Status: PENDING

## Custom Seeding

### Add More Test Data

Edit `prisma/seed.ts` to add more users, news, or comments:

```typescript
const moreNews = await prisma.news.create({
  data: {
    title: 'Your News Title',
    content: 'Your news content',
    summary: 'Summary',
    kategori: 'KAZIDAN_HABERLER',
    status: 'PUBLISHED',
    authorId: user.id,
    imageUrl: 'https://via.placeholder.com/800x400',
    publishedAt: new Date(),
  },
});
```

### Reset and Re-seed

```bash
# Reset database (be careful!)
npx prisma migrate reset

# Or just re-run seed
npm run seed
```

## Seed Script Options

### Run Seed with Logging

```bash
npm run seed 2>&1 | tee seed.log
```

### Clear Specific Table

```bash
npx prisma db execute --stdin << EOF
DELETE FROM "Comment";
DELETE FROM "NewsApproval";
DELETE FROM "News";
DELETE FROM "User";
EOF
```

## Verification

### Check Users

```bash
npx prisma studio
# Navigate to User table and verify 6 users exist
```

### Check Data Count

```bash
node << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const news = await prisma.news.count();
  const comments = await prisma.comment.count();
  const approvals = await prisma.newsApproval.count();

  console.log(`Users: ${users}`);
  console.log(`News: ${news}`);
  console.log(`Comments: ${comments}`);
  console.log(`Approvals: ${approvals}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit(0));
EOF
```

## Seeding in Production

### Never seed production with test data!

Instead:

1. **Backup first**
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Create safe migration**
   ```bash
   npx prisma migrate dev --name add_real_data
   ```

3. **Use manual data insertion**
   ```bash
   npx prisma db execute --stdin << EOF
   INSERT INTO "User" (id, email, name, password, role, organization, department, "createdAt", "updatedAt")
   VALUES (gen_random_uuid(), 'user@example.com', 'Name', 'hash', 'CORRESPONDENT_ACADEMIC', 'Org', 'Dept', now(), now());
   EOF
   ```

## Troubleshooting

### Seed Script Fails

```bash
# Check Prisma connection
npx prisma db execute --stdin << EOF
SELECT 1;
EOF

# Check if schema is applied
npx prisma db push

# Run seed again
npm run seed
```

### Duplicate Data

```bash
# Clear all tables first
npx prisma migrate reset --force

# Then seed
npm run seed
```

### Permission Denied

```bash
# Make seed script executable
chmod +x prisma/seed.ts

# Check database user permissions
psql -U $DB_USER -d $DB_NAME -c "SELECT 1;"
```

## Advanced Seeding

### Bulk Insert Using CSV

```bash
# Create CSV file
cat > users.csv << EOF
email,name,role,organization,department
user1@test.com,User One,STUDENT,University,Department
user2@test.com,User Two,CORRESPONDENT_ACADEMIC,University,Archaeology
EOF

# Import with Prisma
# (Implement custom script for CSV import)
```

### Seed with Faker.js

```bash
npm install --save-dev @faker-js/faker

# Then in seed.ts:
import { faker } from '@faker-js/faker';

const user = await prisma.user.create({
  data: {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    // ...
  }
});
```

## Performance

For large datasets (1000+ records):

```bash
# Seed in batches
# Implement pagination in seed.ts

# Or use raw SQL for bulk insert
await prisma.$executeRawUnsafe(`
  INSERT INTO "User" (id, email, name, password, role, ...)
  VALUES (...)
`);
```

## Seeding Strategies

### Development

- Fresh seed on every `npm run dev`
- Keep seed data minimal for fast iterations

### Testing

- Seed before each test suite
- Use transactions to rollback changes

### Staging

- Mirror production data (anonymized)
- Verify production-like scenarios

### Production

- Only use migrations for real data changes
- Manual data insertion for critical data
- Never use seed script

## Related Commands

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# View database schema
npx prisma studio

# Validate schema
npx prisma validate

# Generate Prisma Client
npx prisma generate
```

## Support

For seeding issues:
- Check `TESTING.md` for test database setup
- See `DEPLOYMENT.md` for production database setup
- GitHub Issues: https://github.com/nihattekdemir-mex/arkeojournal/issues
