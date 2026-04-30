import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from './useAudio';

export default function MuteToggle() {
  const { muted, toggleMuted, unlock } = useAudio();
  return (
    <button
      type="button"
      onClick={() => {
        unlock();
        toggleMuted();
      }}
      aria-label={muted ? 'Activar audio' : 'Silenciar audio'}
      title={muted ? 'Activar audio' : 'Silenciar audio'}
      className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}
