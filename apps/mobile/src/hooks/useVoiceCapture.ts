import { useState, useEffect, useCallback, useRef } from 'react';
import Voice from '@react-native-voice/voice';
import type { VoiceState, ParsedVoiceTask } from '@mma/types';
import { voicePipeline } from '@/services/voicePipeline';

interface UseVoiceCaptureResult {
  state: VoiceState;
  transcript: string;
  parsedTask: ParsedVoiceTask | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  reset: () => void;
}

export function useVoiceCapture(): UseVoiceCaptureResult {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsedTask, setParsedTask] = useState<ParsedVoiceTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setState('listening');
    };

    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0] ?? '';
      setTranscript(text);

      // Reset silence timer
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        stopListening();
      }, 3000);
    };

    Voice.onSpeechPartialResults = (e) => {
      const text = e.value?.[0] ?? '';
      setTranscript(text);
    };

    Voice.onSpeechError = (e) => {
      setState('error');
      setError(e.error?.message ?? 'Could not understand speech. Try again?');
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      setParsedTask(null);
      setState('listening');
      await Voice.start('en-US');
    } catch (e) {
      setState('error');
      setError('Microphone access required');
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      await Voice.stop();

      if (!transcript) {
        setState('error');
        setError('Could not understand speech. Try again?');
        return;
      }

      setState('processing');

      const result = await voicePipeline.parseTranscript(transcript);
      setParsedTask(result);
      setState('confirming');
    } catch (e) {
      setState('error');
      setError(e instanceof Error ? e.message : 'Failed to process voice input');
    }
  }, [transcript]);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setParsedTask(null);
    setError(null);
  }, []);

  return {
    state,
    transcript,
    parsedTask,
    error,
    startListening,
    stopListening,
    reset,
  };
}
