import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F8',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  appbar: {
    backgroundColor: 'transparent',
    width: '100%',
    elevation: 0,
    shadowOpacity: 0,
  },
  heroNumber: {
    fontSize: 14,
    fontWeight: '800',
    opacity: 0.85,
  },
  heroBallWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '2%',
  },
  heroBall: {},
  heroImage: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    maxWidth: 300,
    maxHeight: 300,
    resizeMode: 'contain',
  },
  heroName: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  typeBadge: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 24,
    paddingBottom: 40,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B1B1F',
    letterSpacing: -0.2,
  },
  totalPill: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
