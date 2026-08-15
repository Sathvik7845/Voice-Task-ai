import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Mic, MicOff, Square } from 'lucide-react-native';

interface VoiceButtonProps {
  isListening: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  onPress,
  disabled = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation;

    if (isListening) {
      pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(rippleAnim, {
              toValue: 1,
              duration: 1400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rippleAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();
    } else {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
    }

    return () => {
      if (pulseLoop) pulseLoop.stop();
    };
  }, [isListening, pulseAnim, rippleAnim]);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.6, 0.2, 0],
  });

  return (
    <View style={styles.container}>
      {isListening && (
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      )}

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          id="voice-mic-button"
          activeOpacity={0.8}
          onPress={onPress}
          disabled={disabled}
          style={[
            styles.button,
            isListening ? styles.buttonActive : styles.buttonInactive,
            disabled && styles.buttonDisabled,
          ]}
        >
          {isListening ? (
            <Square size={32} color="#ffffff" fill="#ffffff" />
          ) : (
            <Mic size={36} color="#ffffff" />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Text style={[styles.statusText, isListening && styles.statusTextActive]}>
        {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  ripple: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  button: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonInactive: {
    backgroundColor: '#2563eb', // Indigo / blue primary
  },
  buttonActive: {
    backgroundColor: '#ef4444', // Red for active recording
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  statusText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  statusTextActive: {
    color: '#ef4444',
    fontWeight: '700',
  },
});
