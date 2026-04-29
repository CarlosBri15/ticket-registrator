import { getHierarchyLabel, getHierarchyColor } from './hierarchy';

describe('hierarchy utils', () => {
  describe('getHierarchyLabel', () => {
    it('should return SuperAdmin for 100', () => {
      expect(getHierarchyLabel(100)).toBe('SuperAdmin');
    });

    it('should return Admin for 99', () => {
      expect(getHierarchyLabel(99)).toBe('Admin');
    });

    it('should return Manager for 50', () => {
      expect(getHierarchyLabel(50)).toBe('Manager');
    });

    it('should return Controller for 40', () => {
      expect(getHierarchyLabel(40)).toBe('Controller');
    });

    it('should return Empleado for 0', () => {
      expect(getHierarchyLabel(0)).toBe('Empleado');
    });
  });

  describe('getHierarchyColor', () => {
    it('should return purple for 100+', () => {
      expect(getHierarchyColor(100)).toContain('purple');
    });

    it('should return brand for 99+', () => {
      expect(getHierarchyColor(99)).toContain('brand');
    });

    it('should return amber for 50+', () => {
      expect(getHierarchyColor(50)).toContain('amber');
    });

    it('should return blue for 40+', () => {
      expect(getHierarchyColor(40)).toContain('blue');
    });

    it('should return gray for 0+', () => {
      expect(getHierarchyColor(0)).toContain('gray');
    });
  });
});
