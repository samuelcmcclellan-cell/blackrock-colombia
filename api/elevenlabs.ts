import type { VercelRequest, VercelResponse } from '@vercel/node';

const KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID ?? 'IKne3meq5aSn9XLyUdCD';
const MAX_TTS_CHARS = 500;
const MAX_SFX_DURATION = 5;
const MIN_SFX_DURATION = 0.5;

async function fetchAudio(url: string, body: object): Promise<Buffer> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': KEY!,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 200)}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
  }

  try {
    const body = req.body ?? {};
    const action = body.action;

    if (action === 'tts') {
      const text = typeof body.text === 'string' ? body.text : '';
      if (!text.trim()) {
        return res.status(400).json({ error: 'text required' });
      }
      const trimmed = text.slice(0, MAX_TTS_CHARS);
      const vid =
        typeof body.voice_id === 'string' && body.voice_id ? body.voice_id : DEFAULT_VOICE;

      const audio = await fetchAudio(
        `https://api.elevenlabs.io/v1/text-to-speech/${vid}?optimize_streaming_latency=3&output_format=mp3_44100_128`,
        {
          text: trimmed,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true,
          },
        }
      );

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(audio);
    }

    if (action === 'sfx') {
      const text = typeof body.text === 'string' ? body.text : '';
      if (!text.trim()) {
        return res.status(400).json({ error: 'text required' });
      }
      const dur = Math.min(
        Math.max(Number(body.duration_seconds) || 1, MIN_SFX_DURATION),
        MAX_SFX_DURATION
      );

      const audio = await fetchAudio('https://api.elevenlabs.io/v1/sound-generation', {
        text: text.slice(0, 200),
        duration_seconds: dur,
        prompt_influence: 0.6,
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(audio);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('ElevenLabs error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = { maxDuration: 30 };
