import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/auth';
import { apiCall } from '@/lib/api';

interface Profile { id: string; displayName: string | null; bio: string | null; email: string }

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/v1/profile'],
    queryFn: () => apiCall<Profile>('/api/v1/profile'),
    onSuccess: (d: Profile) => {
      setDisplayName(d.displayName ?? '');
      setBio(d.bio ?? '');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: object) => apiCall('/api/v1/profile', { method: 'PUT', body }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['/api/v1/profile'] });
      setEditing(false);
    },
    onError: () => Alert.alert('Error', 'Could not update profile.'),
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <Text style={s.title}>Settings</Text>

      {/* Profile section */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Profile</Text>
          {!editing && (
            <TouchableOpacity onPress={() => { setDisplayName(profile?.displayName ?? ''); setBio(profile?.bio ?? ''); setEditing(true); }}>
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : editing ? (
          <>
            <TextInput style={s.input} placeholder="Display Name" placeholderTextColor={colors.textSecondary}
              value={displayName} onChangeText={setDisplayName} />
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Bio"
              placeholderTextColor={colors.textSecondary} value={bio} onChangeText={setBio} multiline />
            <View style={s.editActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, updateMutation.isPending && s.disabled]}
                onPress={() => updateMutation.mutate({ displayName: displayName.trim() || undefined, bio: bio.trim() || undefined })}
                disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={s.profileRow}>
              <View style={s.avatar}><Text style={s.avatarText}>{(profile?.displayName ?? user?.email ?? '?')[0]?.toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileName}>{profile?.displayName ?? 'No name set'}</Text>
                <Text style={s.profileEmail}>{user?.email}</Text>
              </View>
            </View>
            {profile?.bio ? <Text style={s.bioText}>{profile.bio}</Text> : null}
          </>
        )}
      </View>

      {/* App info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>App Info</Text>
        {[
          { label: 'Version', value: '1.0.0 (Sprint 1)' },
          { label: 'Environment', value: process.env['EXPO_PUBLIC_APP_ENV'] ?? 'development' },
        ].map((row) => (
          <View key={row.label} style={s.infoRow}>
            <Text style={s.infoLabel}>{row.label}</Text>
            <Text style={s.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    title: { fontSize: 26, fontWeight: '700', color: c.text, paddingHorizontal: 20, marginBottom: 24 },
    section: { marginHorizontal: 20, marginBottom: 20, backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    profileName: { fontSize: 16, fontWeight: '600', color: c.text },
    profileEmail: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
    bioText: { fontSize: 14, color: c.textSecondary, marginTop: 12, lineHeight: 20 },
    input: { height: 48, borderRadius: 10, paddingHorizontal: 14, backgroundColor: c.background, color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border, marginBottom: 10 },
    editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
    cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    cancelText: { color: c.text, fontWeight: '600' },
    saveBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.6 },
    saveBtnText: { color: '#fff', fontWeight: '600' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
    infoLabel: { color: c.text, fontSize: 15 },
    infoValue: { color: c.textSecondary, fontSize: 15 },
    logoutBtn: { marginHorizontal: 20, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: c.error + '60', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    logoutText: { color: c.error, fontSize: 16, fontWeight: '600' },
  });
