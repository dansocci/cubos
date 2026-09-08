# Cubos

App mobile para gerenciar uma coleção pessoal de cubos mágicos.  
Tudo fica **100% no aparelho** — sem login, nuvem ou sincronização.

**Releases:** [github.com/dansocci/cubos/releases](https://github.com/dansocci/cubos/releases)

## Funcionalidades

- **Home** — grade em 2 colunas com foto (ou placeholder), nome e contador de itens
- **Menu sanduíche** — ao lado do título, com ordenação, tema e exportação
- **Ordenação** — por data de inserção, nome ou dificuldade (crescente / decrescente)
- **Tema escuro** — alternável no menu; preferência salva no aparelho
- **Exportar PDF** — lista da coleção em duas colunas (nome, foto e dificuldade por cubo), via compartilhamento do sistema
- **Adicionar / editar** — nome, foto (galeria ou câmera com enquadramento), dificuldade, notas, checkbox de paridade (fotos/vídeos) e solução (fotos/vídeos)
- **Detalhe** — zoom na foto, carrossel de paridade, player de vídeo e exclusão com confirmação
- **Persistência local** — SQLite para metadados e arquivos copiados para o armazenamento do app

## Stack

- Expo SDK 57 + React Native + TypeScript
- React Navigation (native stack)
- `expo-sqlite`, `expo-file-system`, `expo-image-picker`, `expo-video`
- `expo-print` + `expo-sharing` (PDF)
- `@react-native-async-storage/async-storage` (tema)
- Reanimated + Gesture Handler

## Pré-requisitos

- Node.js 22+
- Para desenvolvimento: [Expo Go](https://expo.dev/go) compatível com **SDK 57** (o da Play Store pode estar em SDK antigo)
- Para gerar APK: Android Studio (SDK, NDK `27.1.12297006`, CMake `3.22.1`) e o JDK embutido do Android Studio (21)
- Para publicar release: [GitHub CLI](https://cli.github.com/) (`gh`) autenticado

## Desenvolvimento

```bash
npm install
npx expo start --clear
```

Escaneie o QR code com o Expo Go (SDK 57).

Para rodar o app nativo (necessário após adicionar módulos nativos como print/sharing):

```bash
npx expo run:android
# ou
npx expo run:ios
```

## Build do APK (local)

O projeto já inclui a pasta `android/` gerada via prebuild. Não é necessário conta Expo para este fluxo.

### 1. Variáveis de ambiente (recomendado no `~/.zshrc`)

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

O arquivo `android/gradle.properties` também aponta o Gradle para o JDK do Android Studio, o que evita falhas com Java 25+.

### 2. Gerar o APK

```bash
cd android
./gradlew --stop          # opcional: reinicia o daemon do Gradle
./gradlew assembleRelease
```

APK gerado em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Opcional — renomear para a versão da release:

```bash
cp android/app/build/outputs/apk/release/app-release.apk \
   android/app/build/outputs/apk/release/cubos-vX.Y.apk
```

### 3. Instalar no aparelho (USB / adb)

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> Após mudar ícone ou splash, desinstale a versão anterior antes de reinstalar — o Android costuma cachear o ícone do launcher:
>
> ```bash
> adb uninstall com.cubos.app
> adb install android/app/build/outputs/apk/release/app-release.apk
> ```

### Problemas comuns na build

| Sintoma | O que fazer |
|---------|-------------|
| Erro de *restricted method* / CMake com Java 25 | Use o JDK 21 do Android Studio (`JAVA_HOME` acima) |
| NDK incompleto / download falhou | Instale **NDK 27.1.12297006** em Android Studio → SDK Tools (marque *Show Package Details*) |
| Pasta NDK só com `.installer` | `rm -rf ~/Library/Android/sdk/ndk/27.1.12297006` e reinstale pelo Android Studio |
| CMake ausente | Instale **CMake 3.22.1** nas SDK Tools |

## Release no GitHub

Fluxo usado neste repositório: tag anotada + release com o APK anexado.

### 1. Commit e push das mudanças

```bash
git status
git add .
git commit -m "Descreva a mudança"
git push origin main
```

### 2. Criar e enviar a tag

Use versionamento semântico (`vMAJOR.MINOR.PATCH`), alinhado às releases anteriores (`v1.0.0`, `v1.1.0`, `v1.2.0`, …):

```bash
git tag -a vX.Y.Z -m "Versão X.Y do app Cubos"
git push origin vX.Y.Z
```

### 3. Publicar a release com o APK

Com o `gh` logado (`gh auth login`):

```bash
gh release create vX.Y.Z \
  android/app/build/outputs/apk/release/cubos-vX.Y.apk \
  --repo dansocci/cubos \
  --title "Cubos X.Y.Z" \
  --notes "$(cat <<'EOF'
## Novidades

- Item 1
- Item 2

APK: `cubos-vX.Y.apk`
EOF
)"
```

Se o APK ainda estiver com o nome padrão do Gradle:

```bash
gh release create vX.Y.Z \
  android/app/build/outputs/apk/release/app-release.apk \
  --repo dansocci/cubos \
  --title "Cubos X.Y.Z" \
  --notes "Notas da versão"
```

### 4. Conferir

```bash
gh release view vX.Y.Z --repo dansocci/cubos
```

A página da release: `https://github.com/dansocci/cubos/releases/tag/vX.Y.Z`

## Estrutura

```text
src/
  screens/       Home, formulário e detalhe
  components/    Card, menu, slider, mídia, player, zoom
  data/          SQLite + repositório
  media/         Cópia e remoção de arquivos locais
  context/       Coleção + tema claro/escuro
  navigation/    Stack de telas
  theme/         Cores (light/dark) e espaçamentos
  utils/         Ordenação e exportação PDF
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
| Tem paridade | Sim / Não                                      |
| Paridade     | Lista de fotos/vídeos (se tiver paridade)      |
| Solução      | Lista de fotos/vídeos                          |

## Licença

Ver [LICENSE](./LICENSE).
