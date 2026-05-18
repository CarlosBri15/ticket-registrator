import React from 'react';
import { render } from '@testing-library/react-native';
import { CategoryMixBar } from './CategoryMixBar';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _key,
  }),
}));

const segments = [
  { categoryId: 'c1', categoryName: 'Comida',     categoryColor: '#B66B4A', categoryIcon: null, percentage: 50, amount: 50 },
  { categoryId: 'c2', categoryName: 'Transporte', categoryColor: '#5E81A8', categoryIcon: null, percentage: 30, amount: 30 },
  { categoryId: 'c3', categoryName: 'Hotel',      categoryColor: '#5C8A6E', categoryIcon: null, percentage: 20, amount: 20 },
];

describe('CategoryMixBar', () => {
  it('renders nothing when segments is undefined', () => {
    const { toJSON } = render(<CategoryMixBar segments={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when segments is empty', () => {
    const { toJSON } = render(<CategoryMixBar segments={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders the visible category names and percentages', () => {
    const { getByText } = render(<CategoryMixBar segments={segments} />);
    expect(getByText('Comida')).toBeTruthy();
    expect(getByText('Transporte')).toBeTruthy();
    expect(getByText('Hotel')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('30%')).toBeTruthy();
    expect(getByText('20%')).toBeTruthy();
  });

  it('caps legend at maxLegendItems and renders overflow indicator', () => {
    const many = [
      ...segments,
      { categoryId: 'c4', categoryName: 'Otros', categoryColor: null, categoryIcon: null, percentage: 10, amount: 10 },
      { categoryId: 'c5', categoryName: 'Misc',  categoryColor: null, categoryIcon: null, percentage: 5,  amount: 5 },
    ];
    const { getByText, queryByText } = render(
      <CategoryMixBar segments={many} maxLegendItems={3} />,
    );
    expect(getByText('Comida')).toBeTruthy();
    expect(getByText('+2')).toBeTruthy();
    expect(queryByText('Otros')).toBeNull();
    expect(queryByText('Misc')).toBeNull();
  });

  it('hides the legend when hideLegend is true', () => {
    const { queryByText } = render(
      <CategoryMixBar segments={segments} hideLegend />,
    );
    expect(queryByText('Comida')).toBeNull();
    expect(queryByText('50%')).toBeNull();
  });
});
