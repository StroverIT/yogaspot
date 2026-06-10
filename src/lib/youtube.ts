const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be']);

export function extractYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const normalizedHost = parsed.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(normalizedHost) && !normalizedHost.endsWith('.youtube.com')) {
      return null;
    }

    if (normalizedHost === 'youtu.be' || normalizedHost === 'www.youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    const v = parsed.searchParams.get('v');
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const embedIdx = parts.indexOf('embed');
    if (embedIdx >= 0 && parts[embedIdx + 1] && /^[\w-]{11}$/.test(parts[embedIdx + 1])) {
      return parts[embedIdx + 1];
    }

    const shortsIdx = parts.indexOf('shorts');
    if (shortsIdx >= 0 && parts[shortsIdx + 1] && /^[\w-]{11}$/.test(parts[shortsIdx + 1])) {
      return parts[shortsIdx + 1];
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeYoutubeUrl(url: string): { youtubeUrl: string; youtubeVideoId: string } | null {
  const youtubeVideoId = extractYoutubeVideoId(url);
  if (!youtubeVideoId) return null;
  return {
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
    youtubeVideoId,
  };
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
