import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Trash2, Calendar, Clock, Edit2, ArrowLeft } from 'lucide-react-native';
import { Task } from '../types/task';
import { storageService } from '../services/storageService';
import { formatDate, formatTime } from '../utils/dateUtils';
import { ErrorMessage } from '../components/ErrorMessage';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask() {
      if (!id) return;
      const tasks = await storageService.getTasks();
      const found = tasks.find((t) => t.id === id);
      if (found) {
        setTask(found);
        setTaskName(found.task);
        setDate(found.date || '');
        setTime(found.time || '');
      } else {
        setErrorMessage('Task not found');
      }
    }
    loadTask();
  }, [id]);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Task not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleComplete = async () => {
    try {
      const updated = await storageService.updateTask(task.id, { completed: !task.completed });
      if (updated) setTask(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status');
    }
  };

  const handleSaveChanges = async () => {
    if (!taskName.trim()) {
      setErrorMessage('Task description cannot be empty');
      return;
    }

    try {
      const updated = await storageService.updateTask(task.id, {
        task: taskName.trim(),
        date: date.trim() || null,
        time: time.trim() || null,
      });
      if (updated) {
        setTask(updated);
        setIsEditing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save updates');
    }
  };

  const handleDelete = async () => {
    try {
      await storageService.deleteTask(task.id);
      router.back();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete task');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {/* Task Status Card */}
        <View style={[styles.statusCard, task.completed && styles.statusCardCompleted]}>
          <TouchableOpacity
            id="toggle-task-detail-status"
            activeOpacity={0.8}
            onPress={handleToggleComplete}
            style={[styles.statusCheckbox, task.completed && styles.statusCheckboxCompleted]}
          >
            {task.completed && <Check size={18} color="#ffffff" strokeWidth={3} />}
          </TouchableOpacity>
          <View>
            <Text style={styles.statusTitle}>
              {task.completed ? 'Task Completed' : 'Task In Progress'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {task.completed ? 'Tap to mark as incomplete' : 'Tap to mark as completed'}
            </Text>
          </View>
        </View>

        {/* Main Details / Edit Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{isEditing ? 'Edit Task' : 'Task Details'}</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editToggle}
            >
              <Edit2 size={16} color="#2563eb" />
              <Text style={styles.editToggleText}>{isEditing ? 'Cancel Edit' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {!isEditing ? (
            <View style={styles.detailsView}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TASK</Text>
                <Text style={[styles.detailValue, task.completed && styles.detailCompleted]}>
                  {task.task}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBox}>
                  <Calendar size={18} color="#2563eb" />
                  <View>
                    <Text style={styles.metaLabel}>DUE DATE</Text>
                    <Text style={styles.metaVal}>{formatDate(task.date)}</Text>
                    {task.date && <Text style={styles.rawVal}>({task.date})</Text>}
                  </View>
                </View>

                <View style={styles.metaBox}>
                  <Clock size={18} color="#2563eb" />
                  <View>
                    <Text style={styles.metaLabel}>TIME</Text>
                    <Text style={styles.metaVal}>{formatTime(task.time)}</Text>
                    {task.time && <Text style={styles.rawVal}>({task.time})</Text>}
                  </View>
                </View>
              </View>

              <View style={styles.createdDateRow}>
                <Text style={styles.createdText}>
                  Created: {new Date(task.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.editForm}>
              <Text style={styles.inputLabel}>Task Description</Text>
              <TextInput
                style={styles.textInput}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="Task description"
              />

              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>Time (HH:mm)</Text>
              <TextInput
                style={styles.textInput}
                value={time}
                onChangeText={setTime}
                placeholder="HH:mm (24-hour format)"
              />

              <TouchableOpacity
                onPress={handleSaveChanges}
                style={styles.saveChangesButton}
              >
                <Check size={18} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.saveChangesText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Delete Task Button */}
        <TouchableOpacity
          id="delete-task-detail-btn"
          activeOpacity={0.7}
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Trash2 size={20} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    gap: 14,
  },
  statusCardCompleted: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCheckboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editToggleText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  detailsView: {
    gap: 16,
  },
  detailRow: {
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 28,
  },
  detailCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  metaRow: {
    gap: 12,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  metaVal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  rawVal: {
    fontSize: 12,
    color: '#94a3b8',
  },
  createdDateRow: {
    marginTop: 8,
  },
  createdText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  editForm: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  saveChangesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  saveChangesText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
