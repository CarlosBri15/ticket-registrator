const React = require('react');

const styled = (Component) => Component;

const useColorScheme = () => ({
  colorScheme: 'light',
  setColorScheme: jest.fn(),
  toggleColorScheme: jest.fn(),
});

const StyledComponent = ({ children }) => children;

module.exports = {
  styled,
  useColorScheme,
  StyledComponent,
  withExpoSnack: (Component) => Component,
};
