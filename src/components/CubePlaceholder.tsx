import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

import { useTheme } from '../context/ThemeContext';

type Props = {
  style?: StyleProp<ImageStyle>;
  /** Mantido por compatibilidade; a imagem preenche o container. */
  iconSize?: number;
};

export function CubePlaceholder({ style }: Props) {
  const { colors } = useTheme();

  return (
    <Image
      source={require('../../assets/placeholder.png')}
      style={[styles.image, { backgroundColor: colors.placeholder }, style]}
      resizeMode="cover"
      accessibilityLabel="Sem foto do cubo"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
