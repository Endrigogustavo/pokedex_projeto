import { MD3LightTheme } from 'react-native-paper';

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary:             '#CC0000',
    onPrimary:           '#FFFFFF',
    primaryContainer:    '#FFDAD5',
    onPrimaryContainer:  '#410001',
    secondary:           '#F59E0B',
    onSecondary:         '#1A1300',
    secondaryContainer:  '#FEF3C7',
    onSecondaryContainer:'#241A00',
    tertiary:            '#1565C0',
    onTertiary:          '#FFFFFF',
    tertiaryContainer:   '#DBEAFE',
    onTertiaryContainer: '#001942',
    background:          '#F5F5F8',
    onBackground:        '#1B1B1F',
    surface:             '#FFFFFF',
    onSurface:           '#1B1B1F',
    surfaceVariant:      '#F0EEFA',
    onSurfaceVariant:    '#49454F',
    outline:             '#CAC4D0',
    outlineVariant:      '#E7E0EC',
    error:               '#BA1A1A',
    onError:             '#FFFFFF',
  },
};

export type AppTheme = typeof paperTheme;
