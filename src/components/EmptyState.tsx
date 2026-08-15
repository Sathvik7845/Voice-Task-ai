import React from 'react';
import { Mic, CalendarCheck, Sparkles } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200/80 rounded-2xl my-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
        <Sparkles className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-base font-bold text-slate-800">No tasks created yet</h3>
      <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
        Tap the microphone button and speak a command like:
      </p>
      <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 italic">
        "Remind me to call Mom tomorrow at 6 PM"
      </div>
    </div>
  );
};
