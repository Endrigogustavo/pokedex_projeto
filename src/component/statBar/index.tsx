import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatBarProps = {
  label?: string;
  value: number;
  max: number;
  color: string;
  valueText?: string;
};

export default function StatBar({
  label,
  value,
  max,
  color,
  valueText,
}: StatBarProps) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <View style={styles.row}>
      {label ? (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]}
        />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {valueText ?? value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  label: {
    width: 72,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  track: {
    flex: 1,
    minWidth: 0,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 8,
    backgroundColor: '#E6E6EE',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  value: {
    width: 56,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
});
