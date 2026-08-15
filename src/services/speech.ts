export class WebSpeechRecognizer {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback?: (text: string) => void;
  private onErrorCallback?: (error: string) => void;
  private onStatusChangeCallback?: (isListening: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStatusChangeCallback?.(true);
        };

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            this.onResultCallback?.(transcript);
          }
        };

        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          this.onStatusChangeCallback?.(false);
          let msg = 'Speech recognition error.';
          if (event.error === 'not-allowed') {
            msg = 'Microphone permission was denied. Please allow microphone access in your browser.';
          } else if (event.error === 'no-speech') {
            msg = 'No speech detected. Please speak into the microphone.';
          } else if (event.error === 'network') {
            msg = 'Network error during speech recognition.';
          }
          this.onErrorCallback?.(msg);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStatusChangeCallback?.(false);
        };
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public setCallbacks(
    onResult: (text: string) => void,
    onError: (error: string) => void,
    onStatusChange: (isListening: boolean) => void
  ) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onStatusChangeCallback = onStatusChange;
  }

  public async start(): Promise<void> {
    if (!this.recognition) {
      this.onErrorCallback?.(
        'Speech recognition is not natively supported in this browser. Please use Chrome/Edge or click any sample command below.'
      );
      return;
    }

    if (this.isListening) {
      this.stop();
      return;
    }

    try {
      this.recognition.abort?.();
    } catch {
      // Ignore abort errors
    }

    try {
      this.recognition.start();
    } catch (e: any) {
      // If already started, do not crash or show red banner - just update state
      if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
        this.isListening = true;
        this.onStatusChangeCallback?.(true);
        return;
      }
      console.warn('Error starting recognition', e);
      this.onErrorCallback?.(e.message || 'Failed to start microphone');
    }
  }

  public stop(): void {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn('Error stopping recognition', e);
    }
    this.isListening = false;
    this.onStatusChangeCallback?.(false);
  }
}
