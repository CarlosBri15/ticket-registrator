import { getAvatarColor, getInitials } from './avatarColor';

describe('avatarColor utils', () => {
  describe('getAvatarColor', () => {
    it('should return a color hex string', () => {
      const color = getAvatarColor('John Doe');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should return the same color for the same name', () => {
      expect(getAvatarColor('Carlos')).toBe(getAvatarColor('Carlos'));
    });

    it('should return default color for empty name', () => {
      const color = getAvatarColor('');
      expect(color).toBeDefined();
    });
  });

  describe('getInitials', () => {
    it('should extract initials from single word', () => {
      expect(getInitials('Carlos')).toBe('C');
    });

    it('should extract initials from multiple words', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should be capped by maxLength', () => {
      expect(getInitials('A B C D', 2)).toBe('AB');
    });

    it('should return ? for empty name', () => {
      expect(getInitials('')).toBe('?');
    });

    it('should handle multiple spaces', () => {
      expect(getInitials(' John   Doe ')).toBe('JD');
    });
  });
});
