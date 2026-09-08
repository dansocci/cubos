import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';

import type { Cube } from '../types/cube';
import { DIFFICULTY_LABELS } from '../types/cube';
import { DIFFICULTY_COLORS } from '../theme/colors';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mimeFromUri(uri: string): string {
  const ext = (uri.split('?')[0]?.split('.').pop() ?? 'jpg').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

async function toDataUri(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  try {
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    return `data:${mimeFromUri(uri)};base64,${base64}`;
  } catch {
    return null;
  }
}

function sectionHtml(cube: Cube, photoDataUri: string | null, index: number): string {
  const difficultyColor = DIFFICULTY_COLORS[cube.difficulty];
  const difficultyLabel = DIFFICULTY_LABELS[cube.difficulty];
  const photoBlock = photoDataUri
    ? `<img class="photo" src="${photoDataUri}" alt="${escapeHtml(cube.name)}" />`
    : `<div class="photo-placeholder">Sem foto</div>`;

  return `
    <section class="cube">
      <div class="cube-header">
        <span class="index">#${index + 1}</span>
        <h2>${escapeHtml(cube.name)}</h2>
      </div>
      ${photoBlock}
      <div class="difficulty" style="background:${difficultyColor}22;border-color:${difficultyColor};color:${difficultyColor}">
        Dificuldade: ${cube.difficulty}/5 — ${difficultyLabel}
      </div>
    </section>
  `;
}

export async function buildCubesPdfHtml(cubes: Cube[]): Promise<string> {
  const sections: string[] = [];

  for (let i = 0; i < cubes.length; i += 1) {
    const cube = cubes[i]!;
    const photoDataUri = await toDataUri(cube.photoUri);
    sections.push(sectionHtml(cube, photoDataUri, i));
  }

  const generatedAt = new Date().toLocaleString('pt-BR');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page { margin: 28px; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        color: #1A1D23;
        margin: 0;
        padding: 0;
      }
      .cover {
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 2px solid #D8DCE3;
      }
      .cover h1 {
        margin: 0 0 6px;
        font-size: 28px;
      }
      .cover p {
        margin: 0;
        color: #6B7280;
        font-size: 13px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        align-items: start;
      }
      .cube {
        border: 1px solid #D8DCE3;
        border-radius: 12px;
        padding: 12px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .cube-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 10px;
      }
      .index {
        color: #6B7280;
        font-weight: 700;
        font-size: 12px;
        flex-shrink: 0;
      }
      .cube h2 {
        margin: 0;
        font-size: 15px;
        line-height: 1.25;
        word-break: break-word;
      }
      .photo {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 10px;
        display: block;
        margin-bottom: 10px;
        background: #E5E7EB;
      }
      .photo-placeholder {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 10px;
        background: #E5E7EB;
        color: #6B7280;
        text-align: center;
        line-height: 180px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .difficulty {
        display: inline-block;
        border: 1px solid;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="cover">
      <h1>Coleção Cubos</h1>
      <p>${cubes.length} cubo${cubes.length === 1 ? '' : 's'} · gerado em ${generatedAt}</p>
    </div>
    <div class="grid">
      ${sections.join('\n')}
    </div>
  </body>
</html>
  `.trim();
}

export async function exportCubesPdf(cubes: Cube[]): Promise<void> {
  if (cubes.length === 0) {
    throw new Error('Não há cubos para exportar.');
  }

  const html = await buildCubesPdfHtml(cubes);
  const { uri } = await Print.printToFileAsync({ html });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento indisponível neste dispositivo.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Exportar lista de cubos',
  });
}
