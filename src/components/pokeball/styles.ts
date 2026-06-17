import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
