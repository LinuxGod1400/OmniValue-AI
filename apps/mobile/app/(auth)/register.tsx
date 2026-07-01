import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth, ApiError } from '@/contexts/auth';

export default function RegisterScreen() {
  const colors = useColors();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirm) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim() || undefined);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>OmniValue AI</Text>
        <Text style={s.subtitle}>Create your account</Text>

        <TextInput style={s.input} placeholder="Display Name (optional)" placeholderTextColor={colors.textSecondary}
          value={displayName} onChangeText={setDisplayName} returnKeyType="next" />
        <TextInput style={s.input} placeholder="Email" placeholderTextColor={colors.textSecondary}
          value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" returnKeyType="next" />
        <TextInput style={s.input} placeholder="Password (min 8 characters)" placeholderTextColor={colors.textSecondary}
          value={password} onChangeText={setPassword} secureTextEntry returnKeyType="next" />
        <TextInput style={s.input} placeholder="Confirm Password" placeholderTextColor={colors.textSecondary}
          value={confirm} onChangeText={setConfirm} secureTextEntry returnKeyType="done" onSubmitEditing={handleRegister} />

        <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity><Text style={s.footerLink}>Sign In</Text></TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
    logo: { fontSize: 32, fontWeight: '700', color: c.primary, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: c.textSecondary, textAlign: 'center', marginBottom: 40 },
    input: {
      height: 52, borderRadius: 12, paddingHorizontal: 16,
      backgroundColor: c.surface, color: c.text, fontSize: 16,
      borderWidth: 1, borderColor: c.border, marginBottom: 14,
    },
    button: {
      height: 52, borderRadius: 12, backgroundColor: c.primary,
      alignItems: 'center', justifyContent: 'center', marginTop: 6,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { color: c.textSecondary, fontSize: 14 },
    footerLink: { color: c.primary, fontSize: 14, fontWeight: '600' },
  });
