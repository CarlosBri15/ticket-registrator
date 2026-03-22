const React = require('react');
const { Text } = require('react-native');

// Generic icon component mock — renders the name as accessible text
const createIconMock = (family) => {
  const Icon = ({ name, size, color, ...rest }) =>
    React.createElement(Text, { ...rest, testID: `icon-${name}` }, name);
  Icon.displayName = family;
  return Icon;
};

const Feather = createIconMock('Feather');
const AntDesign = createIconMock('AntDesign');
const FontAwesome = createIconMock('FontAwesome');
const Ionicons = createIconMock('Ionicons');
const MaterialIcons = createIconMock('MaterialIcons');

module.exports = { Feather, AntDesign, FontAwesome, Ionicons, MaterialIcons };
module.exports.default = Feather;
