import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
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
  const spin   = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spinning) return;

    const rotate = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    rotate.start();
    wobble.start();
    return () => {
      rotate.stop();
      wobble.stop();
    };
  }, [spinning, spin, bounce]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 0.12],
  });

  // proporções
  const band   = Math.max(4, size * 0.085);
  const outer  = size * 0.32;
  const inner  = size * 0.16;
  const border = Math.max(2, size * 0.03);

  return (
    <Animated.View
      style={[
        spinning && { transform: [{ translateY }] },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.ball,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: border,
          },
          spinning && { transform: [{ rotate }] },
        ]}
      >
        {/* metades */}
        <View style={styles.topHalf} />
        <View style={styles.bottomHalf} />

        {/* brilho */}
        <View
          style={[
            styles.gloss,
            {
              width: size * 0.32,
              height: size * 0.18,
              borderRadius: size * 0.16,
              top: size * 0.13,
              left: size * 0.16,
            },
          ]}
        />

        {/* faixa central */}
        <View style={[styles.band, { height: band, top: size / 2 - band / 2 }]} />

        {/* botão central */}
        <View
          style={[
            styles.centerOuter,
            {
              width: outer,
              height: outer,
              borderRadius: outer / 2,
              borderWidth: border,
              top: size / 2 - outer / 2,
              left: size / 2 - outer / 2,
            },
          ]}
        />
        <View
          style={[
            styles.centerInner,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              borderWidth: Math.max(1.5, inner * 0.14),
              top: size / 2 - inner / 2,
              left: size / 2 - inner / 2,
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ball: {
    overflow: 'hidden',
    borderColor: '#1A1A1A',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  topHalf: {
    flex: 1,
    backgroundColor: '#EE1515',
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  gloss: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ rotate: '-20deg' }],
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
  },
  centerOuter: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderColor: '#1A1A1A',
  },
  centerInner: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderColor: '#7A7A7A',
  },
});
