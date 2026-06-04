import { MD3LightTheme } from 'react-native-paper';

/**
 * Tema Material Design 3 com a identidade da Pokédex
 * (vermelho como cor primária e amarelo como secundária).
 */
export const paperTheme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D32F2F',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFDAD5',
    onPrimaryContainer: '#410001',
    secondary: '#F9A825',
    onSecondary: '#1A1300',
    secondaryContainer: '#FFE08C',
    onSecondaryContainer: '#241A00',
    tertiary: '#1565C0',
    onTertiary: '#FFFFFF',
    background: '#F3F4F8',
    onBackground: '#1B1B1F',
    surface: '#FFFFFF',
    onSurface: '#1B1B1F',
    surfaceVariant: '#ECEAF1',
    onSurfaceVariant: '#49454F',
    outline: '#CAC4D0',
    outlineVariant: '#E3E1E8',
    error: '#BA1A1A',
  },
};

export type AppTheme = typeof paperTheme;
