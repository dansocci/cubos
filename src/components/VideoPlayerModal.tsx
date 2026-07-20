import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  uri: string | null;
  visible: boolean;
  onClose: () => void;
};

const SPEEDS = [0.5, 1, 1.5, 2];
const SEEK_SECONDS = 10;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayerModal({ uri, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [speedIndex, setSpeedIndex] = useState(1);
  const [trackWidth, setTrackWidth] = useState(1);

  const player = useVideoPlayer(uri ?? null, (instance) => {
    instance.loop = false;
    instance.timeUpdateEventInterval = 0.25;
  });

  useEffect(() => {
    if (!visible) {
      player.pause();
      return;
    }
    if (uri) {
      player.replace(uri);
      player.play();
    }
  }, [visible, uri, player]);

  const playingEvent = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });
  const timeEvent = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const statusEvent = useEvent(player, 'statusChange', { status: player.status });

  const isPlaying = playingEvent?.isPlaying ?? player.playing;
  const currentTime = timeEvent?.currentTime ?? player.currentTime;
  const status = statusEvent?.status ?? player.status;

  const duration = player.duration || 0;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const speedLabel = useMemo(() => `${SPEEDS[speedIndex]}x`, [speedIndex]);

  const seekBy = (delta: number) => {
    const next = Math.max(0, Math.min(duration, player.currentTime + delta));
    player.currentTime = next;
  };

  const seekToRatio = (ratio: number) => {
    if (duration <= 0) return;
    player.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  const cycleSpeed = () => {
    const nextIndex = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIndex);
    player.playbackRate = SPEEDS[nextIndex];
  };

  const handleClose = () => {
    player.pause();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={28} color={colors.white} />
        </Pressable>

        <View style={styles.playerArea}>
          {uri ? (
            <VideoView
              style={styles.video}
              player={player}
              contentFit="contain"
              nativeControls={false}
            />
          ) : null}

          <View style={styles.sideControls} pointerEvents="box-none">
            <Pressable style={styles.sideZone} onPress={() => seekBy(-SEEK_SECONDS)}>
              <Text style={styles.sideHint}>-{SEEK_SECONDS}s</Text>
            </Pressable>
            <Pressable style={styles.sideZone} onPress={() => seekBy(SEEK_SECONDS)}>
              <Text style={styles.sideHint}>+{SEEK_SECONDS}s</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={styles.playButton}
            onPress={() => (isPlaying ? player.pause() : player.play())}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={colors.white}
            />
          </Pressable>

          <Text style={styles.time}>{formatTime(currentTime)}</Text>

          <Pressable
            style={styles.track}
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
            onPress={(event) => {
              const x = event.nativeEvent.locationX;
              seekToRatio(x / trackWidth);
            }}
          >
            <View style={styles.trackBg} />
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          </Pressable>

          <Text style={styles.time}>{formatTime(duration)}</Text>

          <Pressable style={styles.speedButton} onPress={cycleSpeed}>
            <Text style={styles.speedText}>{speedLabel}</Text>
          </Pressable>
        </View>

        {status === 'error' ? (
          <Text style={styles.error}>Não foi possível reproduzir este vídeo.</Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  playerArea: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  sideControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  sideZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideHint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 14,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    color: colors.white,
    fontSize: 12,
    minWidth: 36,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  speedButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  speedText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
