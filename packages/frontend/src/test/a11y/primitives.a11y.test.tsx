/**
 * Frente 5.3 — accessibility smoke tests for every kit UI primitive.
 *
 * Each `it` renders the component in a representative configuration and asserts
 * the rendered DOM has zero `axe-core` violations. The aim is regression
 * coverage, not exhaustive a11y QA — once a primitive passes here it is the
 * caller's responsibility not to regress its consumption (custom test cases
 * for variants/error-states should still live next to the component).
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { CategoryMixBar } from '../../components/ui/CategoryMixBar';
import { ChartSkeleton } from '../../components/ui/ChartSkeleton';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { SectionCard } from '../../components/ui/SectionCard';
import { Stat } from '../../components/ui/Stat';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TextArea } from '../../components/ui/TextArea';
import { Toggle } from '../../components/ui/Toggle';

// Wrap any helper that needs a router context.
const withRouter = (ui: React.ReactNode) => <MemoryRouter>{ui}</MemoryRouter>;

const expectNoA11yViolations = async (container: HTMLElement) => {
  // axe needs a real document to walk; jsdom fits that contract.
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

describe('a11y smoke — kit primitives', () => {
  it('Alert (error variant)', async () => {
    const { container } = render(
      <Alert variant="error" message="Something went wrong" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Alert (success variant with dismiss)', async () => {
    const { container } = render(
      <Alert variant="success" message="Saved" onDismiss={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });

  it('Button (primary)', async () => {
    const { container } = render(<Button variant="primary">Continue</Button>);
    await expectNoA11yViolations(container);
  });

  it('Button (icon-only with title)', async () => {
    const { container } = render(
      <Button variant="ghost-danger" size="icon" title="Eliminar">
        <span aria-hidden="true">×</span>
      </Button>,
    );
    await expectNoA11yViolations(container);
  });

  it('ChartSkeleton', async () => {
    const { container } = render(<ChartSkeleton height={200} />);
    await expectNoA11yViolations(container);
  });

  it('Chip', async () => {
    const { container } = render(<Chip>All</Chip>);
    await expectNoA11yViolations(container);
  });

  it('EmptyState', async () => {
    const { container } = render(
      <EmptyState
        icon={<span aria-hidden="true">·</span>}
        title="Sin resultados"
        description="Prueba a cambiar los filtros."
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('Input (with label)', async () => {
    const { container } = render(
      <Input label="Email" placeholder="me@example.com" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Input (with error)', async () => {
    const { container } = render(
      <Input label="Email" error="Invalid email" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Modal (open with title and content)', async () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        <p>Are you sure?</p>
      </Modal>,
    );
    await expectNoA11yViolations(container);
  });

  it('Pagination (multiple pages)', async () => {
    const { container } = render(
      <Pagination page={3} totalPages={10} totalItems={100} pageSize={10} onPageChange={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });

  it('SearchInput', async () => {
    const { container } = render(
      <SearchInput value="" onChange={() => {}} placeholder="Buscar" />,
    );
    await expectNoA11yViolations(container);
  });

  it('SectionCard (with title and content)', async () => {
    const { container } = render(
      <SectionCard title="Resumen">
        <p>Contenido</p>
      </SectionCard>,
    );
    await expectNoA11yViolations(container);
  });

  it('Stat (label + value)', async () => {
    const { container } = render(<Stat label="Total" value="1,234" />);
    await expectNoA11yViolations(container);
  });

  it('StatCard', async () => {
    const { container } = render(
      <StatCard
        title="Pendientes"
        value="12"
        icon={<span aria-hidden="true">·</span>}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('StatusBadge (approved)', async () => {
    const { container } = render(<StatusBadge status="APPROVED" />);
    await expectNoA11yViolations(container);
  });

  it('TextArea (with label and error)', async () => {
    const { container } = render(
      <TextArea label="Notas" error="Demasiado corto" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Toggle (off)', async () => {
    const { container } = render(
      <Toggle label="Activo" isOn={false} onChange={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });

  it('Toggle (on, loading)', async () => {
    const { container } = render(
      <Toggle label="Activo" isOn={true} onChange={() => {}} isLoading />,
    );
    await expectNoA11yViolations(container);
  });

  it('renders CategoryMixBar with multiple segments', async () => {
    const { container } = render(
      <CategoryMixBar
        segments={[
          { categoryId: 'a', categoryName: 'Meals', categoryColor: '#F5C842', categoryIcon: 'Utensils', amount: 60, percentage: 60 },
          { categoryId: 'b', categoryName: 'Lodging', categoryColor: '#8A5E89', categoryIcon: 'Hotel', amount: 40, percentage: 40 },
        ]}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('renders Modal inside a Router context cleanly', async () => {
    // Sanity check: Suspense / router-aware primitives still smoke-pass when
    // wrapped (proxy for header/sidebar consumers using <Link>).
    const { container } = render(
      withRouter(
        <Modal isOpen onClose={() => {}} title="Routed">
          <p>Body</p>
        </Modal>,
      ),
    );
    await expectNoA11yViolations(container);
  });
});
