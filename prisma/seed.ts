import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.newsApproval.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@arkeojournal.com',
      name: 'Admin User',
      password: await bcryptjs.hash('Admin123!', 10),
      role: 'ADMIN',
      organization: 'ArkeoJournal',
      department: 'Administration',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@arkeojournal.com',
      name: 'Editor User',
      password: await bcryptjs.hash('Editor123!', 10),
      role: 'EDITOR',
      organization: 'ArkeoJournal',
      department: 'Editorial',
    },
  });

  const academicCorrespondent = await prisma.user.create({
    data: {
      email: 'academic@arkeojournal.com',
      name: 'Dr. Akademik Muhabir',
      password: await bcryptjs.hash('Academic123!', 10),
      role: 'CORRESPONDENT_ACADEMIC',
      organization: 'Istanbul University',
      department: 'Archaeology',
    },
  });

  const museumCorrespondent = await prisma.user.create({
    data: {
      email: 'museum@arkeojournal.com',
      name: 'Museum Curator',
      password: await bcryptjs.hash('Museum123!', 10),
      role: 'CORRESPONDENT_MUSEUM',
      organization: 'Istanbul Archaeology Museum',
      department: 'Collections',
    },
  });

  const expertCorrespondent = await prisma.user.create({
    data: {
      email: 'expert@arkeojournal.com',
      name: 'Expert Correspondent',
      password: await bcryptjs.hash('Expert123!', 10),
      role: 'CORRESPONDENT_EXPERT',
      organization: 'Archaeology Institute',
      department: 'Research',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@arkeojournal.com',
      name: 'Student User',
      password: await bcryptjs.hash('Student123!', 10),
      role: 'STUDENT',
      organization: 'Istanbul University',
      department: 'Archaeology',
    },
  });

  console.log('✓ Users created');

  // Create news items in different statuses
  const draftNews = await prisma.news.create({
    data: {
      title: 'Taslak Haber: Kazı Başladı',
      content: 'Bu haber şu anda taslak durumundadır. Henüz gönderilmemiştir.',
      summary: 'Yeni kazı projesi başladı',
      kategori: 'KAZIDAN_HABERLER',
      status: 'DRAFT',
      authorId: academicCorrespondent.id,
      imageUrl: 'https://via.placeholder.com/800x400?text=Draft+News',
    },
  });

  const submittedNews = await prisma.news.create({
    data: {
      title: 'Gönderilen Haber: Önemli Buluntular',
      content: 'Bu haber gönderilmiş ve onay beklenmektedir. Editor tarafından incelenecek.',
      summary: 'Son kazı sezonundan dikkat çekici buluntular',
      kategori: 'KAZIDAN_HABERLER',
      status: 'SUBMITTED',
      submittedAt: new Date(),
      authorId: expertCorrespondent.id,
      imageUrl: 'https://via.placeholder.com/800x400?text=Submitted+News',
    },
  });

  const underReviewNews = await prisma.news.create({
    data: {
      title: 'İncelemede: Müze Sergisi Açıldı',
      content: 'Bu haber editör tarafından incelenmektedir. Onay sürecinde bulunmaktadır.',
      summary: 'Yeni arkeolojik eserler sergisi açıldı',
      kategori: 'MUZEDEN_HABERLER',
      status: 'UNDER_REVIEW',
      submittedAt: new Date(Date.now() - 86400000),
      authorId: museumCorrespondent.id,
      imageUrl: 'https://via.placeholder.com/800x400?text=Under+Review',
    },
  });

  const publishedNews1 = await prisma.news.create({
    data: {
      title: 'Yayında: Antik Şehir Keşfi',
      content: 'Araştırmacılar yeni bir antik şehir keşfettiler. Bu çok önemli bir arkeolojik buluntudur.',
      summary: 'Doğu Anadolu\'da antik yerleşim alanı bulundu',
      kategori: 'KAZIDAN_HABERLER',
      status: 'PUBLISHED',
      submittedAt: new Date(Date.now() - 172800000),
      publishedAt: new Date(Date.now() - 86400000),
      authorId: academicCorrespondent.id,
      imageUrl: 'https://via.placeholder.com/800x400?text=Published+News',
    },
  });

  const publishedNews2 = await prisma.news.create({
    data: {
      title: 'Yayında: Öğrenci Araştırması Başarıyla Tamamlandı',
      content: 'Üniversite öğrencileri yaptıkları araştırmaları tamamladılar ve bulgularını yayınladılar.',
      summary: 'Arkeoloji bölümü öğrencilerinin başarılı projesi',
      kategori: 'OKULDAN_HABERLER',
      status: 'PUBLISHED',
      submittedAt: new Date(Date.now() - 259200000),
      publishedAt: new Date(Date.now() - 172800000),
      authorId: student.id,
      imageUrl: 'https://via.placeholder.com/800x400?text=Student+News',
    },
  });

  console.log('✓ News items created');

  // Create approval records
  await prisma.newsApproval.create({
    data: {
      newsId: underReviewNews.id,
      editorId: editor.id,
      status: 'PENDING',
    },
  });

  console.log('✓ Approval records created');

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Harika bir araştırma! Tebrikler.',
      newsId: publishedNews1.id,
      authorId: student.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Bu buluntular arkeoloji tarihinde çok önemli bir yere sahip olacak.',
      newsId: publishedNews1.id,
      authorId: expertCorrespondent.id,
    },
  });

  console.log('✓ Comments created');

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('Test Accounts:');
  console.log('─'.repeat(50));
  console.log('Admin: admin@arkeojournal.com / Admin123!');
  console.log('Editor: editor@arkeojournal.com / Editor123!');
  console.log('Academic: academic@arkeojournal.com / Academic123!');
  console.log('Museum: museum@arkeojournal.com / Museum123!');
  console.log('Expert: expert@arkeojournal.com / Expert123!');
  console.log('Student: student@arkeojournal.com / Student123!');
  console.log('─'.repeat(50));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
