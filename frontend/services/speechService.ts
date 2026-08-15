import { Platform } from 'react-native';

export type SpeechCallback = (text: string) => void;
export type ErrorCallback = (error: string) => void;
export type StateCallback = (isListening: boolean) => void;

interface SpeechServiceListeners {
  onResult?: SpeechCallback;
  onError?: ErrorCallback;
  onListeningChange?: StateCallback;
}

class SpeechService {
  private isListening = false;
  private listeners: SpeechServiceListeners = {};
  private webRecognition: any = null;

  constructor() {
    this.initWebSpeech();
  }

  private initWebSpeech() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.webRecognition = new SpeechRecognition();
        this.webRecognition.continuous = false;
        this.webRecognition.interimResults = true;
        this.webRecognition.lang = 'en-US';

        this.webRecognition.onstart = () => {
          this.isListening = true;
          this.listeners.onListeningChange?.(true);
        };

        this.webRecognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            this.listeners.onResult?.(transcript);
          }
        };

        this.webRecognition.onerror = (event: any) => {
          this.isListening = false;
          this.listeners.onListeningChange?.(false);
          let errMsg = 'Speech recognition error occurred.';
          if (event.error === 'not-allowed') {
            errMsg = 'Microphone permission denied. Please allow microphone access in your settings.';
          } else if (event.error === 'no-speech') {
            errMsg = 'No speech was detected. Please try speaking again.';
          } else if (event.error === 'network') {
            errMsg = 'Network error during speech recognition.';
          }
          this.listeners.onError?.(errMsg);
        };

        this.webRecognition.onend = () => {
          this.isListening = false;
          this.listeners.onListeningChange?.(false);
        };
      }
    }
  }

  public setListeners(listeners: SpeechServiceListeners) {
    this.listeners = listeners;
  }

  public async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          return true;
        }
        return true;
      } catch (err) {
        console.warn('Microphone permission rejected:', err);
        return false;
      }
    }
    // On native Expo, permission is requested upon starting Voice / expo-speech-recognition
    return true;
  }

  public isAvailable(): boolean {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
    }
    return true;
  }

  public async startListening(): Promise<void> {
    if (this.isListening) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      this.listeners.onError?.('Microphone permission is required to recognize voice commands.');
      return;
    }

    if (Platform.OS === 'web') {
      if (!this.webRecognition) {
        this.listeners.onError?.('Speech recognition is not supported in this browser. Please use Chrome/Safari or manual task entry.');
        return;
      }
      try {
        this.webRecognition.abort?.();
      } catch {
        // Ignore
      }
      try {
        this.webRecognition.start();
      } catch (e: any) {
        if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
          this.isListening = true;
          this.listeners.onListeningChange?.(true);
          return;
        }
        console.error('Error starting Web Speech:', e);
        this.listeners.onError?.('Failed to start speech recognition: ' + e.message);
      }
    } else {
      // Native Expo Voice module
      try {
        this.isListening = true;
        this.listeners.onListeningChange?.(true);
      } catch (e: any) {
        this.isListening = false;
        this.listeners.onListeningChange?.(false);
        this.listeners.onError?.(e.message || 'Speech recognition initialization failed');
      }
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.isListening) return;

    if (Platform.OS === 'web' && this.webRecognition) {
      try {
        this.webRecognition.stop();
      } catch (e) {
        console.error('Error stopping web recognition', e);
      }
    }

    this.isListening = false;
    this.listeners.onListeningChange?.(false);
  }
}

export const speechService = new SpeechService();
