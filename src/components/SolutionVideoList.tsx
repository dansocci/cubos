import { Ionicons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  uris: string[];
  onOpenVideo: (uri: string) => void;
};

function SolutionThumb({
  uri,
  index,
  onPress,
}: {
  uri: string;
  index: number;
  onPress: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await VideoThumbnails.getThumbnailAsync(uri, { time: 0 });
        if (!cancelled) {
          setThumb(result.uri);
        }
      } catch {
        if (!cancelled) {
          setThumb(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.thumbWrap}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.fallback]}>
            <Ionicons name="videocam" size={28} color={colors.placeholderIcon} />
          </View>
        )}
        <View style={styles.playBadge}>
          <Ionicons name="play" size={14} color={colors.white} />
        </View>
      </View>
      <Text style={styles.label}>Vídeo {index + 1}</Text>
    </Pressable>
  );
}

export function SolutionVideoList({ uris, onOpenVideo }: Props) {
  return (
    <View style={styles.list}>
      {uris.map((uri, index) => (
        <SolutionThumb
          key={uri}
          uri={uri}
          index={index}
          onPress={() => onOpenVideo(uri)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  thumbWrap: {
    width: 96,
    height: 64,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 96,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.placeholder,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
