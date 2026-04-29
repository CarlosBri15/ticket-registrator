import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { ImageSidePanel } from './ImageSidePanel';

describe('ImageSidePanel', () => {
  it('renders the title', () => {
    render(<ImageSidePanel isLoading={false} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'ticketDetail.imageTitle' })).toBeInTheDocument();
  });

  it('renders the loading spinner when isLoading=true', () => {
    const { container } = render(<ImageSidePanel isLoading onClose={vi.fn()} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('renders the no-image empty state when imageUrl is missing', () => {
    render(<ImageSidePanel isLoading={false} onClose={vi.fn()} />);
    expect(screen.getByText('ticketDetail.noImage')).toBeInTheDocument();
  });

  it('renders the image and fullscreen link when imageUrl is provided', () => {
    render(
      <ImageSidePanel
        isLoading={false}
        onClose={vi.fn()}
        imageUrl="https://example.com/r.jpg"
      />,
    );
    const img = screen.getByAltText('Ticket') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/r.jpg');
    const link = screen.getByText('ticketDetail.fullscreen').closest('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://example.com/r.jpg');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });

  it('does not render the fullscreen link when there is no image', () => {
    render(<ImageSidePanel isLoading={false} onClose={vi.fn()} />);
    expect(screen.queryByText('ticketDetail.fullscreen')).not.toBeInTheDocument();
  });

  it('fires onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<ImageSidePanel isLoading={false} onClose={onClose} />);
    const closeBtn = container.querySelector('header button, button')!;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
