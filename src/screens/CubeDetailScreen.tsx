import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CubePlaceholder } from '../components/CubePlaceholder';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { MediaCarousel } from '../components/MediaCarousel';
import { SolutionMediaList } from '../components/SolutionMediaList';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { useCubes } from '../context/CubesContext';
import type { RootStackParamList } from '../navigation/types';
import { DIFFICULTY_LABELS } from '../types/cube';
import { colors, DIFFICULTY_COLORS } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'CubeDetail'>;

export function CubeDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { getCube, removeCube } = useCubes();
  const cube = getCube(route.params.id);

  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (!cube) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Item não encontrado.</Text>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.link}>Voltar para a home</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Excluir item?',
      `Tem certeza que deseja excluir "${cube.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removeCube(cube.id);
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  const hasNotes = Boolean(cube.notes?.trim());
  const hasSolution = cube.solutionMedia.length > 0;

  const footerPaddingBottom = Math.max(insets.bottom, spacing.sm) + spacing.md;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.photoWrap}
          onPress={() => {
            if (cube.photoUri) {
              setZoomUri(cube.photoUri);
            }
          }}
        >
          {cube.photoUri ? (
            <Image source={{ uri: cube.photoUri }} style={styles.photo} />
          ) : (
            <CubePlaceholder style={styles.photo} iconSize={64} />
          )}
        </Pressable>

        <Text style={styles.name}>{cube.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dificuldade:</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: `${DIFFICULTY_COLORS[cube.difficulty]}22` },
            ]}
          >
            <View
              style={[
                styles.difficultyDot,
                { backgroundColor: DIFFICULTY_COLORS[cube.difficulty] },
              ]}
            />
            <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[cube.difficulty] }]}>
              {DIFFICULTY_LABELS[cube.difficulty]}
            </Text>
          </View>
        </View>

        {hasNotes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas:</Text>
            <Text style={styles.notes}>{cube.notes}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Paridade: {cube.hasParity ? 'Sim' : 'Não'}
          </Text>
          {cube.hasParity && cube.parityMedia.length > 0 ? (
            <MediaCarousel
              items={cube.parityMedia}
              onOpenImage={setZoomUri}
              onOpenVideo={setVideoUri}
            />
          ) : null}
        </View>

        {hasSolution ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solução:</Text>
            <SolutionMediaList
              items={cube.solutionMedia}
              onOpenImage={setZoomUri}
              onOpenVideo={setVideoUri}
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate('CubeForm', { id: cube.id })}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteText}>Excluir</Text>
        </Pressable>
      </View>

      <ImageZoomModal
        uri={zoomUri}
        visible={Boolean(zoomUri)}
        onClose={() => setZoomUri(null)}
      />
      <VideoPlayerModal
        uri={videoUri}
        visible={Boolean(videoUri)}
        onClose={() => setVideoUri(null)}
      />
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
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  backButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  photoWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  difficultyText: {
    fontWeight: '700',
    fontSize: 15,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
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
  editButton: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editText: {
    color: colors.primary,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  missingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
