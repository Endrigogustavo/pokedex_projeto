import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 76,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 10,
    backgroundColor: '#EBEBF0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    width: 50,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
});
