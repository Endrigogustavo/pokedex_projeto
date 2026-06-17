import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  scroll: {
    padding: 16,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1B1F',
    letterSpacing: -0.1,
  },
  badge: {
    backgroundColor: '#E7E0EC',
    height: 24,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 10,
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImg: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B1B1F',
    flex: 1,
    marginRight: 8,
  },
  number: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  emptyBag: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#F5F5F8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7E0EC',
  },
  resetBtn: {
    borderRadius: 14,
    borderColor: '#CC0000',
  },
});
