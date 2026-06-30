import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>OmniValue AI</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Foundation ready — start building features
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
