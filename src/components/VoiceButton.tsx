import React from 'react';
import { Mic, Square, Sparkles } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple Waves while recording */}
        {isListening && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-red-400 opacity-75 animate-ping pointer-events-none" />
            <span className="absolute w-28 h-28 rounded-full bg-red-300 opacity-40 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          id="voice-mic-main-button"
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white scale-105'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200 text-white hover:scale-105'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
          title={isListening ? 'Stop recording' : 'Start speaking'}
        >
          {isListening ? (
            <Square className="w-9 h-9 fill-current" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1">
        <p
          className={`text-sm font-semibold tracking-wide transition-colors ${
            isListening ? 'text-red-600 animate-pulse' : 'text-slate-600'
          }`}
        >
          {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
        </p>
        <span className="text-xs text-slate-400">
          {isListening ? 'Speak naturally (e.g., "Remind me to call John tomorrow at 5 PM")' : 'Natural language voice recognition'}
        </span>
      </div>
    </div>
  );
};
