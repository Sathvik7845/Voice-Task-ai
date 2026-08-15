import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  isAi?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Processing...',
  isAi = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4 my-3 bg-blue-50/80 border border-blue-200/70 rounded-xl text-blue-700 animate-pulse">
      {isAi ? (
        <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
      ) : (
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      )}
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
};
