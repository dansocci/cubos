import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Cube } from '../types/cube';
import { colors, DIFFICULTY_COLORS } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { CubePlaceholder } from './CubePlaceholder';

type Props = {
  cube: Cube;
  width: number;
  onPress: () => void;
};

export function CubeCard({ cube, width, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          backgroundColor: `${DIFFICULTY_COLORS[cube.difficulty]}66`,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageWrap, { width: width - spacing.md * 2, height: width - spacing.md * 2 }]}>
        {cube.photoUri ? (
          <Image source={{ uri: cube.photoUri }} style={styles.image} />
        ) : (
          <CubePlaceholder style={styles.image} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {cube.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
