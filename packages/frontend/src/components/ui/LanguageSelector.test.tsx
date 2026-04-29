import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';

const mockChangeLanguage = vi.fn();
let mockLanguage = 'es';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      get language() { return mockLanguage; },
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

vi.mock('lucide-react', () => ({
  Globe: () => <svg data-testid="globe-icon" />,
  ChevronDown: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-icon" className={className} />
  ),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguage = 'es';
  });

  it('renders the toggle button', () => {
    render(<LanguageSelector />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows current language abbreviation (lowercase DOM text)', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('es')).toBeInTheDocument();
  });

  it('dropdown is hidden initially', () => {
    render(<LanguageSelector />);
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });

  it('opens dropdown when toggle button is clicked', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('closes dropdown when toggle button is clicked again', () => {
    render(<LanguageSelector />);
    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });

  it('calls changeLanguage with "es" when Español is clicked', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Español'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
  });

  it('calls changeLanguage with "en" when English is clicked', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('closes dropdown after selecting a language', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('English'));
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Español')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });

  describe('when language is English', () => {
    it('shows "en" abbreviation', () => {
      mockLanguage = 'en';
      render(<LanguageSelector />);
      expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('renders English active styling in dropdown', () => {
      mockLanguage = 'en';
      render(<LanguageSelector />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
    });
  });
});
