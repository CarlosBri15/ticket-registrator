import React from 'react';
import { render } from '@testing-library/react-native';
import { CategoryIcon, resolveCategoryIcon } from './CategoryIcon';
import { Plane, Hotel, Tag } from 'lucide-react-native';

describe('resolveCategoryIcon', () => {
  it('returns the matching lucide component for a known name', () => {
    expect(resolveCategoryIcon('Plane')).toBe(Plane);
    expect(resolveCategoryIcon('Hotel')).toBe(Hotel);
  });

  it('returns Tag when the name is missing', () => {
    expect(resolveCategoryIcon(null)).toBe(Tag);
    expect(resolveCategoryIcon(undefined)).toBe(Tag);
    expect(resolveCategoryIcon('')).toBe(Tag);
  });

  it('returns Tag when the name is unknown', () => {
    expect(resolveCategoryIcon('Spaceship')).toBe(Tag);
  });
});

describe('<CategoryIcon />', () => {
  it('renders the resolved icon component', () => {
    const { UNSAFE_getByType } = render(<CategoryIcon iconName="Plane" />);
    expect(UNSAFE_getByType(Plane)).toBeTruthy();
  });

  it('returns null when hideWhenMissing is true and no name is supplied', () => {
    const { toJSON } = render(<CategoryIcon iconName={null} hideWhenMissing />);
    expect(toJSON()).toBeNull();
  });

  it('propagates a custom colour to the lucide component', () => {
    const { UNSAFE_getByType } = render(
      <CategoryIcon iconName="Hotel" color="#abcdef" />,
    );
    const node = UNSAFE_getByType(Hotel);
    expect(node.props.color).toBe('#abcdef');
  });
});
