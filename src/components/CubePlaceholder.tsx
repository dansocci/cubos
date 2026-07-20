import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  style?: StyleProp<ImageStyle>;
  /** Mantido por compatibilidade; a imagem preenche o container. */
  iconSize?: number;
};

export function CubePlaceholder({ style }: Props) {
  return (
    <Image
      source={require('../../assets/placeholder.png')}
      style={[styles.image, style]}
      resizeMode="cover"
      accessibilityLabel="Sem foto do cubo"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
