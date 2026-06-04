import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

type PokeballProps = {
  size?: number;
  spinning?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Pokeball({
  size = 120,
  spinning = false,
  style,
}: PokeballProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spinning) return;

    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [spinning, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const band = Math.max(4, size * 0.1);
  const outer = size * 0.34;
  const inner = size * 0.18;

  return (
    <Animated.View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, size * 0.025),
        },
        spinning && { transform: [{ rotate }] },
        style,
      ]}
    >
      <Animated.View style={styles.topHalf} />
      <Animated.View style={styles.bottomHalf} />

      <Animated.View
        style={[
          styles.band,
          { height: band, top: size / 2 - band / 2 },
        ]}
      />

      <Animated.View
        style={[
          styles.centerOuter,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            top: size / 2 - outer / 2,
            left: size / 2 - outer / 2,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.centerInner,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            borderWidth: Math.max(2, inner * 0.18),
            top: size / 2 - inner / 2,
            left: size / 2 - inner / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ball: {
    overflow: 'hidden',
    borderColor: '#1a1a1a',
    backgroundColor: '#fff',
  },
  topHalf: {
    flex: 1,
    backgroundColor: '#ee1515',
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
  },
  centerOuter: {
    position: 'absolute',
    backgroundColor: '#1a1a1a',
  },
  centerInner: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderColor: '#1a1a1a',
  },
});
