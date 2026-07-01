import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { apiCall } from '@/lib/api';
import { queryClient } from '@/lib/query-client';

interface AnalysisResult {
  name: string;
  category: string;
  description: string;
  estimatedValue: number | null;
  currency: string;
  condition: string;
  tags: string[];
}

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Image picking is not supported on web.');
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setAnalysis(null);
      }
    } catch {
      Alert.alert('Error', 'Could not open image picker. Make sure expo-image-picker is installed.');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Camera is not supported on web.');
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setAnalysis(null);
      }
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append('file', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
      const uploaded = await apiCall<{ url: string }>('/api/v1/uploads', { method: 'POST', body: formData, isFormData: true });

      // 2. Analyze with AI
      const result = await apiCall<AnalysisResult>('/api/v1/ai/analyze', {
        method: 'POST',
        body: { imageUrl: uploaded.url },
      });
      setAnalysis(result);
    } catch {
      Alert.alert('Analysis Failed', 'Could not analyze image. Make sure the OpenAI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    if (!analysis) return;
    setLoading(true);
    try {
      await apiCall('/api/v1/items', {
        method: 'POST',
        body: {
          name: analysis.name,
          description: analysis.description,
          category: analysis.category,
          estimatedValue: analysis.estimatedValue ?? undefined,
          currency: analysis.currency,
          imageUrl: imageUri ?? undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/v1/items'] });
      Alert.alert('Saved!', `${analysis.name} added to your inventory.`);
      setImageUri(null);
      setAnalysis(null);
    } catch {
      Alert.alert('Error', 'Could not save item.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <Text style={s.title}>Scan Item</Text>
      <Text style={s.subtitle}>Take or choose a photo to identify and value an item</Text>

      {/* Image preview */}
      <View style={s.imageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={s.placeholder}>
            <Ionicons name="camera-outline" size={56} color={colors.textSecondary} />
            <Text style={s.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Capture buttons */}
      <View style={s.actionRow}>
        <TouchableOpacity style={s.actionBtn} onPress={takePhoto}>
          <Ionicons name="camera" size={22} color={colors.primary} />
          <Text style={s.actionBtnText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={pickImage}>
          <Ionicons name="images" size={22} color={colors.primary} />
          <Text style={s.actionBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Analyze button */}
      {imageUri && !analysis && (
        <TouchableOpacity style={[s.primaryBtn, loading && s.disabled]} onPress={analyzeImage} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={s.primaryBtnText}>Analyze with AI</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Analysis result */}
      {analysis && (
        <View style={s.resultCard}>
          <Text style={s.resultName}>{analysis.name}</Text>
          <View style={s.tagRow}>
            <View style={s.tag}><Text style={s.tagText}>{analysis.category}</Text></View>
            <View style={s.tag}><Text style={s.tagText}>{analysis.condition}</Text></View>
          </View>
          <Text style={s.description}>{analysis.description}</Text>
          {analysis.estimatedValue != null && (
            <Text style={s.value}>Est. ${analysis.estimatedValue.toLocaleString()} {analysis.currency}</Text>
          )}
          <View style={s.tagRow}>
            {analysis.tags.map((t) => <View key={t} style={s.smallTag}><Text style={s.smallTagText}>{t}</Text></View>)}
          </View>
          <TouchableOpacity style={[s.primaryBtn, { marginTop: 16 }, loading && s.disabled]} onPress={saveItem} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Save to Inventory</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    title: { fontSize: 26, fontWeight: '700', color: c.text, paddingHorizontal: 20, marginBottom: 4 },
    subtitle: { fontSize: 14, color: c.textSecondary, paddingHorizontal: 20, marginBottom: 20 },
    imageBox: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', height: 280, backgroundColor: c.surface, marginBottom: 16, borderWidth: 1, borderColor: c.border },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    placeholderText: { color: c.textSecondary, fontSize: 14 },
    actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: c.primary },
    actionBtnText: { color: c.primary, fontSize: 15, fontWeight: '600' },
    primaryBtn: { marginHorizontal: 20, height: 52, borderRadius: 14, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    disabled: { opacity: 0.6 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    resultCard: { margin: 20, backgroundColor: c.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: c.border },
    resultName: { fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 10 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    tag: { backgroundColor: c.primary + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { color: c.primary, fontSize: 13, fontWeight: '600' },
    description: { color: c.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 },
    value: { fontSize: 20, fontWeight: '700', color: c.success, marginBottom: 12 },
    smallTag: { backgroundColor: c.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    smallTagText: { color: c.textSecondary, fontSize: 12 },
  });
