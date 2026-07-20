const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|avi|webm|mkv|3gp)(\?|$)/i;

export function isVideoUri(uri: string): boolean {
  return VIDEO_EXTENSIONS.test(uri);
}
