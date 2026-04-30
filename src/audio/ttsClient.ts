const cache = new Map<string, string>();
const MAX = 20;

export async function fetchTTSBlob(text: string, voiceId?: string): Promise<string> {
  const key = `${voiceId ?? ''}|${text}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }

  const res = await fetch('/api/elevenlabs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'tts', text, voice_id: voiceId }),
  });
  if (!res.ok) {
    throw new Error(`TTS request failed: ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  if (cache.size >= MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      const oldUrl = cache.get(oldest);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      cache.delete(oldest);
    }
  }
  cache.set(key, url);
  return url;
}
