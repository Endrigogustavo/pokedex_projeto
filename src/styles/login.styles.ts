import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#CC0000',
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bgTop: {
    position: 'absolute',
    top: -120,
    right: -110,
    opacity: 0.13,
  },
  bgBottom: {
    position: 'absolute',
    bottom: -70,
    left: -70,
    opacity: 0.10,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  heroTitle: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 16,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
  },
  cardTitle: {
    fontWeight: '800',
    color: '#1B1B1F',
  },
  cardSub: {
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 22,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  btn: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: '#CC0000',
  },
  btnContent: {
    height: 52,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  switchText: {
    color: '#6B7280',
  },
  switchLink: {
    fontWeight: '800',
    color: '#CC0000',
  },
  hint: {
    textAlign: 'center',
    marginTop: 2,
  },
});
