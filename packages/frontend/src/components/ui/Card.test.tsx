import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardSection } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello card</Card>);
    expect(screen.getByText('Hello card')).toBeInTheDocument();
  });

  it('applies hover classes when hover=true', () => {
    const { container } = render(<Card hover>Hello</Card>);
    // cardHover token contains 'hover:shadow-md'
    expect(container.firstChild).toHaveClass('hover:shadow-md');
  });

  it('does not apply hover classes by default', () => {
    const { container } = render(<Card>Hello</Card>);
    expect(container.firstChild).not.toHaveClass('hover:shadow-md');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="my-custom-class">Hello</Card>);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('passes extra props to the div', () => {
    render(<Card data-testid="card-test">Hello</Card>);
    expect(screen.getByTestId('card-test')).toBeInTheDocument();
  });

  it('renders with hover=false explicitly', () => {
    const { container } = render(<Card hover={false}>Hello</Card>);
    expect(container.firstChild).not.toHaveClass('hover:shadow-md');
  });
});

describe('CardSection', () => {
  it('renders children', () => {
    render(<CardSection>Section body</CardSection>);
    expect(screen.getByText('Section body')).toBeInTheDocument();
  });

  it('renders h3 with title when title is provided', () => {
    render(<CardSection title="My Section">content</CardSection>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('My Section');
  });

  it('does not render h3 when title is absent', () => {
    const { container } = render(<CardSection>content</CardSection>);
    expect(container.querySelector('h3')).not.toBeInTheDocument();
  });

  it('renders icon inside header when title and icon are both provided', () => {
    render(
      <CardSection title="Title" icon={<span data-testid="my-icon">★</span>}>
        content
      </CardSection>,
    );
    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
  });

  it('does not render icon wrapper when no title is provided', () => {
    render(
      <CardSection icon={<span data-testid="orphan-icon">★</span>}>
        content
      </CardSection>,
    );
    expect(screen.queryByTestId('orphan-icon')).not.toBeInTheDocument();
  });

  it('renders action node when title and action are provided', () => {
    render(
      <CardSection title="Title" action={<button>Action</button>}>
        content
      </CardSection>,
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('does not render action wrapper when no title is provided', () => {
    render(
      <CardSection action={<button>Ghost</button>}>
        content
      </CardSection>,
    );
    expect(screen.queryByRole('button', { name: 'Ghost' })).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardSection className="custom-section">content</CardSection>);
    expect(container.firstChild).toHaveClass('custom-section');
  });

  it('passes extra props to the div', () => {
    render(<CardSection data-testid="section-test">content</CardSection>);
    expect(screen.getByTestId('section-test')).toBeInTheDocument();
  });
});
