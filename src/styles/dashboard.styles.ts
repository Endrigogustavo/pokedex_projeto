import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderBrand: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 24,
  },
  loaderText: {
    color: 'rgba(255,255,255,0.85)',
  },
  appbar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  appbarTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7E0EC',
  },
});
