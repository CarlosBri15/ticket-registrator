import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles/theme';

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
  placeholder = 'Seleccionar...',
  error,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Trigger */}
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
        style={[
          styles.trigger,
          error ? styles.triggerError : null,
          disabled ? styles.triggerDisabled : null,
        ]}
      >
        <Text style={[styles.triggerText, !selected && styles.triggerPlaceholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Feather
          name="chevron-down"
          size={16}
          color={disabled ? '#cbd5e1' : '#94a3b8'}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Bottom sheet modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Sheet header */}
          {label && (
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.sheetClose}>
                <Feather name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}

          {/* Options list */}
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
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    !isLast && styles.optionBorder,
                  ]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={15} color={colors.brand} />
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
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  triggerError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff8f8',
  },
  triggerDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.6,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  triggerPlaceholder: {
    color: '#94a3b8',
    fontWeight: '400',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  sheetClose: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionSelected: {
    backgroundColor: '#f0f6fd',
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.brand,
  },
});
