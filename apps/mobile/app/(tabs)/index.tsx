import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';

interface Item { id: string; name: string; category: string | null; estimatedValue: number | null; currency: string; createdAt: string }
interface ItemsResponse { data: Item[]; meta: { total: number } }

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['/api/v1/items'],
    queryFn: () => apiCall<{ data: Item[]; meta: { total: number } }>('/api/v1/items?pageSize=5'),
  });

  const items = data?.data ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalValue = items.reduce((sum, i) => sum + (i.estimatedValue ?? 0), 0);

  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={s.name}>{user?.displayName ?? user?.email?.split('@')[0] ?? 'there'} 👋</Text>
        </View>
        <TouchableOpacity style={s.scanButton} onPress={() => router.push('/(tabs)/camera')}>
          <Ionicons name="scan" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { marginRight: 8 }]}>
          <Text style={s.statValue}>{totalItems}</Text>
          <Text style={s.statLabel}>Items</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Text>
          <Text style={s.statLabel}>Est. Value</Text>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsRow}>
        {[
          { icon: 'camera-outline', label: 'Scan Item', onPress: () => router.push('/(tabs)/camera') },
          { icon: 'grid-outline', label: 'Inventory', onPress: () => router.push('/(tabs)/inventory') },
          { icon: 'add-circle-outline', label: 'Add Item', onPress: () => router.push('/(tabs)/inventory') },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={s.actionCard} onPress={a.onPress}>
            <Ionicons name={a.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.primary} />
            <Text style={s.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent items */}
      <Text style={s.sectionTitle}>Recent Items</Text>
      {items.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="cube-outline" size={44} color={colors.textSecondary} />
          <Text style={s.emptyText}>No items yet</Text>
          <Text style={s.emptySubtext}>Scan or add your first item</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={s.itemRow}>
            <View style={s.itemIcon}>
              <Ionicons name="cube" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.itemCategory}>{item.category ?? 'Uncategorized'}</Text>
            </View>
            {item.estimatedValue != null && (
              <Text style={s.itemValue}>${item.estimatedValue.toLocaleString()}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
    greeting: { fontSize: 14, color: c.textSecondary },
    name: { fontSize: 22, fontWeight: '700', color: c.text, marginTop: 2 },
    scanButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
    statValue: { fontSize: 24, fontWeight: '700', color: c.text },
    statLabel: { fontSize: 12, color: c.textSecondary, marginTop: 4 },
    sectionTitle: { fontSize: 17, fontWeight: '600', color: c.text, paddingHorizontal: 20, marginBottom: 12 },
    actionsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 28 },
    actionCard: { flex: 1, backgroundColor: c.surface, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: c.border },
    actionLabel: { fontSize: 11, color: c.text, fontWeight: '500', textAlign: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', color: c.text, marginTop: 12 },
    emptySubtext: { fontSize: 14, color: c.textSecondary, marginTop: 4 },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border },
    itemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    itemName: { fontSize: 15, fontWeight: '600', color: c.text },
    itemCategory: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    itemValue: { fontSize: 14, fontWeight: '600', color: c.success },
  });
