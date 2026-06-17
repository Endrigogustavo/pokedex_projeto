import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  appbar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  appbarTitle: {
    fontWeight: '900',
  },
  progressSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E0EC',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#49454F',
  },
  progressDone: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E7E0EC',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(245,245,248,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7E0EC',
  },
  confirmBtn: {
    borderRadius: 16,
  },
  confirmContent: {
    height: 52,
  },
  confirmLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
