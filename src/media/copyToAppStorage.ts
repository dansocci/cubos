import * as Crypto from 'expo-crypto';
import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

function extensionFromUri(uri: string): string {
  const cleaned = uri.split('?')[0] ?? uri;
  const parts = cleaned.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : 'bin';
  return ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

async function ensureDir(dir: string): Promise<void> {
  const info = await getInfoAsync(dir);
  if (!info.exists) {
    await makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function copyMediaToAppStorage(
  sourceUri: string,
  folder: 'photos' | 'parity' | 'solutions',
): Promise<string> {
  if (!documentDirectory) {
    throw new Error('Armazenamento local indisponível');
  }

  if (sourceUri.startsWith(documentDirectory)) {
    return sourceUri;
  }

  const dir = `${documentDirectory}media/${folder}/`;
  await ensureDir(dir);

  const id = Crypto.randomUUID();
  const ext = extensionFromUri(sourceUri);
  const dest = `${dir}${id}.${ext}`;
  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteMediaFile(uri: string | null | undefined): Promise<void> {
  if (!uri || !documentDirectory || !uri.startsWith(documentDirectory)) {
    return;
  }

  try {
    const info = await getInfoAsync(uri);
    if (info.exists) {
      await deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // ignore missing files
  }
}

export async function deleteMediaFiles(uris: string[]): Promise<void> {
  await Promise.all(uris.map((uri) => deleteMediaFile(uri)));
}
