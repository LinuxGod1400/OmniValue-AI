import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '@/constants/colors';

export function useColors(): ThemeColors {
  const scheme = useColorScheme() ?? 'dark';
  return Colors[scheme];
}
