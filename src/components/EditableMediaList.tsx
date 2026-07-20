import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { isVideoUri } from '../media/isVideoUri';
import type { CubeMedia } from '../types/cube';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  items: CubeMedia[];
  onChange: (items: CubeMedia[]) => void;
  /** Quando false, o nome fica só como rótulo (sem edição). */
  editableName?: boolean;
};

function moveItem(items: CubeMedia[], from: number, to: number): CubeMedia[] {
  if (to < 0 || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function EditableMediaList({ items, onChange, editableName = false }: Props) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const video = isVideoUri(item.uri);
        const fallbackName = video ? `Vídeo ${index + 1}` : `Foto ${index + 1}`;
        const displayName = item.name.trim() || fallbackName;

        return (
          <View key={`${item.uri}-${index}`} style={styles.chip}>
            {video ? (
              <View style={styles.videoThumb}>
                <Ionicons name="videocam" size={20} color={colors.white} />
              </View>
            ) : (
              <Image source={{ uri: item.uri }} style={styles.imageThumb} />
            )}

            {editableName ? (
              <TextInput
                style={styles.nameInput}
                value={item.name}
                onChangeText={(name) => {
                  const next = [...items];
                  next[index] = { ...item, name };
                  onChange(next);
                }}
                placeholder={fallbackName}
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.nameLabel} numberOfLines={1}>
                {displayName}
              </Text>
            )}

            <View style={styles.actions}>
              <Pressable
                style={[styles.iconButton, index === 0 && styles.iconDisabled]}
                disabled={index === 0}
                onPress={() => onChange(moveItem(items, index, index - 1))}
                hitSlop={6}
              >
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={index === 0 ? colors.border : colors.textSecondary}
                />
              </Pressable>
              <Pressable
                style={[styles.iconButton, index === items.length - 1 && styles.iconDisabled]}
                disabled={index === items.length - 1}
                onPress={() => onChange(moveItem(items, index, index + 1))}
                hitSlop={6}
              >
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={
                    index === items.length - 1 ? colors.border : colors.textSecondary
                  }
                />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => onChange(items.filter((_, i) => i !== index))}
                hitSlop={6}
              >
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  imageThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  videoThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  nameLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    padding: 2,
  },
  iconDisabled: {
    opacity: 0.45,
  },
});
