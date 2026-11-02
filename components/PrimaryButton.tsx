import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { themed } from '../theme/ThemeContext';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  style,
}: Props) {
  const styles = useStyles();
  const off = disabled || loading;
  const outline = variant === 'outline';

  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        outline ? styles.outline : styles.solid,
        off && (outline ? styles.outlineOff : styles.solidOff),
        pressed && !off && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.green : colors.onGreen} />
      ) : (
        <Text
          style={[
            styles.label,
            outline ? styles.outlineLabel : styles.solidLabel,
            off && styles.labelOff,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = themed((colors) =>
  StyleSheet.create({
  btn: { height: 54, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  solid: { backgroundColor: colors.green },
  outline: { borderWidth: 1, borderColor: colors.green },
  solidOff: { backgroundColor: colors.divider },
  outlineOff: { borderColor: colors.divider },
  pressed: { opacity: 0.75 },
  label: { fontSize: 16.5, fontWeight: '600' },
  solidLabel: { color: colors.onGreen },
  outlineLabel: { color: colors.green },
  labelOff: { color: colors.textFaint },
}));
