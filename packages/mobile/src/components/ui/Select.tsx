import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { ChevronDown, X, Check } from 'lucide-react-native';
import { colors } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Kit-aligned select trigger (`.select-trigger` + `.select-dropdown` /
 * mobile bottom sheet). White surface, stone-300 border, 6 px radius,
 * Manrope content; danger border when error is present.
 */
export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Seleccione',
  error,
  disabled = false,
}: Readonly<SelectProps>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const handleOpen = () => {
    if (!disabled) setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSelect = (next: string) => {
    onChange(next);
    handleClose();
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        activeOpacity={0.85}
        disabled={disabled}
        onPress={handleOpen}
        style={[
          styles.trigger,
          open && styles.triggerOpen,
          error ? styles.triggerError : null,
          disabled ? styles.triggerDisabled : null,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            !selected ? styles.triggerPlaceholder : null,
          ]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown
          size={16}
          color={disabled ? colors.fgQuaternary : colors.dark}
          strokeWidth={2}
        />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {label ? (
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="close"
                onPress={handleClose}
                style={styles.sheetClose}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.fgSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : null}

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isSelected = item.value === value;
              const isLast = index === options.length - 1;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                  style={[styles.option, !isLast && styles.optionBorder]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected ? (
                    <Check size={16} color={colors.brand} strokeWidth={2} />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgSecondary,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  triggerOpen: {
    borderColor: colors.fgTertiary,
  },
  triggerError: {
    borderColor: colors.danger,
  },
  triggerDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surfaceSunken,
  },
  triggerText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: colors.dark,
    flex: 1,
  },
  triggerPlaceholder: {
    color: colors.fgQuaternary,
  },
  errorText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.danger,
    marginTop: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayStrong,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.55,
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 9999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: colors.dark,
    letterSpacing: -0.2,
  },
  sheetClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: colors.dark,
  },
  optionTextSelected: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.brand,
  },
});
