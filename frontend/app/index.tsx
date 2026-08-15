import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Sparkles, Volume2, CalendarDays, CheckCheck } from 'lucide-react-native';

import { Task, ExtractedTaskData } from '../types/task';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { speechService } from '../services/speechService';
import { VoiceButton } from '../components/VoiceButton';
import { TaskCard } from '../components/TaskCard';
import { TaskPreview } from '../components/TaskPreview';
import { EmptyState } from '../components/EmptyState';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { isToday, isUpcoming } from '../utils/dateUtils';
import { SAMPLE_VOICE_COMMANDS } from '../utils/constants';

export default function HomeScreen() {
  const router = useRouter();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExtractedTaskData | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Load stored tasks
  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await storageService.getTasks();
      setTasks(storedTasks);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load local tasks');
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Setup speech recognition listener
  useEffect(() => {
    speechService.setListeners({
      onListeningChange: (listening) => {
        setIsListening(listening);
      },
      onResult: (text) => {
        setRecognizedText(text);
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
    });

    return () => {
      speechService.stopListening();
    };
  }, []);

  // Handle voice mic toggle
  const handleVoiceToggle = async () => {
    setErrorMessage(null);

    if (isListening) {
      // User tapped to stop listening
      await speechService.stopListening();
      if (recognizedText.trim().length > 0) {
        processVoiceCommand(recognizedText);
      }
    } else {
      setRecognizedText('');
      await speechService.startListening();
    }
  };

  // Process voice command text through backend Gemini API
  const processVoiceCommand = async (textToProcess: string) => {
    if (!textToProcess || textToProcess.trim().length === 0) {
      setErrorMessage('No speech captured. Please tap the microphone and speak clearly.');
      return;
    }

    setIsLoadingAi(true);
    setErrorMessage(null);

    try {
      const extracted = await apiService.extractTask(textToProcess);
      setPreviewData(extracted);
      setIsPreviewVisible(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract task with AI. Please try again or add manually.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Save extracted task into AsyncStorage
  const handleSaveExtractedTask = async (finalData: ExtractedTaskData) => {
    setIsSaving(true);
    try {
      await storageService.saveTask(finalData);
      await loadTasks();
      setIsPreviewVisible(false);
      setPreviewData(null);
      setRecognizedText('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      await storageService.updateTask(id, { completed: !task.completed });
      await loadTasks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update task status');
    }
  };

  // Delete a task
  const handleDeleteTask = async (id: string) => {
    try {
      await storageService.deleteTask(id);
      await loadTasks();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete task');
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadTasks();
    setIsRefreshing(false);
  };

  // Group tasks
  const todayTasks = tasks.filter((t) => isToday(t.date));
  const upcomingTasks = tasks.filter((t) => isUpcoming(t.date) || (!t.date && !t.completed));
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Sparkles size={18} color="#ffffff" />
            </View>
            <Text style={styles.brandTitle}>VoiceTask AI</Text>
          </View>
          <Text style={styles.taglineText}>Turn your natural voice into organized tasks</Text>
        </View>

        {/* Error Message Alert */}
        <ErrorMessage
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          onRetry={recognizedText ? () => processVoiceCommand(recognizedText) : undefined}
        />

        {/* Voice Input Section */}
        <View style={styles.voiceCard}>
          <VoiceButton
            isListening={isListening}
            onPress={handleVoiceToggle}
            disabled={isLoadingAi || isSaving}
          />

          {/* Recognized Text Display */}
          {recognizedText ? (
            <View style={styles.transcriptBox}>
              <View style={styles.transcriptHeader}>
                <Volume2 size={14} color="#64748b" />
                <Text style={styles.transcriptLabel}>Recognized Speech</Text>
              </View>
              <Text style={styles.transcriptContent}>"{recognizedText}"</Text>
              {!isListening && !isLoadingAi && (
                <TouchableOpacity
                  onPress={() => processVoiceCommand(recognizedText)}
                  style={styles.reprocessButton}
                >
                  <Sparkles size={14} color="#2563eb" />
                  <Text style={styles.reprocessButtonText}>Extract Task with AI</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Quick Voice Prompt Suggestions */}
          {!isListening && !recognizedText && (
            <View style={styles.sampleContainer}>
              <Text style={styles.sampleHeader}>Quick Test Commands:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sampleScroll}>
                {SAMPLE_VOICE_COMMANDS.map((sample, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => {
                      setRecognizedText(sample);
                      processVoiceCommand(sample);
                    }}
                    style={styles.sampleChip}
                  >
                    <Text style={styles.sampleChipText}>"{sample}"</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Dynamic Loading States */}
        {isLoadingAi && <LoadingIndicator message="Understanding your task..." isAi />}
        {isSaving && <LoadingIndicator message="Saving task to storage..." />}

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          {/* Today's Tasks */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTitleWrap}>
              <CalendarDays size={18} color="#2563eb" />
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{todayTasks.length}</Text>
            </View>
          </View>

          {todayTasks.length > 0 ? (
            todayTasks.map((item) => (
              <TaskCard
                key={item.id}
                task={item}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onPress={() => router.push({ pathname: '/task-details', params: { id: item.id } })}
              />
            ))
          ) : (
            <View style={styles.emptySectionBox}>
              <Text style={styles.emptySectionText}>No tasks scheduled for today</Text>
            </View>
          )}

          {/* Upcoming & Other Tasks */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <View style={styles.sectionHeaderTitleWrap}>
              <Text style={styles.sectionTitle}>Upcoming & Other Tasks</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{upcomingTasks.length}</Text>
            </View>
          </View>

          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((item) => (
              <TaskCard
                key={item.id}
                task={item}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onPress={() => router.push({ pathname: '/task-details', params: { id: item.id } })}
              />
            ))
          ) : (
            <View style={styles.emptySectionBox}>
              <Text style={styles.emptySectionText}>No upcoming tasks</Text>
            </View>
          )}

          {/* Completed Tasks Accordion / Section if any */}
          {completedTasks.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderTitleWrap}>
                  <CheckCheck size={18} color="#10b981" />
                  <Text style={styles.sectionTitle}>Completed Tasks</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.countBadgeText, { color: '#059669' }]}>
                    {completedTasks.length}
                  </Text>
                </View>
              </View>
              {completedTasks.map((item) => (
                <TaskCard
                  key={item.id}
                  task={item}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onPress={() => router.push({ pathname: '/task-details', params: { id: item.id } })}
                />
              ))}
            </View>
          )}

          {tasks.length === 0 && <EmptyState />}
        </View>
      </ScrollView>

      {/* Floating Add Task Button (Manual Creation) */}
      <TouchableOpacity
        id="floating-add-task-btn"
        activeOpacity={0.85}
        onPress={() => router.push('/add-task')}
        style={styles.floatingButton}
      >
        <Plus size={28} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* AI Task Confirmation Preview Modal */}
      <TaskPreview
        visible={isPreviewVisible}
        data={previewData}
        onSave={handleSaveExtractedTask}
        onCancel={() => {
          setIsPreviewVisible(false);
          setPreviewData(null);
        }}
      />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 16,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  taglineText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  voiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  transcriptBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 10,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  transcriptContent: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#1e293b',
    lineHeight: 22,
  },
  reprocessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  reprocessButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  sampleContainer: {
    width: '100%',
    marginTop: 12,
  },
  sampleHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sampleScroll: {
    flexDirection: 'row',
  },
  sampleChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sampleChipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  tasksSection: {
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  emptySectionBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
