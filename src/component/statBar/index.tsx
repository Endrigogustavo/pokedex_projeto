import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  label?: string;
  value: number;
  max: number;
  color: string;
  valueText?: string;
};

export default function StatBar({ label, value, max, color, valueText }: Props) {
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
          style={[
            styles.fill,
            { width: `${ratio * 100}%` as any, backgroundColor: color },
          ]}
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
    marginBottom: 10,
  },
  label: {
    width: 76,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 10,
    backgroundColor: '#EBEBF0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    width: 50,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
});
