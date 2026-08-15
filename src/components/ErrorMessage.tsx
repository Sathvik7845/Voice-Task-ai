import React from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  onRetry,
}) => {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between gap-3 p-3.5 my-3 bg-red-50 border border-red-200 rounded-xl text-red-800 animate-in fade-in duration-200">
      <div className="flex items-start gap-2.5 min-w-0">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-semibold">Something went wrong</p>
          <p className="text-xs text-red-700 mt-0.5 break-words">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 underline"
            >
              <RotateCcw className="w-3 h-3" />
              Try again
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-100 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
