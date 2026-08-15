import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Check, Edit2, X, Calendar, Clock, Sparkles } from 'lucide-react-native';
import { ExtractedTaskData } from '../types/task';
import { formatDate, formatTime } from '../utils/dateUtils';

interface TaskPreviewProps {
  visible: boolean;
  data: ExtractedTaskData | null;
  onSave: (finalData: ExtractedTaskData) => void;
  onCancel: () => void;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({
  visible,
  data,
  onSave,
  onCancel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskText, setTaskText] = useState(data?.task || '');
  const [dateText, setDateText] = useState(data?.date || '');

  // 12-Hour format state
  const [timeHour, setTimeHour] = useState('05');
  const [timeMinute, setTimeMinute] = useState('00');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('PM');
  const [hasTime, setHasTime] = useState(true);

  // Parse 24-hour string (e.g. "17:00") into 12-hour values
  const parse24HourTo12 = (val: string | null) => {
    if (!val || !val.includes(':')) {
      setHasTime(false);
      setTimeHour('05');
      setTimeMinute('00');
      setTimePeriod('PM');
      return;
    }
    setHasTime(true);
    const parts = val.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) || 0;
    const isPm = h >= 12;
    if (h >= 12) h -= 12;
    if (h === 0) h = 12;

    setTimeHour(String(h).padStart(2, '0'));
    setTimeMinute(String(m).padStart(2, '0'));
    setTimePeriod(isPm ? 'PM' : 'AM');
  };

  // Convert 12-hour back to 24-hour HH:mm
  const get24HourString = (): string | null => {
    if (!hasTime) return null;
    let h = parseInt(timeHour, 10) || 12;
    const m = parseInt(timeMinute, 10) || 0;
    if (h > 12) h = 12;
    if (h < 1) h = 1;

    let hour24 = h;
    if (timePeriod === 'PM' && h < 12) hour24 += 12;
    if (timePeriod === 'AM' && h === 12) hour24 = 0;

    return `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (data) {
      setTaskText(data.task || '');
      setDateText(data.date || '');
      parse24HourTo12(data.time);
      setIsEditing(false);
    }
  }, [data]);

  if (!data) return null;

  const handleSave = () => {
    onSave({
      task: taskText.trim(),
      date: dateText.trim() || null,
      time: get24HourString(),
    });
  };

  const final24Time = get24HourString();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Sparkles size={16} color="#2563eb" />
              <Text style={styles.headerBadgeText}>AI Extracted</Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Task Preview</Text>
          <Text style={styles.subtitle}>
            Please review the AI-extracted task details before saving.
          </Text>

          {!isEditing ? (
            /* Read-only view */
            <View style={styles.previewCard}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>TASK</Text>
                <Text style={styles.fieldValueTask}>{taskText}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <View style={styles.metaIconWrap}>
                    <Calendar size={16} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.fieldLabel}>DATE</Text>
                    <Text style={styles.fieldValueMeta}>
                      {dateText ? formatDate(dateText) : 'No date specified'}
                    </Text>
                    {dateText ? <Text style={styles.rawMetaText}>({dateText})</Text> : null}
                  </View>
                </View>

                <View style={styles.metaItem}>
                  <View style={styles.metaIconWrap}>
                    <Clock size={16} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.fieldLabel}>TIME (12-HOUR & 24-HOUR)</Text>
                    <Text style={styles.fieldValueMeta}>
                      {final24Time ? formatTime(final24Time) : 'No time specified'}
                    </Text>
                    {final24Time ? (
                      <Text style={styles.rawMetaText}>24-hour format: {final24Time}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Edit Mode with AM / PM toggle */
            <ScrollView style={styles.editCard} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Task Description</Text>
              <TextInput
                style={styles.textInput}
                value={taskText}
                onChangeText={setTaskText}
                placeholder="Task description"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={dateText}
                onChangeText={setDateText}
                placeholder="YYYY-MM-DD or leave blank"
                placeholderTextColor="#9ca3af"
              />

              {/* Quick Date Buttons */}
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={styles.dateChip}
                  onPress={() => setDateText(new Date().toISOString().split('T')[0])}
                >
                  <Text style={styles.chipText}>📅 Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dateChip}
                  onPress={() => {
                    const tmrw = new Date();
                    tmrw.setDate(tmrw.getDate() + 1);
                    setDateText(tmrw.toISOString().split('T')[0]);
                  }}
                >
                  <Text style={styles.chipText}>📅 Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dateChip}
                  onPress={() => setDateText('')}
                >
                  <Text style={styles.chipTextClear}>✕ Clear</Text>
                </TouchableOpacity>
              </View>

              {/* 12-Hour AM/PM Time Selector */}
              <View style={styles.timeSectionHeader}>
                <Text style={styles.inputLabel}>Time (12-Hour AM/PM)</Text>
                <TouchableOpacity
                  onPress={() => setHasTime(!hasTime)}
                  style={styles.toggleTimeBtn}
                >
                  <Text style={hasTime ? styles.toggleTimeActive : styles.toggleTimeInactive}>
                    {hasTime ? 'Disable Time' : '+ Enable Time'}
                  </Text>
                </TouchableOpacity>
              </View>

              {hasTime ? (
                <View>
                  <View style={styles.timePickerContainer}>
                    {/* Hour */}
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeSmallLabel}>Hour (1-12)</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={timeHour}
                        onChangeText={(val) => {
                          const num = parseInt(val, 10);
                          if (!val || (num >= 1 && num <= 12)) setTimeHour(val);
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="05"
                      />
                    </View>

                    <Text style={styles.timeSeparator}>:</Text>

                    {/* Minute */}
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeSmallLabel}>Minute (0-59)</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={timeMinute}
                        onChangeText={(val) => {
                          const num = parseInt(val, 10);
                          if (!val || (num >= 0 && num <= 59)) setTimeMinute(val);
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="00"
                      />
                    </View>

                    {/* AM/PM Switcher */}
                    <View style={styles.periodSwitcher}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setTimePeriod('AM')}
                        style={[
                          styles.periodBtn,
                          timePeriod === 'AM' && styles.periodBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodBtnText,
                            timePeriod === 'AM' && styles.periodBtnTextActive,
                          ]}
                        >
                          AM
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setTimePeriod('PM')}
                        style={[
                          styles.periodBtn,
                          timePeriod === 'PM' && styles.periodBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodBtnText,
                            timePeriod === 'PM' && styles.periodBtnTextActive,
                          ]}
                        >
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Format Preview */}
                  <View style={styles.formatInfoBox}>
                    <Text style={styles.formatInfoText}>
                      Selected: <Text style={styles.formatInfoBold}>{timeHour}:{timeMinute} {timePeriod}</Text> (24h: <Text style={styles.formatInfoBold}>{final24Time}</Text>)
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noTimeNote}>No specific time set for this task.</Text>
              )}
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              style={styles.saveButton}
            >
              <Check size={18} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditing(!isEditing)}
                style={styles.editButton}
              >
                <Edit2 size={16} color="#475569" />
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Done Editing' : 'Edit Details'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValueTask: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 23,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  metaGrid: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  metaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  fieldValueMeta: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  rawMetaText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  editCard: {
    maxHeight: 340,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  dateChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  chipTextClear: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ef4444',
  },
  timeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  toggleTimeBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  toggleTimeActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  toggleTimeInactive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeSmallLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  timeInput: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  timeSeparator: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748b',
    paddingTop: 12,
  },
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 3,
    marginTop: 12,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  periodBtnActive: {
    backgroundColor: '#2563eb',
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  periodBtnTextActive: {
    color: '#ffffff',
  },
  noTimeNote: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  formatInfoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  formatInfoText: {
    fontSize: 12,
    color: '#1e40af',
  },
  formatInfoBold: {
    fontWeight: '700',
  },
  buttonGroup: {
    gap: 8,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  editButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 11,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
});