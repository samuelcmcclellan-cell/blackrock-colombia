import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { voiceUrl, sfxUrl, type StaticVoiceId, type SfxId } from './manifest';
import { fetchTTSBlob } from './ttsClient';

const MUTE_KEY = 'co-audio-muted';
const SFX_VOLUME = 0.32;
const VOICE_VOLUME = 1.0;

type AudioContextValue = {
  muted: boolean;
  toggleMuted: () => void;
  setMuted: (b: boolean) => void;
  unlock: () => void;
  playStaticVoice: (id: StaticVoiceId) => void;
  playSfx: (id: SfxId, opts?: { volume?: number }) => void;
  playSfxRandom: (ids: SfxId[], opts?: { volume?: number }) => void;
  streamTTS: (text: string, opts?: { voiceId?: string }) => Promise<void>;
  stopAll: () => void;
};

export const AudioCtx = createContext<AudioContextValue | null>(null);

function readInitialMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = window.localStorage.getItem(MUTE_KEY);
    if (v === null) return false;
    return v === 'true';
  } catch {
    return false;
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState<boolean>(readInitialMuted);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const voiceElRef = useRef<HTMLAudioElement | null>(null);
  const sfxElRef = useRef<HTMLAudioElement | null>(null);
  const ttsElRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const v = new Audio();
    v.preload = 'auto';
    v.volume = VOICE_VOLUME;
    voiceElRef.current = v;

    const s = new Audio();
    s.preload = 'auto';
    s.volume = SFX_VOLUME;
    sfxElRef.current = s;

    const t = new Audio();
    t.preload = 'auto';
    t.volume = VOICE_VOLUME;
    ttsElRef.current = t;

    return () => {
      v.pause();
      s.pause();
      t.pause();
      voiceElRef.current = null;
      sfxElRef.current = null;
      ttsElRef.current = null;
    };
  }, []);

  const setMuted = useCallback((b: boolean) => {
    setMutedState(b);
    try {
      window.localStorage.setItem(MUTE_KEY, b ? 'true' : 'false');
    } catch {
      /* ignore */
    }
    if (b) {
      voiceElRef.current?.pause();
      sfxElRef.current?.pause();
      ttsElRef.current?.pause();
    }
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted(!mutedRef.current);
  }, [setMuted]);

  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    const tryUnlock = (el: HTMLAudioElement | null) => {
      if (!el) return;
      const prevVolume = el.volume;
      el.volume = 0;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            el.pause();
            el.currentTime = 0;
            el.volume = prevVolume;
          })
          .catch(() => {
            el.volume = prevVolume;
          });
      }
    };
    tryUnlock(voiceElRef.current);
    tryUnlock(sfxElRef.current);
    tryUnlock(ttsElRef.current);
  }, []);

  const playStaticVoice = useCallback((id: StaticVoiceId) => {
    if (mutedRef.current) return;
    const el = voiceElRef.current;
    if (!el) return;
    try {
      // Cut any in-flight TTS narration so two voices never overlap.
      // Symmetric with streamTTS pausing voiceElRef before playing.
      ttsElRef.current?.pause();
      el.pause();
      el.src = voiceUrl(id);
      el.currentTime = 0;
      el.volume = VOICE_VOLUME;
      const p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* autoplay blocked or asset missing — silent fail */
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const playSfx = useCallback((id: SfxId, opts?: { volume?: number }) => {
    if (mutedRef.current) return;
    const el = sfxElRef.current;
    if (!el) return;
    try {
      el.pause();
      el.src = sfxUrl(id);
      el.currentTime = 0;
      el.volume = opts?.volume ?? SFX_VOLUME;
      const p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* silent fail */
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const playSfxRandom = useCallback(
    (ids: SfxId[], opts?: { volume?: number }) => {
      if (!ids.length) return;
      const pick = ids[Math.floor(Math.random() * ids.length)];
      playSfx(pick, opts);
    },
    [playSfx]
  );

  const streamTTS = useCallback(async (text: string, opts?: { voiceId?: string }) => {
    if (mutedRef.current) return;
    if (!text || !text.trim()) return;
    const el = ttsElRef.current;
    if (!el) return;
    try {
      const url = await fetchTTSBlob(text, opts?.voiceId);
      if (mutedRef.current) return;
      // Cut any in-flight static voice so two narrations never overlap.
      voiceElRef.current?.pause();
      el.pause();
      el.src = url;
      el.currentTime = 0;
      el.volume = VOICE_VOLUME;
      await el.play().catch(() => {
        /* silent fail */
      });
    } catch {
      /* network or API error — fail silently to avoid breaking UX */
    }
  }, []);

  const stopAll = useCallback(() => {
    voiceElRef.current?.pause();
    sfxElRef.current?.pause();
    ttsElRef.current?.pause();
  }, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      muted,
      toggleMuted,
      setMuted,
      unlock,
      playStaticVoice,
      playSfx,
      playSfxRandom,
      streamTTS,
      stopAll,
    }),
    [muted, toggleMuted, setMuted, unlock, playStaticVoice, playSfx, playSfxRandom, streamTTS, stopAll]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
