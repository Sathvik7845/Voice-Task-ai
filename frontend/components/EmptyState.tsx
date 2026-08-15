import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Mic } from 'lucide-react-native';

interface EmptyStateProps {
  title?: string;
  description?: string;
  isFiltered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tasks yet',
  description = 'Tap the microphone below and say what you want to be reminded about!',
  isFiltered = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {isFiltered ? (
          <CheckCircle2 size={36} color="#94a3b8" />
        ) : (
          <Mic size={36} color="#3b82f6" />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
