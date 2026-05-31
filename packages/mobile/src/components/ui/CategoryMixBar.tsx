import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { IReportCategoryMix } from '@ticket-registrator/shared';
import { colors } from '../../constants/theme';
import { CategoryIcon } from './CategoryIcon';

interface CategoryMixBarProps {
  segments: IReportCategoryMix[] | undefined;
  /** Cap legend items shown inline; remaining count rendered as `+N`. */
  maxLegendItems?: number;
  /** Hide the legend (useful when the row already shows category info elsewhere). */
  hideLegend?: boolean;
}

/**
 * Mobile counterpart of the web kit `<CategoryMixBar>` primitive:
 * thin 4px stacked bar of category proportions + compact legend underneath.
 *
 * Each legend item renders the persisted category's lucide icon
 * (`categoryIcon`, resolved via `<CategoryIcon>`) tinted with the persisted
 * `categoryColor`. No icons or colours are hardcoded here — they all come
 * from the database via `buildCategoryMixFromItems`.
 */
export const CategoryMixBar = ({
  segments,
  maxLegendItems = 3,
  hideLegend = false,
}: CategoryMixBarProps) => {
  const { t } = useTranslation();

  if (!segments || segments.length === 0) return null;

  const visible = segments.slice(0, maxLegendItems);
  const overflow = segments.length - visible.length;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('reports.mixAria', { defaultValue: 'category mix' })}
    >
      <View style={styles.bar}>
        {segments.map((seg) => (
          <View
            key={seg.categoryId ?? `__uncat__${seg.categoryName}`}
            style={{
              width: `${seg.percentage}%` as unknown as number,
              backgroundColor: seg.categoryColor ?? colors.stone400,
              height: '100%',
            }}
          />
        ))}
      </View>

      {hideLegend ? null : (
        <View style={styles.legend}>
          {visible.map((seg, idx) => {
            const tint = seg.categoryColor ?? colors.fgSecondary;
            return (
              <View
                key={seg.categoryId ?? `__legend__${seg.categoryName}`}
                style={styles.legendItem}
              >
                {idx > 0 ? <Text style={styles.legendSep}>·</Text> : null}
                <CategoryIcon
                  iconName={seg.categoryIcon}
                  color={tint}
                  size={12}
                />
                <Text style={[styles.legendName, { color: tint }]} numberOfLines={1}>
                  {seg.categoryName}
                </Text>
                <Text style={styles.legendPct}>{seg.percentage}%</Text>
              </View>
            );
          })}
          {overflow > 0 ? (
            <Text style={styles.legendOverflow}>+{overflow}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  bar: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.overlayLight,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  legendSep: {
    color: colors.fgQuaternary,
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
  },
  legendName: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    flexShrink: 1,
  },
  legendPct: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgTertiary,
  },
  legendOverflow: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgTertiary,
  },
});
