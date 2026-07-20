import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DifficultySlider } from '../components/DifficultySlider';
import { useCubes } from '../context/CubesContext';
import { isVideoUri } from '../media/isVideoUri';
import type { RootStackParamList } from '../navigation/types';
import type { Difficulty } from '../types/cube';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'CubeForm'>;

async function ensurePermission(
  kind: 'camera' | 'library',
): Promise<boolean> {
  if (kind === 'camera') {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;
    const requested = await ImagePicker.requestCameraPermissionsAsync();
    return requested.granted;
  }

  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return requested.granted;
}

export function CubeFormScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { getCube, addCube, editCube } = useCubes();
  const editingId = route.params?.id;
  const existing = editingId ? getCube(editingId) : undefined;
  const isEditing = Boolean(editingId && existing);
  const allowLeaveRef = useRef(false);

  const [name, setName] = useState(existing?.name ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(existing?.photoUri ?? null);
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 3);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [parityUris, setParityUris] = useState<string[]>(existing?.parityUris ?? []);
  const [solutionUris, setSolutionUris] = useState<string[]>(existing?.solutionUris ?? []);
  const [saving, setSaving] = useState(false);

  const footerPaddingBottom = Math.max(insets.bottom, spacing.sm) + spacing.md;

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar item' : 'Adicionar novo item',
      headerBackVisible: false,
    });
  }, [navigation, isEditing]);

  const hasChanges = useMemo(() => {
    if (!isEditing) {
      return Boolean(
        name.trim() ||
          photoUri ||
          notes.trim() ||
          parityUris.length ||
          solutionUris.length ||
          difficulty !== 3,
      );
    }
    return true;
  }, [isEditing, name, photoUri, notes, parityUris, solutionUris, difficulty]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowLeaveRef.current) {
        return;
      }

      if (!hasChanges && !isEditing) {
        return;
      }

      event.preventDefault();

      Alert.alert(
        'Descartar alterações?',
        'As informações preenchidas serão perdidas.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              allowLeaveRef.current = true;
              navigation.dispatch(event.data.action);
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, isEditing]);

  const pickPhotoFromLibrary = async () => {
    const ok = await ensurePermission('library');
    if (!ok) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para importar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const ok = await ensurePermission('camera');
    if (!ok) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para fotografar o cubo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickParityMedia = async () => {
    const ok = await ensurePermission('library');
    if (!ok) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para importar mídias.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setParityUris((prev) => [...prev, ...uris]);
    }
  };

  const pickSolutionVideos = async () => {
    const ok = await ensurePermission('library');
    if (!ok) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para importar vídeos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setSolutionUris((prev) => [...prev, ...uris]);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nome obrigatório', 'Informe o nome do cubo para salvar.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmed,
        photoUri,
        difficulty,
        notes: notes.trim() ? notes : null,
        parityUris,
        solutionUris,
      };

      if (isEditing && editingId) {
        await editCube(editingId, payload);
        allowLeaveRef.current = true;
        navigation.goBack();
      } else {
        const created = await addCube(payload);
        allowLeaveRef.current = true;
        navigation.replace('CubeDetail', { id: created.id });
      }
    } catch (error) {
      Alert.alert(
        'Erro ao salvar',
        error instanceof Error ? error.message : 'Não foi possível salvar o item.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex.: 3x3 Speed"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Foto</Text>
        <Text style={styles.helper}>
          Após escolher, você pode enquadrar a imagem no quadrado arrastando e pinçando.
        </Text>
        <View style={styles.photoPreview}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoEmpty}>
              <Ionicons name="image-outline" size={32} color={colors.placeholderIcon} />
              <Text style={styles.helper}>Nenhuma foto selecionada</Text>
            </View>
          )}
        </View>
        <View style={styles.row}>
          <Pressable style={styles.secondaryButton} onPress={pickPhotoFromLibrary}>
            <Ionicons name="images-outline" size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Galeria</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Câmera</Text>
          </Pressable>
          {photoUri ? (
            <Pressable style={styles.secondaryButton} onPress={() => setPhotoUri(null)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.secondaryButtonText, { color: colors.danger }]}>Remover</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.label}>Dificuldade *</Text>
        <DifficultySlider value={difficulty} onChange={setDifficulty} />

        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Detalhes, métodos, observações..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Paridade</Text>
        <Text style={styles.helper}>Fotos ou vídeos importados da galeria</Text>
        <Pressable style={styles.secondaryButton} onPress={pickParityMedia}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Adicionar mídias</Text>
        </Pressable>
        <View style={styles.mediaList}>
          {parityUris.map((uri) => (
            <View key={uri} style={styles.mediaChip}>
              {isVideoUri(uri) ? (
                <View style={styles.mediaVideo}>
                  <Ionicons name="videocam" size={20} color={colors.white} />
                </View>
              ) : (
                <Image source={{ uri }} style={styles.mediaThumb} />
              )}
              <Pressable onPress={() => setParityUris((prev) => prev.filter((item) => item !== uri))}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Solução</Text>
        <Text style={styles.helper}>Um ou mais vídeos da galeria</Text>
        <Pressable style={styles.secondaryButton} onPress={pickSolutionVideos}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Adicionar vídeos</Text>
        </Pressable>
        <View style={styles.mediaList}>
          {solutionUris.map((uri, index) => (
            <View key={uri} style={styles.mediaChip}>
              <View style={styles.mediaVideo}>
                <Ionicons name="play" size={18} color={colors.white} />
              </View>
              <Text style={styles.mediaName}>Vídeo {index + 1}</Text>
              <Pressable onPress={() => setSolutionUris((prev) => prev.filter((item) => item !== uri))}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        <Pressable style={styles.cancelButton} onPress={handleCancel} disabled={saving}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, saving && styles.saveDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  label: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  helper: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  notes: {
    minHeight: 110,
  },
  photoPreview: {
    width: '72%',
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  mediaList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  mediaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  mediaThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  mediaVideo: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaName: {
    flex: 1,
    color: colors.text,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontWeight: '700',
    color: colors.white,
  },
});
