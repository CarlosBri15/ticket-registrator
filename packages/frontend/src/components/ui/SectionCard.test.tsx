import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionCard } from './SectionCard';

describe('SectionCard', () => {
  it('renders children inside a section element', () => {
    const { container } = render(
      <SectionCard>
        <p>Content</p>
      </SectionCard>,
    );
    expect(container.querySelector('section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    render(
      <SectionCard title="Información">
        <p>x</p>
      </SectionCard>,
    );
    expect(screen.getByText('Información')).toBeInTheDocument();
  });

  it('does not render the header row when title and action are absent', () => {
    const { container } = render(
      <SectionCard>
        <p>x</p>
      </SectionCard>,
    );
    // No flex header should exist (only the section + child)
    expect(container.querySelectorAll('.flex.items-center.justify-between')).toHaveLength(0);
  });

  it('renders the action element when provided', () => {
    render(
      <SectionCard title="Settings" action={<button>Edit</button>}>
        <p>x</p>
      </SectionCard>,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('omits internal padding when padded={false}', () => {
    const { container } = render(
      <SectionCard padded={false}>
        <p>x</p>
      </SectionCard>,
    );
    const section = container.querySelector('section');
    expect(section?.className).not.toMatch(/\bp-5\b/);
  });

  it('forwards extra className', () => {
    const { container } = render(
      <SectionCard className="my-custom">
        <p>x</p>
      </SectionCard>,
    );
    expect(container.querySelector('section')?.className).toMatch(/my-custom/);
  });
});
