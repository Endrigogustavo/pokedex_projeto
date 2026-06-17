import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  watermark: {
    position: 'absolute',
    bottom: -14,
    right: -10,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  body: {
    padding: 10,
    alignItems: 'center',
  },
  number: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.75,
    marginBottom: 2,
  },
  image: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginVertical: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  chip: {
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
