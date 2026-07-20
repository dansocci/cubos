# Cubos

App mobile para gerenciar uma coleção pessoal de cubos mágicos.  
Tudo fica **100% no aparelho** — sem login, nuvem ou sincronização.

**Versão atual:** [v1.0.0](https://github.com/dansocci/cubos/releases/tag/v1.0.0)

## Funcionalidades

- **Home** — grade em 2 colunas com foto (ou placeholder), nome e contador de itens
- **Adicionar / editar** — nome, foto (galeria ou câmera com enquadramento), dificuldade, notas, paridade (fotos/vídeos) e solução (vídeos)
- **Detalhe** — zoom na foto, carrossel de paridade, player de vídeo e exclusão com confirmação
- **Persistência local** — SQLite para metadados e arquivos copiados para o armazenamento do app

## Stack

- Expo SDK 57 + React Native + TypeScript
- React Navigation (native stack)
- `expo-sqlite`, `expo-file-system`, `expo-image-picker`, `expo-video`
- Reanimated + Gesture Handler

## Pré-requisitos

- Node.js 22+
- Para desenvolvimento: [Expo Go](https://expo.dev/go) compatível com **SDK 57** (o da Play Store pode estar em SDK antigo)
- Para gerar APK: Android Studio (SDK, NDK `27.1.12297006`, CMake `3.22.1`) e o JDK embutido do Android Studio (21)

## Desenvolvimento

```bash
npm install
npx expo start --clear
```

Escaneie o QR code com o Expo Go (SDK 57).

## Build do APK (local)

O projeto já inclui a pasta `android/` gerada via prebuild.

```bash
cd android
./gradlew assembleRelease
```

APK gerado em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Se o Gradle falhar com erro de *restricted method* no Java, use o JDK do Android Studio. O arquivo `android/gradle.properties` já aponta para:

```text
/Applications/Android Studio.app/Contents/jbr/Contents/Home
```

Recomendado no `~/.zshrc` para builds Android em geral:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

Instalar no aparelho (USB / adb):

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> Após mudar ícone ou splash, desinstale a versão anterior antes de reinstalar — o Android costuma cachear o ícone do launcher.

## Estrutura

```text
src/
  screens/       Home, formulário e detalhe
  components/    Card, slider de dificuldade, mídia, player, zoom
  data/          SQLite + repositório
  media/         Cópia e remoção de arquivos locais
  context/       Estado da coleção
  navigation/    Stack de telas
  theme/         Cores e espaçamentos
assets/          Ícone, splash e placeholders
android/         Projeto nativo para build local
```

## Modelo de um cubo

| Campo        | Descrição                                      |
|--------------|------------------------------------------------|
| Nome         | Obrigatório                                    |
| Foto         | Opcional (placeholder se vazia)                |
| Dificuldade  | 1–5 (muito fácil → super difícil)              |
| Notas        | Texto livre                                    |
| Paridade     | Lista de fotos/vídeos                          |
| Solução      | Lista de vídeos                                |

## Release

Tags e APKs publicados em:  
https://github.com/dansocci/cubos/releases

## Licença

Ver [LICENSE](./LICENSE).
