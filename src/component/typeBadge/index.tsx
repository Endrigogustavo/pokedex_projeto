import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { getTypeColor, capitalize, contrastText } from '@/utils/pokemon';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  type: string;
  size?: Size;
};

const SIZES: Record<Size, { px: number; py: number; fs: number; br: number }> = {
  sm: { px: 7,  py: 2, fs: 10, br: 6  },
  md: { px: 10, py: 4, fs: 12, br: 8  },
  lg: { px: 14, py: 6, fs: 14, br: 10 },
};

export default function TypeBadge({ type, size = 'md' }: Props) {
  const bg = getTypeColor(type);
  const fg = contrastText(bg);
  const s  = SIZES[size];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor:  bg,
          paddingHorizontal: s.px,
          paddingVertical:   s.py,
          borderRadius:      s.br,
        },
      ]}
    >
      <Text style={[styles.label, { color: fg, fontSize: s.fs }]}>
        {capitalize(type)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base:  { alignSelf: 'flex-start' },
  label: { fontWeight: '700', letterSpacing: 0.3 },
});
