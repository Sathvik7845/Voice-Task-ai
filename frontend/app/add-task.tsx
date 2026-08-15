import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Check, X, Calendar, Clock, Sparkles } from 'lucide-react-native';
import { storageService } from '../services/storageService';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingIndicator } from '../components/LoadingIndicator';

export default function AddTaskScreen() {
  const router = useRouter();

  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Date Helpers
  const setDateToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  };

  const setDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!task || task.trim().length === 0) {
      setErrorMessage('Please enter a task description.');
      return;
    }

    setIsLoading(false);
    setErrorMessage(null);

    // Basic date validation if provided
    let cleanedDate: string | null = null;
    if (date.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date.trim())) {
        setErrorMessage('Date must be in YYYY-MM-DD format (e.g. 2026-08-16)');
        return;
      }
      cleanedDate = date.trim();
    }

    // Basic time validation if provided
    let cleanedTime: string | null = null;
    if (time.trim()) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(time.trim())) {
        setErrorMessage('Time must be in 24-hour HH:mm format (e.g. 17:00)');
        return;
      }
      cleanedTime = time.trim();
    }

    try {
      setIsLoading(true);
      await storageService.saveTask({
        task: task.trim(),
        date: cleanedDate,
        time: cleanedTime,
      });
      router.back();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.heading}>Create New Task</Text>
          <Text style={styles.subheading}>
            Add a task manually or use voice commands from the home screen.
          </Text>

          <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {/* Form Fields */}
          <View style={styles.formCard}>
            {/* Task Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Task Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Call John, Submit assignment"
                placeholderTextColor="#94a3b8"
                value={task}
                onChangeText={setTask}
                autoFocus
              />
            </View>

            {/* Date Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Calendar size={16} color="#2563eb" />
                <Text style={styles.label}>Due Date (Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (e.g., 2026-08-16)"
                placeholderTextColor="#94a3b8"
                value={date}
                onChangeText={setDate}
              />
              <View style={styles.quickChipsRow}>
                <TouchableOpacity onPress={setDateToday} style={styles.quickChip}>
                  <Text style={styles.quickChipText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={setDateTomorrow} style={styles.quickChip}>
                  <Text style={styles.quickChipText}>Tomorrow</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Clock size={16} color="#2563eb" />
                <Text style={styles.label}>Time (Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="HH:mm (e.g., 17:00 or 09:30)"
                placeholderTextColor="#94a3b8"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {isLoading && <LoadingIndicator message="Saving task..." />}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              id="save-manual-task-btn"
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            >
              <Check size={20} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              id="cancel-manual-task-btn"
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={isLoading}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  actionsContainer: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});
