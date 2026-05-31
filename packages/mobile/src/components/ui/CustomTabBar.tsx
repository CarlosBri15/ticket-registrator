import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Home,
  FileText,
  CreditCard,
  User,
  Circle,
  type LucideIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

const TAB_ICONS: Record<string, LucideIcon> = {
  home:    Home,
  reports: FileText,
  tickets: CreditCard,
  profile: User,
};

/**
 * Tab bar — mirrors the web kit sidebar (`.sb` family): dark grafito
 * surface, white labels with opacity, accent dot under the focused icon.
 */
export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: Readonly<BottomTabBarProps>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.title === 'string' ? options.title : route.name;
        const isFocused = state.index === index;
        const Icon = TAB_ICONS[route.name] ?? Circle;

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

        const iconColor = isFocused ? colors.fgOnBrand : colors.fgOnSidebarTertiary;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={styles.tabSlot}
          >
            <View style={styles.tabInner}>
              <Icon size={20} color={iconColor} strokeWidth={2} />
              <Text style={isFocused ? styles.labelActive : styles.labelInactive}>
                {label}
              </Text>
              {isFocused ? <View style={styles.activeDot} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.brand,
    borderTopWidth: 1,
    borderTopColor: colors.overlaySidebar,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabSlot: {
    flex: 1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    position: 'relative',
  },
  labelActive: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgOnBrand,
  },
  labelInactive: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgOnSidebarSecondary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 9999,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
});
