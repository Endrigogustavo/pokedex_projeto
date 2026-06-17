import React from 'react';
import { View, Text } from 'react-native';

import { styles } from './styles';

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
