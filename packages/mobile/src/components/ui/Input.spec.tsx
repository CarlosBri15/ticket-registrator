import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from './Input';

describe('Input', () => {
  // ── Label ──────────────────────────────────────────────────────────────────

  it('renders label when provided', () => {
    const { getByText } = render(<Input label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('does not render a label when not provided', () => {
    const { queryByText } = render(<Input placeholder="Enter value" />);
    expect(queryByText('Email')).toBeNull();
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  it('renders error message when provided', () => {
    const { getByText } = render(<Input error="Campo obligatorio" />);
    expect(getByText('Campo obligatorio')).toBeTruthy();
  });

  it('does not render error message when not provided', () => {
    const { queryByText } = render(<Input label="Name" />);
    expect(queryByText('Campo obligatorio')).toBeNull();
  });

  it('renders both label and error simultaneously', () => {
    const { getByText } = render(<Input label="Email" error="Email inválido" />);
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Email inválido')).toBeTruthy();
  });

  // ── Interaction ────────────────────────────────────────────────────────────

  it('calls onChangeText with entered value', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Escribe aquí" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByPlaceholderText('Escribe aquí'), 'hola');
    expect(onChangeText).toHaveBeenCalledWith('hola');
  });

  it('displays provided value', () => {
    const { getByDisplayValue } = render(<Input value="valor inicial" onChangeText={jest.fn()} />);
    expect(getByDisplayValue('valor inicial')).toBeTruthy();
  });

  // ── displayName ────────────────────────────────────────────────────────────

  it('has displayName "Input"', () => {
    expect(Input.displayName).toBe('Input');
  });

  // ── Pass-through props ─────────────────────────────────────────────────────

  it('passes placeholder to TextInput', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Buscar..." />);
    expect(getByPlaceholderText('Buscar...')).toBeTruthy();
  });

  it('renders in password mode when secureTextEntry is set', () => {
    const { UNSAFE_getAllByType } = render(
      <Input secureTextEntry placeholder="Password" />,
    );
    const { TextInput } = require('react-native');
    const input = UNSAFE_getAllByType(TextInput)[0];
    expect(input.props.secureTextEntry).toBe(true);
  });
});
