import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, X, RefreshCw } from 'lucide-react-native';

interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  onRetry,
}) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <AlertCircle size={20} color="#dc2626" style={styles.icon} />
        <Text style={styles.messageText}>{message}</Text>
      </View>

      <View style={styles.actionsRow}>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <RefreshCw size={14} color="#dc2626" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <X size={18} color="#991b1b" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
    fontWeight: '500',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  dismissButton: {
    padding: 4,
  },
});
