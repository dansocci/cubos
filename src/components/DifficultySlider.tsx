import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { DIFFICULTY_LABELS, type Difficulty } from '../types/cube';
import { colors, DIFFICULTY_COLORS } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
};

const LEVELS: Difficulty[] = [1, 2, 3, 4, 5];
const THUMB_SIZE = 28;
const TRACK_HEIGHT = 14;
const GRADIENT_COLORS = [
  DIFFICULTY_COLORS[1],
  DIFFICULTY_COLORS[2],
  DIFFICULTY_COLORS[3],
  DIFFICULTY_COLORS[4],
  DIFFICULTY_COLORS[5],
] as const;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function positionToLevel(x: number, trackWidth: number): Difficulty {
  'worklet';
  if (trackWidth <= 0) return 1;
  const ratio = clamp(x / trackWidth, 0, 1);
  const level = Math.round(ratio * (LEVELS.length - 1)) + 1;
  return level as Difficulty;
}

function levelToPosition(level: Difficulty, trackWidth: number) {
  'worklet';
  if (trackWidth <= 0) return 0;
  return ((level - 1) / (LEVELS.length - 1)) * trackWidth;
}

export function DifficultySlider({ value, onChange }: Props) {
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const startX = useSharedValue(0);

  useEffect(() => {
    if (trackWidth.value > 0) {
      thumbX.value = withSpring(levelToPosition(value, trackWidth.value), {
        damping: 18,
        stiffness: 180,
      });
    }
  }, [value, thumbX, trackWidth]);

  const emitChange = (level: Difficulty) => {
    if (level !== value) {
      onChange(level);
    }
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = thumbX.value;
    })
    .onUpdate((event) => {
      thumbX.value = clamp(startX.value + event.translationX, 0, trackWidth.value);
    })
    .onEnd(() => {
      const level = positionToLevel(thumbX.value, trackWidth.value);
      const snapped = levelToPosition(level, trackWidth.value);
      thumbX.value = withSpring(snapped, { damping: 18, stiffness: 180 });
      runOnJS(emitChange)(level);
    });

  const tap = Gesture.Tap().onEnd((event) => {
    const level = positionToLevel(event.x, trackWidth.value);
    const snapped = levelToPosition(level, trackWidth.value);
    thumbX.value = withSpring(snapped, { damping: 18, stiffness: 180 });
    runOnJS(emitChange)(level);
  });

  const composed = Gesture.Simultaneous(pan, tap);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    trackWidth.value = width;
    thumbX.value = levelToPosition(value, width);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: DIFFICULTY_COLORS[value] }]}>
        {DIFFICULTY_LABELS[value]}
      </Text>

      <GestureDetector gesture={composed}>
        <View style={styles.sliderArea} onLayout={onTrackLayout}>
          <LinearGradient
            colors={[...GRADIENT_COLORS]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.track}
          />

          <View style={styles.ticks} pointerEvents="none">
            {LEVELS.map((level) => (
              <View key={level} style={styles.tickWrap}>
                <View
                  style={[
                    styles.tick,
                    level === value && {
                      backgroundColor: DIFFICULTY_COLORS[level],
                      transform: [{ scaleY: 1.35 }],
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View
              style={[
                styles.thumbInner,
                {
                  borderColor: DIFFICULTY_COLORS[value],
                  backgroundColor: colors.white,
                },
              ]}
            />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: DIFFICULTY_COLORS[1] }]}>
          {DIFFICULTY_LABELS[1]}
        </Text>
        <Text style={[styles.legendText, { color: DIFFICULTY_COLORS[5] }]}>
          {DIFFICULTY_LABELS[5]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  sliderArea: {
    height: 44,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
  },
  ticks: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickWrap: {
    width: 2,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 2,
    height: 10,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  thumb: {
    position: 'absolute',
    top: (44 - THUMB_SIZE) / 2,
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.full,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
