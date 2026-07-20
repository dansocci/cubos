import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CubeCard } from '../components/CubeCard';
import { useCubes } from '../context/CubesContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const GAP = spacing.md;
const H_PADDING = spacing.lg;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { cubes, loading } = useCubes();
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - H_PADDING * 2 - GAP) / 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Cubos</Text>
        <View style={styles.counterBadge}>
          <Image
            source={require('../../assets/cube-count-icon.png')}
            style={styles.counterIcon}
            resizeMode="contain"
          />
          <Text style={styles.counterSeparator}>:</Text>
          <Text style={styles.counter}>{cubes.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={cubes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 96 },
            cubes.length === 0 && styles.emptyContent,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Image
                source={require('../../assets/placeholder.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Nenhum cubo ainda</Text>
              <Text style={styles.emptyText}>
                Toque no + para adicionar o primeiro item da sua coleção.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CubeCard
              cube={item}
              width={itemWidth}
              onPress={() => navigation.navigate('CubeDetail', { id: item.id })}
            />
          )}
        />
      )}

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
        onPress={() => navigation.navigate('CubeForm')}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#E8EAEE',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  counterIcon: {
    width: 18,
    height: 18,
  },
  counterSeparator: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  counter: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 14,
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: H_PADDING,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyImage: {
    width: 140,
    height: 140,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
