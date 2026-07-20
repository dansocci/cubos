import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { isVideoUri } from '../media/isVideoUri';
import type { CubeMedia } from '../types/cube';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  items: CubeMedia[];
  onOpenImage: (uri: string) => void;
  onOpenVideo: (uri: string) => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

export function MediaCarousel({ items, onOpenImage, onOpenVideo }: Props) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    setIndex(next);
  };

  const current = items[index];

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        contentContainerStyle={styles.content}
      >
        {items.map((item, itemIndex) => {
          const video = isVideoUri(item.uri);
          return (
            <Pressable
              key={`${item.uri}-${itemIndex}`}
              style={[styles.item, { width: ITEM_WIDTH }]}
              onPress={() => (video ? onOpenVideo(item.uri) : onOpenImage(item.uri))}
            >
              {video ? (
                <View style={styles.videoThumb}>
                  <Ionicons name="play-circle" size={56} color={colors.white} />
                  <Text style={styles.videoLabel}>{item.name || 'Vídeo'}</Text>
                </View>
              ) : (
                <Image source={{ uri: item.uri }} style={styles.image} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      {current?.name ? (
        <Text style={styles.caption} numberOfLines={2}>
          {current.name}
        </Text>
      ) : null}
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, i) => (
            <View
              key={`${item.uri}-dot-${i}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 0,
  },
  item: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoThumb: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  videoLabel: {
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  caption: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
