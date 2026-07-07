const PROFANITY_LIST: string[] = [
  'aptal', 'salak', 'gerizekalı', 'mal', 'dangalak', 'ahmak',
  'hıyar', 'ezik', 'aşağılık', 'pislik', 'şerefsiz', 'namussuz',
  'alçak', 'kaltak', 'orospu', 'piç', 'siktir', 'amk', 'bok',
  'siktirgit', 'yavşak', 'götveren', 'ibne', 'pezevenk', 'kahpe',
  'gavat', 'haysiyetsiz', 'rezil', 'kepaze', 'adi', 'sefil',
  'puşt', 'kevaşe', 'kodumun', 'lanet', 'manyak', 'deli',
];

export function containsProfanity(text: string): boolean {
  const lowerText = (text ?? '').toLowerCase().replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, '');
  return PROFANITY_LIST.some((word: string) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function getProfanityMessage(): string {
  return 'Yorumunuz uygunsuz içerik barındırmaktadır. Lütfen daha uygun bir dil kullanınız.';
}
