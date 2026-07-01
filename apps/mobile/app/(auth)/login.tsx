import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth, ApiError } from '@/contexts/auth';

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        <Text style={s.logo}>OmniValue AI</Text>
        <Text style={s.subtitle}>Sign in to your account</Text>

        <TextInput
          style={s.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={s.input}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={s.footerLink}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
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
