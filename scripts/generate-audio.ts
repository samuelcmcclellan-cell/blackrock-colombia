import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

import { STATIC_VOICES, SFX_LIBRARY } from '../src/audio/manifest';

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'IKne3meq5aSn9XLyUdCD';
const FORCE = process.argv.includes('--force');
const OUT_VOICE = resolve('public/audio/voice');
const OUT_SFX = resolve('public/audio/sfx');

const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.15,
  use_speaker_boost: true,
};

if (!KEY) {
  console.error('Error: ELEVENLABS_API_KEY missing in .env.local');
  process.exit(1);
}

mkdirSync(OUT_VOICE, { recursive: true });
mkdirSync(OUT_SFX, { recursive: true });

function hash(s: string) {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

async function generateVoice(id: string, text: string) {
  const mp3Path = resolve(OUT_VOICE, `${id}.mp3`);
  const hashPath = resolve(OUT_VOICE, `${id}.hash`);
  const expected = hash(`v1|${VOICE_ID}|${JSON.stringify(VOICE_SETTINGS)}|${text}`);
  if (
    !FORCE &&
    existsSync(mp3Path) &&
    existsSync(hashPath) &&
    readFileSync(hashPath, 'utf8').trim() === expected
  ) {
    console.log(`[skip] voice/${id}.mp3 (hash match)`);
    return;
  }
  console.log(`[gen]  voice/${id}.mp3`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': KEY!,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: VOICE_SETTINGS,
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Voice ${id} failed: ${res.status} ${errText.slice(0, 200)}`);
  }
  writeFileSync(mp3Path, Buffer.from(await res.arrayBuffer()));
  writeFileSync(hashPath, expected);
}

async function generateSfx(id: string, prompt: string, duration: number) {
  const mp3Path = resolve(OUT_SFX, `${id}.mp3`);
  const hashPath = resolve(OUT_SFX, `${id}.hash`);
  const expected = hash(`s1|${prompt}|${duration}`);
  if (
    !FORCE &&
    existsSync(mp3Path) &&
    existsSync(hashPath) &&
    readFileSync(hashPath, 'utf8').trim() === expected
  ) {
    console.log(`[skip] sfx/${id}.mp3 (hash match)`);
    return;
  }
  console.log(`[gen]  sfx/${id}.mp3`);
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': KEY!,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: duration,
      prompt_influence: 0.6,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`SFX ${id} failed: ${res.status} ${errText.slice(0, 200)}`);
  }
  writeFileSync(mp3Path, Buffer.from(await res.arrayBuffer()));
  writeFileSync(hashPath, expected);
}

async function main() {
  console.log(`Voice ID: ${VOICE_ID}${FORCE ? ' (--force)' : ''}`);
  for (const v of STATIC_VOICES) {
    await generateVoice(v.id, v.text);
  }
  for (const s of SFX_LIBRARY) {
    await generateSfx(s.id, s.prompt, s.duration);
  }
  console.log('Audio generation complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
