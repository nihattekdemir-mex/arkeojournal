# ArkeoJournal - Kapsamlı Sistem Geliştirme Planı

## 1. Sistem Mimarisi Özeti

### Aktörler ve Roller
```
┌─────────────────────────────────────────────────────┐
│ Kullanıcı Rolleri                                   │
├─────────────────────────────────────────────────────┤
│ 1. Admin - Sistem yöneticisi, tüm kontrol          │
│ 2. Editor - Yayın sorumlusu, haberleri onaylar     │
│ 3. Correspondent - Haber gönderici                 │
│    - Akademik Muhabir (Üniversite)                 │
│    - Müze Muhabiri (Müze)                          │
│    - Arkeolog/Uzman                                │
│ 4. Student - Öğrenci (okuma erişimi)               │
│ 5. Guest - Misafir (sadece okuma)                  │
└─────────────────────────────────────────────────────┘
```

### İş Akışı (Workflow)
```
Haber Gönderimi → Editörial Kontrol → Onay/Reddetme → Yayınlama → Yayında
```

---

## 2. Veritabanı Şeması (Prisma Models)

### Yeni/Güncellenmiş Modeller

#### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(STUDENT)  // Yeni!
  organization  String?   // Okul/Müze adı
  department    String?   // Bölüm
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  newsItems     NewsItem[]
  approvals     NewsApproval[]
  
  // UserRole: ADMIN, EDITOR, CORRESPONDENT_ACADEMIC, CORRESPONDENT_MUSEUM, CORRESPONDENT_EXPERT, STUDENT, GUEST
}
```

#### Category Model
```prisma
model Category {
  id              String    @id @default(cuid())
  name            String    @unique
  slug            String    @unique
  description     String?
  allowedRoles    UserRole[]  // Kimin haber göndereceğini kısıtla
  color           String?
  icon            String?
  createdAt       DateTime  @default(now())
  
  newsItems       NewsItem[]
}
```

#### NewsStatus Model
```prisma
enum NewsStatus {
  DRAFT          // Taslak
  SUBMITTED      // Gönderildi (editöre bekleniyor)
  UNDER_REVIEW   // Editör tarafından inceleniyor
  APPROVED       // Onaylandı
  REJECTED       // Reddedildi
  PUBLISHED      // Yayında
  ARCHIVED       // Arşivlendi
}
```

#### NewsItem Model (Güncellenmiş)
```prisma
model NewsItem {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  summary       String?
  content       String
  imageUrl      String?
  
  // Yeni alanlar
  status        NewsStatus @default(DRAFT)
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  authorId      String
  author        User      @relation(fields: [authorId], references: [id])
  
  // Editorial tracking
  submittedAt   DateTime?
  approvals     NewsApproval[]
  rejectionReason String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  publishedAt   DateTime?
  
  comments      Comment[]
}
```

#### NewsApproval Model (Yeni!)
```prisma
model NewsApproval {
  id          String    @id @default(cuid())
  newsId      String
  news        NewsItem  @relation(fields: [newsId], references: [id], onDelete: Cascade)
  
  editorId    String
  editor      User      @relation(fields: [editorId], references: [id])
  
  status      ApprovalStatus  // PENDING, APPROVED, REJECTED
  comment     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([newsId, editorId])
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Comment Model (Var olan, muhtemelen)
```prisma
model Comment {
  id        String    @id @default(cuid())
  content   String
  authorId  String
  newsId    String
  
  author    User      @relation(fields: [authorId], references: [id])
  news      NewsItem  @relation(fields: [newsId], references: [id], onDelete: Cascade)
  
  createdAt DateTime  @default(now())
}
```

---

## 3. API Endpoints (Yeni/Güncellenmiş)

### News Management Endpoints

#### GET /api/news
- Yayında olan haberleri listele (filtreleme, pagination)
- **Erişim**: Herkese açık
- Query params: `category`, `search`, `page`, `limit`, `status` (admin için)

#### POST /api/news
- Yeni haber oluştur/gönder
- **Erişim**: CORRESPONDENT_* rollerine
- Body: `{ title, content, summary, categoryId, imageUrl }`
- Response: NewsItem (status: SUBMITTED)

#### GET /api/news/:id
- Haber detayını getir
- **Erişim**: Herkese açık (status kontrollü)

#### PATCH /api/news/:id
- Haberi güncelle (DRAFT/SUBMITTED durumunda)
- **Erişim**: Yazar + ADMIN/EDITOR
- Body: `{ title, content, summary, categoryId, imageUrl }`

#### DELETE /api/news/:id
- Haberi sil (DRAFT/REJECTED durumunda)
- **Erişim**: Yazar + ADMIN

### Editorial Workflow Endpoints (Yeni!)

#### GET /api/approvals
- Bekleyen onay gerektiren haberleri listele
- **Erişim**: EDITOR + ADMIN
- Query params: `status` (PENDING, APPROVED, REJECTED), `page`, `limit`

#### POST /api/approvals/:newsId
- Haberi onayla/reddet
- **Erişim**: EDITOR + ADMIN
- Body: `{ status: "APPROVED" | "REJECTED", comment?: "Neden reddedildi?" }`

#### GET /api/approvals/:newsId
- Haber için tüm onay kayıtlarını göster
- **Erişim**: ADMIN + haber yazarı

### User Management Endpoints

#### GET /api/users
- Tüm kullanıcıları listele
- **Erişim**: ADMIN
- Query params: `role`, `organization`, `page`, `limit`

#### PATCH /api/users/:id
- Kullanıcı rolünü/bilgilerini güncelle
- **Erişim**: ADMIN
- Body: `{ role, organization, department }`

#### GET /api/users/:id/stats
- Kullanıcı istatistikleri (kaç haber gönderdi, kaçı onaylandı)
- **Erişim**: ADMIN + kendisi

---

## 4. Frontend Components (Yeni/Güncellenmiş)

### Admin & Editorial Components

1. **AdminDashboard** (`/admin`)
   - Bekleyen onay haberleri (widget)
   - Kullanıcı yönetimi
   - İstatistikler

2. **NewsApprovalQueue** (`/admin/approvals`)
   - Tüm bekleyen haberleri listele
   - Haber detay modal
   - Onayla/Reddet butonları
   - Editör notu ekleme

3. **NewsSubmissionForm** (güncellenmiş)
   - Rol-spesifik kategori seçimi
   - Haber durumu göstergesi
   - Editör geri bildirim görüntüleme

4. **EditorPanel** (`/editor`)
   - Bekleyen haberleri göster
   - Haber inceleme & onay
   - Reddedilen haberlerin açıklaması

5. **UserManagement** (`/admin/users`)
   - Kullanıcı tablosu
   - Rol atama
   - Kuruluş/Bölüm yönetimi

### User-Facing Components

6. **CategoryFilter** (güncellenmiş)
   - Rol-spesifik kategoriler görüntüle

7. **MySubmissions** (`/my-submissions`)
   - Kendi gönderilen haberleri listele
   - Durumunu göster (DRAFT, SUBMITTED, APPROVED, REJECTED)
   - Editör yorumlarını göster

---

## 5. Güvenlik & Yetkilendirme

### Role-Based Access Control (RBAC)

```typescript
const permissions = {
  ADMIN: ['create', 'read', 'update', 'delete', 'approve', 'manage_users', 'manage_categories'],
  EDITOR: ['read', 'approve', 'reject'],
  CORRESPONDENT_ACADEMIC: ['create_academic_news', 'read'],
  CORRESPONDENT_MUSEUM: ['create_museum_news', 'read'],
  CORRESPONDENT_EXPERT: ['create_expert_news', 'read'],
  STUDENT: ['read'],
  GUEST: ['read'],
}
```

### Middleware Implementation
- NextAuth ile rol kontrollü authentication
- API route middleware ile permission check
- Frontend route protection

---

## 6. Veritabanı Migrasyon Adımları

1. Mevcut veritabanını backup al
2. Prisma schema'sını güncelle (User, Category, NewsItem, NewsApproval modelleri)
3. Migration oluştur: `prisma migrate dev --name add_editorial_workflow`
4. Seed script'ini çalıştır (test kullanıcıları + kategoriler)
5. Seed'den sonra NextAuth.ts'yi güncelle

---

## 7. Implementation Sırası

### Aşama 1: Veritabanı & Backend (1-2 gün)
- [ ] Prisma schema güncellemesi
- [ ] Migration & seed
- [ ] API endpoints oluşturma
- [ ] RBAC middleware

### Aşama 2: Editorial Workflow (1-2 gün)
- [ ] NewsApproval logic
- [ ] Approval endpoints testi
- [ ] Email notifications (opsiyonel)

### Aşama 3: Frontend (2-3 gün)
- [ ] Admin Dashboard
- [ ] Approval Queue UI
- [ ] My Submissions sayfası
- [ ] User Management

### Aşama 4: Testing & Polish (1 gün)
- [ ] End-to-end testler
- [ ] UI/UX iyileştirmesi
- [ ] Error handling
- [ ] Performance optimization

---

## 8. Teknik Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Hook Form
- **Backend**: Next.js API Routes
- **Database**: Prisma + PostgreSQL (or MySQL)
- **Auth**: NextAuth.js 4
- **UI Components**: shadcn/ui (existing)
- **Notifications**: React Hot Toast (existing)

---

## 9. Başarı Kriterleri

✅ Tüm roller farklı kategoriler görebilir  
✅ Haberler DRAFT → SUBMITTED → APPROVED → PUBLISHED akışını takip eder  
✅ Editörler haberleri onaylayabilir/reddedebilir  
✅ Müze müdürleri sadece müze kategorisinde haber gönderebilir  
✅ Admin paneli tüm sistemi yönetebilir  
✅ Performans: <1s sayfa yükleme  
✅ Mobile responsive  
✅ Tüm API'ler test edilmiş  

---

## 10. Dosya Yapısı

```
app/
├── admin/
│   ├── page.tsx           (Dashboard)
│   ├── approvals/
│   │   └── page.tsx       (Approval Queue)
│   └── users/
│       └── page.tsx       (User Management)
├── editor/
│   └── page.tsx           (Editor Panel)
├── my-submissions/
│   └── page.tsx           (User's submissions)
├── api/
│   ├── news/
│   │   ├── route.ts       (GET/POST)
│   │   └── [id]/
│   │       ├── route.ts   (GET/PATCH/DELETE)
│   │       └── approval/
│   │           └── route.ts (Approval logic)
│   ├── approvals/
│   │   ├── route.ts       (GET)
│   │   └── [id]/
│   │       └── route.ts   (POST for approve/reject)
│   └── users/
│       ├── route.ts       (GET/POST)
│       └── [id]/
│           └── route.ts   (PATCH)

components/
├── admin/
│   ├── admin-dashboard.tsx
│   ├── approval-queue.tsx
│   └── user-management.tsx
├── editor/
│   └── editor-panel.tsx
└── news/
    ├── news-submission-form.tsx (updated)
    └── my-submissions.tsx

lib/
├── permissions.ts         (RBAC logic)
├── auth-middleware.ts     (Auth checks)
└── constants.ts           (Roles, statuses)

prisma/
└── schema.prisma          (Updated)
```
