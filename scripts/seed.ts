import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed başlatılıyor...');

  // Test admin user
  const adminPassword = await bcrypt.hash('johndoe123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Kazı Başkanı
  const kaziPassword = await bcrypt.hash('kazi123456', 12);
  const kaziBaskani = await prisma.user.upsert({
    where: { email: 'mehmet@arkeoloji.edu.tr' },
    update: {},
    create: {
      email: 'mehmet@arkeoloji.edu.tr',
      name: 'Prof. Dr. Mehmet Yılmaz',
      password: kaziPassword,
      role: 'KAZI_BASKANI',
    },
  });

  // Öğretim Görevlisi
  const ogretimPassword = await bcrypt.hash('ogretim123', 12);
  const ogretimGorevlisi = await prisma.user.upsert({
    where: { email: 'ayse@tarih.edu.tr' },
    update: {},
    create: {
      email: 'ayse@tarih.edu.tr',
      name: 'Doç. Dr. Ayşe Kaya',
      password: ogretimPassword,
      role: 'OGRETIM_GOREVLISI',
    },
  });

  // Müze Müdürü
  const muzePassword = await bcrypt.hash('muze123456', 12);
  const muzeMuduru = await prisma.user.upsert({
    where: { email: 'ali@kultur.gov.tr' },
    update: {},
    create: {
      email: 'ali@kultur.gov.tr',
      name: 'Ali Demir',
      password: muzePassword,
      role: 'MUZE_MUDURU',
    },
  });

  // Normal Kullanıcı
  const kullaniciPassword = await bcrypt.hash('ogrenci123', 12);
  const kullanici = await prisma.user.upsert({
    where: { email: 'zeynep@email.com' },
    update: {},
    create: {
      email: 'zeynep@email.com',
      name: 'Zeynep Öztürk',
      password: kullaniciPassword,
      role: 'KULLANICI',
    },
  });

  // Haberler
  const news1 = await prisma.news.upsert({
    where: { id: 'seed-news-1' },
    update: {},
    create: {
      id: 'seed-news-1',
      title: 'Göbekli Tepe\'de Yeni Kazı Sezonu Başladı',
      summary: 'Dünyanın en eski tapınağı olarak bilinen Göbekli Tepe\'de 2026 kazı sezonu başladı.',
      content: 'Dünyanın en eski tapınağı olarak bilinen Göbekli Tepe\'de 2026 kazı sezonu resmi olarak başladı. Bu yılki kazı çalışmaları, daha önce keşfedilmemiş bölgelere odaklanacak.\n\nKazı ekibi başkanı, bu sezonun önceki yıllara göre daha geniş bir alanda gerçekleştirileceğini belirtti. Yeni teknolojik araçlar ve jeoradar sistemleri kullanılarak yer altındaki yapıların haritası çıkarılacak.\n\nGöbekli Tepe, yaklaşık 12.000 yıl öncesine tarihlenen ve insanlık tarihinin bilinen en eski anıtsal yapısı olmasıyla büyük önem taşımaktadır.',
      kategori: 'KAZIDAN_HABERLER',
      imageUrl: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80',
      authorId: kaziBaskani.id,
    },
  });

  const news2 = await prisma.news.upsert({
    where: { id: 'seed-news-2' },
    update: {},
    create: {
      id: 'seed-news-2',
      title: 'İstanbul Üniversitesi Arkeoloji Bölümü Yeni Müfredatını Açıkladı',
      summary: 'Dijital arkeoloji ve 3D modèlleme dersleri müfredata eklendi.',
      content: 'İstanbul Üniversitesi Arkeoloji Bölümü, 2026-2027 eğitim öğretim yılı için yenilenen müfredatını açıkladı. Yeni müfredatta dijital arkeoloji, 3D modelleme ve uzaktan algılama dersleri yer alıyor.\n\nBölüm başkanı, modern arkeolojinin teknoloji ile iç içe olduğunu ve öğrencilerin bu alanda yetkin olması gerektiğini vurguladı. Ayrıca uluslararası değişim programlarının genişletileceği de duyuruldu.\n\nYeni müfredat, öğrencilere hem teorik hem de pratik beceriler kazandırmayı hedefliyor.',
      kategori: 'OKULDAN_HABERLER',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
      authorId: ogretimGorevlisi.id,
    },
  });

  const news3 = await prisma.news.upsert({
    where: { id: 'seed-news-3' },
    update: {},
    create: {
      id: 'seed-news-3',
      title: 'Ankara Anadolu Medeniyetleri Müzesi\'nde Yeni Sergi Açıldı',
      summary: 'Hitit dönemine ait eserler yeni sergi alanında ziyarete açıldı.',
      content: 'Ankara Anadolu Medeniyetleri Müzesi, Hitit dönemine ait yeni keşfedilen eserlerin sergilendiği özel bir sergi açtı. Sergi, Hitit İmparatorluğu\'nun günlük yaşamına ışık tutuyor.\n\nSergide yer alan 150\'den fazla eser, son yıllarda Hattusa ve Çorum bölgesinde yapılan kazılarda ortaya çıkarıldı. Eserler arasında çivi yazılı tabletler, seramik kapılar ve metal işçiliği örnekleri bulunuyor.\n\nSergi, yıl sonuna kadar ziyarete açık olacak.',
      kategori: 'MUZEDEN_HABERLER',
      imageUrl: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80',
      authorId: muzeMuduru.id,
    },
  });

  const news4 = await prisma.news.upsert({
    where: { id: 'seed-news-4' },
    update: {},
    create: {
      id: 'seed-news-4',
      title: 'Efes Antik Kenti\'nde Önemli Bir Mozaik Bulundu',
      summary: 'Roma dönemine ait 2000 yıllık mozaik kazı çalışmalarında ortaya çıktı.',
      content: 'Efes Antik Kenti\'nde devam eden kazı çalışmalarında Roma dönemine ait büyük bir zemin mozaiği ortaya çıkarıldı. Yaklaşık 50 metrekarelik mozaik, mitolojik sahneleri betimliyor.\n\nKazı ekibi, mozaiğin son derece iyi korunmuş durumda olduğunu ve bölgedeki yaşam hakkında önemli bilgiler sunduğunu belirtti. Mozaik, restorasyon çalışmalarının ardından ziyarete açılacak.\n\nBu keşif, Efes\'in Roma dönemindeki zenginliğini bir kez daha ortaya koyuyor.',
      kategori: 'KAZIDAN_HABERLER',
      imageUrl: 'https://i.ytimg.com/vi/QtHx__NkMnw/maxresdefault.jpg',
      authorId: kaziBaskani.id,
    },
  });

  const news5 = await prisma.news.upsert({
    where: { id: 'seed-news-5' },
    update: {},
    create: {
      id: 'seed-news-5',
      title: 'Arkeoloji Öğrencileri İçin Yaz Staj Programı Başvuruları Açıldı',
      summary: 'Kültür Bakanlığı destekli staj programına başvurular başladı.',
      content: 'Kültür ve Turizm Bakanlığı iş birliği ile düzenlenen Arkeoloji Yaz Staj Programı için başvurular açıldı. Program, tüm üniversitelerin arkeoloji bölümü öğrencilerine açıktır.\n\nStaj programı kapsamında öğrenciler, Türkiye\'nin önemli arkeolojik kazı alanlarında pratik deneyim kazanacak. Program, Haziran-Ağustos ayları arasında gerçekleştirilecek.\n\nBaşvuru süreci Nisan sonuna kadar devam edecek.',
      kategori: 'OKULDAN_HABERLER',
      imageUrl: 'https://memphis.studioabroad.com/_customtags/ct_Image.cfm?Image_ID=90563',
      authorId: ogretimGorevlisi.id,
    },
  });

  const news6 = await prisma.news.upsert({
    where: { id: 'seed-news-6' },
    update: {},
    create: {
      id: 'seed-news-6',
      title: 'Topkapı Sarayı Müzesi Dijital Arşivini Yayınladı',
      summary: 'Osmanlı dönemine ait binlerce eser dijital ortamda erişime açıldı.',
      content: 'Topkapı Sarayı Müzesi, koleksiyonundaki eserlerin dijital arşivini çevrimiçi olarak erişime açtı. Arşivde 10.000\'den fazla eserin yüksek çözünürlüklü fotoğrafları ve detaylı bilgileri yer alıyor.\n\nDijital arşiv, araştırmacılara ve tarih meraklılarına dünyanın her yerinden erişim imkanı sunuyor. Koleksiyon, Osmanlı minyatürleri, çini eserler ve el yazmaları gibi önemli parçaları içeriyor.',
      kategori: 'MUZEDEN_HABERLER',
      imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
      authorId: muzeMuduru.id,
    },
  });

  // Yorumlar
  await prisma.comment.upsert({
    where: { id: 'seed-comment-1' },
    update: {},
    create: {
      id: 'seed-comment-1',
      content: 'Harika bir haber! Göbekli Tepe her zaman büyüleyici keşifler sunuyor.',
      authorId: kullanici.id,
      newsId: news1.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-2' },
    update: {},
    create: {
      id: 'seed-comment-2',
      content: 'Yeni müfredat çok hıyeyecan verici görünüyor. Dijital arkeoloji geleceğin alanı.',
      authorId: kullanici.id,
      newsId: news2.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-3' },
    update: {},
    create: {
      id: 'seed-comment-3',
      content: 'Bu sergiyi mutlaka görmek istiyorum. Hitit eserleri çok etkileyici.',
      authorId: kullanici.id,
      newsId: news3.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-4' },
    update: {},
    create: {
      id: 'seed-comment-4',
      content: 'Efes her zaman sürprizlerle dolu. Mozaik keşfi çok önemli.',
      authorId: kaziBaskani.id,
      newsId: news4.id,
    },
  });

  console.log('Seed tamamlandı!');
}

main()
  .catch((e: any) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
