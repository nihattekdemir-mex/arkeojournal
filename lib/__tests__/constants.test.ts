import { ROLE_LABELS, KATEGORI_LABELS, NEWS_STATUS_LABELS } from '@/lib/constants';

describe('Constants', () => {
  describe('ROLE_LABELS', () => {
    it('should contain all roles', () => {
      expect(ROLE_LABELS).toHaveProperty('ADMIN');
      expect(ROLE_LABELS).toHaveProperty('EDITOR');
      expect(ROLE_LABELS).toHaveProperty('CORRESPONDENT_ACADEMIC');
      expect(ROLE_LABELS).toHaveProperty('CORRESPONDENT_MUSEUM');
      expect(ROLE_LABELS).toHaveProperty('CORRESPONDENT_EXPERT');
      expect(ROLE_LABELS).toHaveProperty('STUDENT');
      expect(ROLE_LABELS).toHaveProperty('GUEST');
    });

    it('should return Turkish labels', () => {
      expect(ROLE_LABELS['ADMIN']).toBe('Yönetici');
      expect(ROLE_LABELS['EDITOR']).toBe('Editör');
    });
  });

  describe('KATEGORI_LABELS', () => {
    it('should contain all categories', () => {
      expect(KATEGORI_LABELS).toHaveProperty('KAZIDAN_HABERLER');
      expect(KATEGORI_LABELS).toHaveProperty('OKULDAN_HABERLER');
      expect(KATEGORI_LABELS).toHaveProperty('MUZEDEN_HABERLER');
    });

    it('should return Turkish labels', () => {
      expect(KATEGORI_LABELS['KAZIDAN_HABERLER']).toBe('Kazıdan Haberler');
    });
  });

  describe('NEWS_STATUS_LABELS', () => {
    it('should contain all statuses', () => {
      expect(NEWS_STATUS_LABELS).toHaveProperty('DRAFT');
      expect(NEWS_STATUS_LABELS).toHaveProperty('SUBMITTED');
      expect(NEWS_STATUS_LABELS).toHaveProperty('UNDER_REVIEW');
      expect(NEWS_STATUS_LABELS).toHaveProperty('APPROVED');
      expect(NEWS_STATUS_LABELS).toHaveProperty('REJECTED');
      expect(NEWS_STATUS_LABELS).toHaveProperty('PUBLISHED');
      expect(NEWS_STATUS_LABELS).toHaveProperty('ARCHIVED');
    });

    it('should return Turkish labels', () => {
      expect(NEWS_STATUS_LABELS['DRAFT']).toBe('Taslak');
      expect(NEWS_STATUS_LABELS['PUBLISHED']).toBe('Yayında');
    });
  });
});
