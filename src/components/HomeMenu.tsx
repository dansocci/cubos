import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import {
  SORT_FIELD_LABELS,
  type CubeSort,
  type SortField,
} from '../utils/sortCubes';

const SORT_FIELDS: SortField[] = ['createdAt', 'name', 'difficulty'];
const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '—';

type Props = {
  visible: boolean;
  onClose: () => void;
  sort: CubeSort;
  onSortChange: (field: SortField) => void;
  exporting: boolean;
  onExportPdf: () => void;
  canExport: boolean;
};

export function HomeMenu({
  visible,
  onClose,
  sort,
  onSortChange,
  exporting,
  onExportPdf,
  canExport,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, setDarkMode } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.panel,
            {
              paddingTop: insets.top + spacing.md,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Menu</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar menu">
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Ordenar</Text>
            <View style={styles.sectionCard}>
              {SORT_FIELDS.map((field, index) => {
                const active = sort.field === field;
                return (
                  <Pressable
                    key={field}
                    onPress={() => onSortChange(field)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      index < SORT_FIELDS.length - 1 && styles.optionDivider,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {SORT_FIELD_LABELS[field]}
                      </Text>
                    </View>
                    {active ? (
                      <View style={styles.directionBadge}>
                        <Ionicons
                          name={sort.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                          size={14}
                          color={colors.primary}
                        />
                        <Text style={styles.directionText}>
                          {sort.direction === 'asc' ? 'Crescente' : 'Decrescente'}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>Toque novamente no critério ativo para inverter a ordem.</Text>

            <Text style={styles.sectionLabel}>Aparência</Text>
            <View style={styles.sectionCard}>
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons
                    name={isDark ? 'moon' : 'moon-outline'}
                    size={20}
                    color={colors.text}
                  />
                  <Text style={styles.optionText}>Tema escuro</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>Exportar</Text>
            <Pressable
              onPress={onExportPdf}
              disabled={!canExport || exporting}
              style={({ pressed }) => [
                styles.exportButton,
                (!canExport || exporting) && styles.exportButtonDisabled,
                pressed && canExport && !exporting && styles.pressed,
              ]}
            >
              {exporting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color={colors.white} />
                  <Text style={styles.exportButtonText}>Exportar lista em PDF</Text>
                </>
              )}
            </Pressable>
            {!canExport ? (
              <Text style={styles.hint}>Cadastre ao menos um cubo para exportar.</Text>
            ) : (
              <Text style={styles.hint}>
                O PDF inclui nome, foto e dificuldade de cada cubo.
              </Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Versão {APP_VERSION}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    backdrop: {
      flex: 1,
    },
    panel: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '82%',
      maxWidth: 340,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 2, height: 0 },
    },
    panelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    panelTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    sectionLabel: {
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      minHeight: 52,
    },
    optionDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexShrink: 1,
    },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    optionTextActive: {
      color: colors.primary,
    },
    directionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    directionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    hint: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
      marginBottom: spacing.xs,
    },
    exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      minHeight: 52,
    },
    exportButtonDisabled: {
      opacity: 0.5,
    },
    exportButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      marginTop: spacing.sm,
      alignItems: 'center',
    },
    versionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
