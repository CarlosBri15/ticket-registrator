import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { 
  IconSmartHome, 
  IconFileDescription, 
  IconCreditCard, 
  IconUser, 
  IconCircle 
} from '@tabler/icons-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DARK, CARD_BG, BORDER_WIDTH, colors } from './PixelCard';

const SHADOW = 3;

const TAB_ICONS: Record<string, any> = {
  home:    IconSmartHome,
  reports: IconFileDescription,
  tickets: IconCreditCard,
  profile: IconUser,
};

export function CustomTabBar({ state, descriptors, navigation }: Readonly<BottomTabBarProps>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label     = typeof options.title === 'string' ? options.title : route.name;
        const isFocused = state.index === index;
        const IconComponent = TAB_ICONS[route.name] ?? IconCircle;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        const onLongPress = () =>
          navigation.emit({ type: 'tabLongPress', target: route.key });

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={isFocused ? 0.85 : 0.55}
            style={s.tabSlot}
          >
            {isFocused ? (
              // ── Recreación manual del look PixelCard ──
              <View style={s.activeOuter}>
                <View style={s.activeShadow} />
                <View style={s.activeInner}>
                  <IconComponent size={19} color="white" />
                  <Text style={s.labelActive}>{label}</Text>
                </View>
              </View>
            ) : (
              <View style={s.inactive}>
                <IconComponent size={19} color={`${DARK}55`} />
                <Text style={s.labelInactive}>{label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderTopWidth: 4,
    borderTopColor: DARK,
    paddingTop: 10,
    paddingHorizontal: 8,
    gap: 6,
  },

  tabSlot: {
    flex: 1,
  },

  // ── Active: borde + shadow manual (mismo look que PixelCard)
  activeOuter: {
    paddingRight: SHADOW,
    paddingBottom: SHADOW,
  },
  activeShadow: {
    position: 'absolute',
    top: SHADOW,
    left: SHADOW,
    right: 0,
    bottom: 0,
    backgroundColor: DARK,
    borderRadius: 6,
  },
  activeInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: colors.brand,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    borderRadius: 6,
  },

  // ── Inactive: sin card, centrado verticalmente al mismo alto que el active
  inactive: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 13, // compensa el BORDER_WIDTH×2 + SHADOW del active
  },

  labelActive: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: 'white',
    letterSpacing: 0.3,
  },
  labelInactive: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: `${DARK}55`,
    letterSpacing: 0.3,
  },
});
