import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Trash2, Clock, Calendar, Edit3 } from 'lucide-react-native';
import { Task } from '../types/task';
import { formatDate, formatTime } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (task: Task) => void;
  onEdit?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onPress,
  onEdit,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(task)}
      style={[
        styles.card,
        task.completed && styles.cardCompleted,
      ]}
    >
      <View style={styles.contentRow}>
        {/* Completion Checkbox */}
        <TouchableOpacity
          id={`toggle-task-${task.id}`}
          activeOpacity={0.7}
          onPress={() => onToggleComplete(task.id)}
          style={[
            styles.checkbox,
            task.completed ? styles.checkboxCompleted : styles.checkboxIncomplete,
          ]}
        >
          {task.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
        </TouchableOpacity>

        {/* Task Details */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.task}
          </Text>

          <View style={styles.metaRow}>
            {task.date && (
              <View style={styles.metaBadge}>
                <Calendar size={12} color="#6b7280" />
                <Text style={styles.metaText}>{formatDate(task.date)}</Text>
              </View>
            )}

            {task.time && (
              <View style={styles.metaBadge}>
                <Clock size={12} color="#6b7280" />
                <Text style={styles.metaText}>{formatTime(task.time)}</Text>
              </View>
            )}

            {!task.date && !task.time && (
              <Text style={styles.noDateTimeText}>No due date</Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity
              id={`edit-task-${task.id}`}
              activeOpacity={0.6}
              onPress={() => onEdit(task)}
              style={styles.actionButton}
            >
              <Edit3 size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            id={`delete-task-${task.id}`}
            activeOpacity={0.6}
            onPress={() => onDelete(task.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    opacity: 0.75,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxIncomplete: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981', // Emerald green
    borderColor: '#10b981',
  },
  textContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  noDateTimeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 6,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
});
