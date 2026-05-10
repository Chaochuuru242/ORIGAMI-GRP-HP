/**
 * YouTube / Vimeo URL → 埋め込み URL とサムネイル URL を返すユーティリティ
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) {
    try {
      return new URL(url).searchParams.get("v");
    } catch {
      return null;
    }
  }
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0] ?? null;
  }
  if (url.includes("youtube.com/embed/")) {
    return url.split("youtube.com/embed/")[1]?.split("?")[0] ?? null;
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  if (url.includes("vimeo.com/")) {
    return url.split("vimeo.com/")[1]?.split("?")[0]?.split("/")[0] ?? null;
  }
  return null;
}

export function getEmbedUrl(videoUrl: string): string | null {
  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
  const vimeoId = extractVimeoId(videoUrl);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }
  return null;
}

export function getThumbnailUrl(videoUrl: string | null): string | null {
  if (!videoUrl) return null;
  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  // Vimeo はサムネイル取得に API が必要なので NULL を返す（DBの thumbnail_url を別途使う）
  return null;
}
