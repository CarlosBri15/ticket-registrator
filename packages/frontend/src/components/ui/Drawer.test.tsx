import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Drawer isOpen={false} onClose={() => {}}>
        <p>content</p>
      </Drawer>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders children when open', () => {
    render(
      <Drawer isOpen onClose={() => {}}>
        <p>hello</p>
      </Drawer>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Drawer isOpen onClose={onClose}>
        <p>x</p>
      </Drawer>,
    );
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Drawer isOpen onClose={onClose}>
        <p>x</p>
      </Drawer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the leftSidePanel when provided', () => {
    render(
      <Drawer
        isOpen
        onClose={() => {}}
        leftSidePanel={<div data-testid="left">side</div>}
      >
        <p>x</p>
      </Drawer>,
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
  });
});
