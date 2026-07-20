import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DifficultySlider } from '../components/DifficultySlider';
import { EditableMediaList } from '../components/EditableMediaList';
import { useCubes } from '../context/CubesContext';
import type { RootStackParamList } from '../navigation/types';
import type { CubeMedia, Difficulty } from '../types/cube';
import { defaultMediaName } from '../types/cube';
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
  const headerHeight = useHeaderHeight();
  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<Record<string, number>>({});
  const { getCube, addCube, editCube } = useCubes();
  const editingId = route.params?.id;
  const existing = editingId ? getCube(editingId) : undefined;
  const isEditing = Boolean(editingId && existing);
  const allowLeaveRef = useRef(false);

  const [name, setName] = useState(existing?.name ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(existing?.photoUri ?? null);
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 3);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [hasParity, setHasParity] = useState(
    existing?.hasParity ?? (existing?.parityMedia.length ?? 0) > 0,
  );
  const [parityMedia, setParityMedia] = useState<CubeMedia[]>(existing?.parityMedia ?? []);
  const [solutionMedia, setSolutionMedia] = useState<CubeMedia[]>(
    existing?.solutionMedia ?? [],
  );
  const [saving, setSaving] = useState(false);

  const footerPaddingBottom = Math.max(insets.bottom, spacing.sm) + spacing.md;

  const scrollToField = (field: string) => {
    const y = fieldOffsets.current[field];
    if (y == null) return;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(y - spacing.lg, 0),
        animated: true,
      });
    }, 100);
  };

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
          hasParity ||
          parityMedia.length ||
          solutionMedia.length ||
          difficulty !== 3,
      );
    }
    return true;
  }, [isEditing, name, photoUri, notes, hasParity, parityMedia, solutionMedia, difficulty]);

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
      setParityMedia((prev) => [
        ...prev,
        ...result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: defaultMediaName(asset.uri, prev.length + index),
        })),
      ]);
    }
  };

  const pickSolutionMedia = async () => {
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
      setSolutionMedia((prev) => [
        ...prev,
        ...result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: defaultMediaName(asset.uri, prev.length + index),
        })),
      ]);
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
      const normalizeMedia = (items: CubeMedia[]) =>
        items.map((item, index) => ({
          uri: item.uri,
          name: item.name.trim() || defaultMediaName(item.uri, index),
        }));

      const payload = {
        name: trimmed,
        photoUri,
        difficulty,
        notes: notes.trim() ? notes : null,
        hasParity,
        parityMedia: hasParity ? normalizeMedia(parityMedia) : [],
        solutionMedia: normalizeMedia(solutionMedia),
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex.: 3x3 Speed"
          placeholderTextColor={colors.textSecondary}
          onLayout={(event) => {
            fieldOffsets.current.name = event.nativeEvent.layout.y;
          }}
          onFocus={() => scrollToField('name')}
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

        <Text style={styles.label}>Dificuldade: *</Text>
        <DifficultySlider value={difficulty} onChange={setDifficulty} />

        <Text style={styles.label}>Notas:</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Detalhes, métodos, observações..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
          onLayout={(event) => {
            fieldOffsets.current.notes = event.nativeEvent.layout.y;
          }}
          onFocus={() => scrollToField('notes')}
        />

        <Text style={styles.label}>Paridade:</Text>
        <Pressable
          style={styles.checkboxRow}
          onPress={() => {
            setHasParity((prev) => {
              const next = !prev;
              if (!next) {
                setParityMedia([]);
              }
              return next;
            });
          }}
        >
          <View style={[styles.checkbox, hasParity && styles.checkboxChecked]}>
            {hasParity ? (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            ) : null}
          </View>
          <Text style={styles.checkboxLabel}>Este cubo tem paridade</Text>
        </Pressable>

        {hasParity ? (
          <>
            <Text style={styles.helper}>
              Fotos ou vídeos da galeria. Toque no nome para editar e use as setas para reordenar.
            </Text>
            <Pressable style={styles.secondaryButton} onPress={pickParityMedia}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Adicionar mídias</Text>
            </Pressable>
            <EditableMediaList
              items={parityMedia}
              onChange={setParityMedia}
              editableName
            />
          </>
        ) : null}

        <Text style={styles.label}>Solução:</Text>
        <Text style={styles.helper}>
          Fotos ou vídeos da galeria. Toque no nome para editar e use as setas para reordenar.
        </Text>
        <Pressable style={styles.secondaryButton} onPress={pickSolutionMedia}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Adicionar mídias</Text>
        </Pressable>
        <EditableMediaList
          items={solutionMedia}
          onChange={setSolutionMedia}
          editableName
        />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
