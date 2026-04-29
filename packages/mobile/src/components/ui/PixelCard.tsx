import React, { useRef, useEffect } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { colors, UI } from '../../constants/theme';

export { colors, UI } from '../../constants/theme';
export const SCREEN_BG    = colors.surface;
export const DARK         = colors.dark;
export const SHADOW       = colors.shadow;
export const CARD_BG      = colors.white;
export const RADIUS       = UI.RADIUS;
export const BORDER_WIDTH = UI.BORDER_WIDTH;

export { SHADOW_HARD } from '../../constants/theme';

interface PixelCardProps {
  children: React.ReactNode;
  bg?: string;
  shadowOffset?: number;
  style?: any;
  onPress?: () => void;
  radius?: number;
  /** Mantiene la card en estado "presionado" visualmente (sin sombra, desplazada). */
  active?: boolean;
}

/**
 * PixelCard — Neobrutalist card with animated press:
 *   - shadow fades out
 *   - content translates toward the shadow position
 *   - container padding stays fixed → no layout shift in siblings
 */
export const PixelCard = ({
  children,
  bg = CARD_BG,
  shadowOffset = UI.SHADOW_OFFSET,
  radius = RADIUS,
  style,
  onPress,
  active = false,
}: PixelCardProps) => {
  const press = useRef(new Animated.Value(active ? 1 : 0)).current;

  // Ref siempre actualizada en cada render — sin closures viejas
  const activeRef = useRef(active);
  activeRef.current = active;

  // Sincroniza el estado "activo" externo con la animación
  useEffect(() => {
    Animated.timing(press, {
      toValue: active ? 1 : 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [active, press]);

  const onPressIn = () =>
    Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: true }).start();

  const onPressOut = () => {
    // Doble rAF: en RN el orden es onPressIn→onPressOut→onPress,
    // así que necesitamos esperar dos frames para que onPress haya
    // disparado setState y React haya re-renderizado con activeRef actualizado.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!activeRef.current) {
          Animated.timing(press, { toValue: 0, duration: 140, useNativeDriver: true }).start();
        }
      });
    });
  };

  const shadowOpacity = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const translate     = press.interpolate({ inputRange: [0, 1], outputRange: [0, shadowOffset] });

  const containerStyle = [
    { paddingRight: shadowOffset, paddingBottom: shadowOffset },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={containerStyle}
      >
        {/* Hard shadow layer — fades out on press */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: shadowOffset,
            left: shadowOffset,
            right: 0,
            bottom: 0,
            backgroundColor: SHADOW,
            borderRadius: radius,
            opacity: shadowOpacity,
          }}
        />
        {/* Border + content layer — slides toward shadow on press */}
        <Animated.View
          style={{
            backgroundColor: SHADOW,
            borderRadius: radius,
            overflow: 'hidden',
            transform: [{ translateX: translate }, { translateY: translate }],
          }}
        >
          <View
            style={{
              backgroundColor: bg,
              margin: BORDER_WIDTH,
              borderRadius: Math.max(0, radius - 2),
              overflow: 'hidden',
            }}
          >
            {children}
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  // Static (non-interactive) version — animated only via `active` prop
  return (
    <View style={containerStyle}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: shadowOffset,
          left: shadowOffset,
          right: 0,
          bottom: 0,
          backgroundColor: SHADOW,
          borderRadius: radius,
          opacity: shadowOpacity,
        }}
      />
      <Animated.View
        style={{
          backgroundColor: SHADOW,
          borderRadius: radius,
          overflow: 'hidden',
          transform: [{ translateX: translate }, { translateY: translate }],
        }}
      >
        <View
          style={{
            backgroundColor: bg,
            margin: BORDER_WIDTH,
            borderRadius: Math.max(0, radius - 2),
            overflow: 'hidden',
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};
