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
import { IconChevronDown, IconX, IconCheck } from '@tabler/icons-react-native';
import {
  PixelCard,
  DARK,
  CARD_BG,
  BORDER_WIDTH,
  RADIUS,
  colors,
} from './PixelCard';

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

  const selected = options.find(o => o.value === value);

  const handleOpen = () => { if (!disabled) setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  return (
    <View style={styles.wrapper}>
      {Boolean(label) && <Text style={styles.label}>{label}</Text>}

      {/* Trigger */}
      <View style={disabled ? styles.triggerDisabled : undefined}>
        <PixelCard
          bg={error ? '#fff8f8' : CARD_BG}
          shadowOffset={3}
          active={open}
          onPress={handleOpen}
        >
          <View style={styles.triggerContent}>
            <Text style={[styles.triggerText, !selected && styles.triggerPlaceholder]}>
              {selected ? selected.label : placeholder}
            </Text>
            <IconChevronDown size={18} color={disabled ? `${DARK}20` : DARK} />
          </View>
        </PixelCard>
      </View>

      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

      {/* ── Bottom sheet ── */}
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
          {/* Handle */}
          <View style={styles.handle} />

          {/* Sheet header */}
          {Boolean(label) && (
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <PixelCard
                bg={colors.danger}
                shadowOffset={3}
                radius={8}
                onPress={handleClose}
              >
                <View style={styles.sheetCloseInner}>
                  <IconX size={15} color="white" />
                </View>
              </PixelCard>
            </View>
          )}

          {/* Options */}
          <FlatList
            data={options}
            keyExtractor={item => item.value}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isSelected = item.value === value;
              const isLast = index === options.length - 1;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.75}
                  style={[styles.option, !isLast && styles.optionBorder]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBox}>
                      <IconCheck size={13} color="white" />
                    </View>
                  )}
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
    marginBottom: 20,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: `${DARK}55`,
    letterSpacing: 0.2,
    marginBottom: 8,
    marginLeft: 2,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    color: DARK,
  },
  triggerPlaceholder: {
    fontFamily: 'SpaceGrotesk-Medium',
    color: `${DARK}30`,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    color: colors.danger,
    marginTop: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },

  // ── Sheet ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.5,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 32,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  sheetTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: DARK,
    letterSpacing: 0.3,
  },
  sheetCloseInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  optionBorder: {
    borderBottomWidth: BORDER_WIDTH,
    borderBottomColor: `${DARK}10`,
  },
  optionText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 15,
    color: DARK,
  },
  optionTextSelected: {
    fontFamily: 'SpaceGrotesk-Bold',
    color: colors.brand,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS - 4,
    backgroundColor: colors.brand,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
