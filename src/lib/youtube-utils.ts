
/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate YouTube embed URL with parameters (more permissive settings)
 */
export function generateYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '0',
    controls: '1',
    modestbranding: '1',
    rel: '0',
    showinfo: '1',
    fs: '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
    origin: window.location.origin
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Generate YouTube thumbnail URL
 */
export function generateYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Get YouTube watch URL from video ID
 */
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
