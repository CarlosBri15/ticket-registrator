import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { PixelCard, DARK, CARD_BG } from '../ui/PixelCard';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface ScanningOverlayProps {
  visible: boolean;
}

export const ScanningOverlay = ({ visible }: ScanningOverlayProps) => {
  const { t } = useTranslation();

  const scanY = useSharedValue(0);
  const opac1 = useSharedValue(0.2);
  const opac2 = useSharedValue(0.2);
  const opac3 = useSharedValue(0.2);

  useEffect(() => {
    if (!visible) {
      cancelAnimation(scanY);
      cancelAnimation(opac1);
      cancelAnimation(opac2);
      cancelAnimation(opac3);
      scanY.value = 0;
      opac1.value = 0.2;
      opac2.value = 0.2;
      opac3.value = 0.2;
      return;
    }

    scanY.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    const blink = (val: SharedValue<number>, delay: number) => {
      val.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.2, { duration: 600 }),
          ),
          -1,
        ),
      );
    };

    blink(opac1, 0);
    blink(opac2, 200);
    blink(opac3, 400);
  }, [visible]);

  const scannerProps = useAnimatedProps(() => ({
    transform: [{ translateY: scanY.value }],
  }));
  const dot1Props = useAnimatedProps(() => ({ opacity: opac1.value }));
  const dot2Props = useAnimatedProps(() => ({ opacity: opac2.value }));
  const dot3Props = useAnimatedProps(() => ({ opacity: opac3.value }));

  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <PixelCard bg={CARD_BG} shadowOffset={6} style={s.card}>
        <View style={s.inner}>
          <Svg width={128} height={128} viewBox="0 0 32 32">
            <Path
              d="M8 4 h16 v19 l-2 -2 l-2 2 l-2 -2 l-2 2 l-2 -2 l-2 2 l-2 -2 l-2 2 z"
              fill="#f4f4f4"
              stroke={DARK}
              strokeWidth={1}
            />
            <Rect x={11} y={7} width={10} height={2} fill={DARK} />
            <Rect x={10} y={11} width={8} height={1} fill={DARK} />
            <Rect x={20} y={11} width={2} height={1} fill={DARK} />
            <Rect x={10} y={13} width={6} height={1} fill={DARK} />
            <Rect x={20} y={13} width={2} height={1} fill={DARK} />
            <Rect x={10} y={15} width={7} height={1} fill={DARK} />
            <Rect x={20} y={15} width={2} height={1} fill={DARK} />
            <Rect x={10} y={18} width={12} height={1} fill={DARK} />
            <Rect x={10} y={20} width={3} height={1} fill={DARK} />
            <Rect x={18} y={20} width={4} height={1} fill={DARK} />
            <AnimatedG animatedProps={scannerProps}>
              <Rect x={6} y={3} width={20} height={3} fill="rgba(57,255,20,0.35)" />
              <Rect x={6} y={4} width={20} height={1} fill="#39ff14" />
            </AnimatedG>
            <AnimatedRect animatedProps={dot1Props} x={13} y={28} width={1} height={1} fill={DARK} />
            <AnimatedRect animatedProps={dot2Props} x={15} y={28} width={1} height={1} fill={DARK} />
            <AnimatedRect animatedProps={dot3Props} x={17} y={28} width={1} height={1} fill={DARK} />
          </Svg>

          <Text style={s.title}>{t('reportDetail.scanTicket')}</Text>
          <Text style={s.subtitle}>Extrayendo información...</Text>
        </View>
      </PixelCard>
    </View>
  );
};

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    zIndex: 999,
  },
  card: { width: '100%', maxWidth: 280 },
  inner: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: DARK,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 12,
    color: `${DARK}60`,
  },
});
