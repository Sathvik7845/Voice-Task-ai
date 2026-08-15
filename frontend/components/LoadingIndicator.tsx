import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface LoadingIndicatorProps {
  message?: string;
  isAi?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  isAi = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {isAi ? (
          <View style={styles.aiIconBadge}>
            <Sparkles size={20} color="#2563eb" />
          </View>
        ) : (
          <ActivityIndicator size="small" color="#2563eb" />
        )}
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  aiIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
  },
});
