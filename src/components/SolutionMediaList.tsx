import { Ionicons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { isVideoUri } from '../media/isVideoUri';
import type { CubeMedia } from '../types/cube';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  items: CubeMedia[];
  onOpenImage: (uri: string) => void;
  onOpenVideo: (uri: string) => void;
};

function SolutionMediaItem({
  item,
  index,
  onOpenImage,
  onOpenVideo,
}: {
  item: CubeMedia;
  index: number;
  onOpenImage: (uri: string) => void;
  onOpenVideo: (uri: string) => void;
}) {
  const video = isVideoUri(item.uri);
  const [thumb, setThumb] = useState<string | null>(video ? null : item.uri);

  useEffect(() => {
    if (!video) {
      setThumb(item.uri);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await VideoThumbnails.getThumbnailAsync(item.uri, { time: 0 });
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
  }, [item.uri, video]);

  return (
    <Pressable
      style={styles.item}
      onPress={() => (video ? onOpenVideo(item.uri) : onOpenImage(item.uri))}
    >
      <View style={styles.thumbWrap}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.fallback]}>
            <Ionicons
              name={video ? 'videocam' : 'image'}
              size={28}
              color={colors.placeholderIcon}
            />
          </View>
        )}
        {video ? (
          <View style={styles.playBadge}>
            <Ionicons name="play" size={14} color={colors.white} />
          </View>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {item.name || (video ? `Vídeo ${index + 1}` : `Foto ${index + 1}`)}
      </Text>
    </Pressable>
  );
}

export function SolutionMediaList({ items, onOpenImage, onOpenVideo }: Props) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <SolutionMediaItem
          key={`${item.uri}-${index}`}
          item={item}
          index={index}
          onOpenImage={onOpenImage}
          onOpenVideo={onOpenVideo}
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
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
