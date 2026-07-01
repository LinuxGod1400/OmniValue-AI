import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  RefreshControl, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { apiCall } from '@/lib/api';

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  estimatedValue: number | null;
  currency: string;
  createdAt: string;
}

interface CreateItemForm { name: string; category: string; estimatedValue: string; description: string }

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateItemForm>({ name: '', category: '', estimatedValue: '', description: '' });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/v1/items', search],
    queryFn: () => apiCall<{ data: Item[]; meta: { total: number } }>(`/api/v1/items?search=${encodeURIComponent(search)}&pageSize=50`),
  });

  const createMutation = useMutation({
    mutationFn: (body: object) => apiCall('/api/v1/items', { method: 'POST', body }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['/api/v1/items'] });
      setShowModal(false);
      setForm({ name: '', category: '', estimatedValue: '', description: '' });
    },
    onError: () => Alert.alert('Error', 'Could not create item.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiCall(`/api/v1/items/${id}`, { method: 'DELETE' }),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['/api/v1/items'] }),
    onError: () => Alert.alert('Error', 'Could not delete item.'),
  });

  const handleCreate = () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required.'); return; }
    createMutation.mutate({
      name: form.name.trim(),
      category: form.category.trim() || undefined,
      estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : undefined,
      description: form.description.trim() || undefined,
    });
  };

  const handleDelete = (item: Item) => {
    Alert.alert('Delete Item', `Remove "${item.name}" from inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
    ]);
  };

  const items = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Inventory</Text>
          <Text style={s.count}>{total} items</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search items…" placeholderTextColor={colors.textSecondary}
          value={search} onChangeText={setSearch} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textSecondary} /></TouchableOpacity> : null}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
              <Text style={s.emptyText}>{search ? 'No matching items' : 'No items yet'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.itemCard}>
              <View style={s.itemIconBox}>
                <Ionicons name="cube" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.itemMeta}>{item.category ?? 'No category'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {item.estimatedValue != null && (
                  <Text style={s.itemValue}>${item.estimatedValue.toLocaleString()}</Text>
                )}
                <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginTop: 4 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Item Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modal, { paddingTop: insets.top + 16 }]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {(['name', 'category', 'estimatedValue', 'description'] as const).map((field) => (
            <TextInput
              key={field}
              style={s.input}
              placeholder={field === 'estimatedValue' ? 'Estimated value (USD)' : field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor={colors.textSecondary}
              value={form[field]}
              onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
              keyboardType={field === 'estimatedValue' ? 'decimal-pad' : 'default'}
            />
          ))}
          <TouchableOpacity style={[s.saveBtn, createMutation.isPending && s.disabled]} onPress={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Item</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 26, fontWeight: '700', color: c.text },
    count: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: c.border },
    searchInput: { flex: 1, color: c.text, fontSize: 15 },
    itemCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    itemIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    itemName: { fontSize: 15, fontWeight: '600', color: c.text },
    itemMeta: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    itemValue: { fontSize: 14, fontWeight: '600', color: c.success },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: c.textSecondary, fontSize: 16 },
    modal: { flex: 1, backgroundColor: c.background, paddingHorizontal: 20 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '700', color: c.text },
    input: { height: 52, borderRadius: 12, paddingHorizontal: 16, backgroundColor: c.surface, color: c.text, fontSize: 16, borderWidth: 1, borderColor: c.border, marginBottom: 14 },
    saveBtn: { height: 52, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    disabled: { opacity: 0.6 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
