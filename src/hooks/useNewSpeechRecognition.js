import { useState, useRef, useCallback } from "react";

export const useNewSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  // Removed audioContextRef, analyserRef, animationFrameRef - visualization handled by MobilePracticeOverlay
  const currentUtteranceRef = useRef(null);
  const recordedAudioRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Store the stream for real-time analysis
      setAudioStream(stream);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        setRecordedAudio(audioBlob);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Note: Audio visualization is handled by MobilePracticeOverlay component
      // to avoid conflicts and improve performance
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioStream(null); // Clear the stream

      // Clear timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Note: Audio visualization cleanup is handled by MobilePracticeOverlay

      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  }, [isRecording]);

  // Stop recording and return audio blob
  const stopRecordingAndGetBlob = useCallback(() => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        // Store the resolve function
        const originalOnStop = mediaRecorderRef.current.onstop;

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm;codecs=opus",
          });
          setRecordedAudio(audioBlob);
          resolve(audioBlob);

          // Call original onstop if it exists
          if (originalOnStop) {
            originalOnStop();
          }
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Clear timer
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        // Note: Audio visualization cleanup is handled by MobilePracticeOverlay

        // Stop all tracks
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      } else {
        resolve(null);
      }
    });
  }, [isRecording]);

  // Note: Audio visualization functions removed
  // Visualization is now handled by MobilePracticeOverlay component
  // to avoid conflicts and improve performance on iOS

  // Delete recording
  const deleteRecording = useCallback(() => {
    setRecordedAudio(null);
    setRecordingTime(0);
    setSpeechDetected(false);
  }, []);

  // Play recorded audio
  const playRecordedAudio = useCallback(() => {
    if (recordedAudio) {
      const audio = new Audio(URL.createObjectURL(recordedAudio));
      recordedAudioRef.current = audio;

      audio.onplay = () => {
        setIsPlayingRecording(true);
        setIsRecordingPaused(false);
      };

      audio.onpause = () => {
        setIsRecordingPaused(true);
      };

      audio.onended = () => {
        setIsPlayingRecording(false);
        setIsRecordingPaused(false);
        recordedAudioRef.current = null;
      };

      audio.play();
    }
  }, [recordedAudio]);

  // Pause recorded audio
  const pauseRecordedAudio = useCallback(() => {
    if (recordedAudioRef.current && isPlayingRecording && !isRecordingPaused) {
      recordedAudioRef.current.pause();
      setIsRecordingPaused(true);
    }
  }, [isPlayingRecording, isRecordingPaused]);

  // Resume recorded audio
  const resumeRecordedAudio = useCallback(() => {
    if (recordedAudioRef.current && isPlayingRecording && isRecordingPaused) {
      recordedAudioRef.current.play();
      setIsRecordingPaused(false);
    }
  }, [isPlayingRecording, isRecordingPaused]);

  // Toggle pause/resume for recorded audio
  const togglePauseRecordedAudio = useCallback(() => {
    if (isRecordingPaused) {
      resumeRecordedAudio();
    } else {
      pauseRecordedAudio();
    }
  }, [isRecordingPaused, pauseRecordedAudio, resumeRecordedAudio]);

  // Clear recording (alias for deleteRecording)
  const clearRecording = useCallback(() => {
    deleteRecording();
  }, [deleteRecording]);

  // Speak text using Web Speech API
  const speakText = useCallback((text, rate = 1, pitch = 1) => {
    if ("speechSynthesis" in window) {
      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.voice =
        speechSynthesis
          .getVoices()
          .find((voice) => voice.lang.startsWith("en")) ||
        speechSynthesis.getVoices()[0];

      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      // Store reference for pause/resume
      currentUtteranceRef.current = utterance;

      speechSynthesis.speak(utterance);
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  // Pause speaking - Immediate response
  const pauseSpeaking = useCallback(() => {
    if (
      "speechSynthesis" in window &&
      speechSynthesis.speaking &&
      !speechSynthesis.paused
    ) {
      setIsPaused(true);
      speechSynthesis.pause();
    }
  }, []);

  // Resume speaking - Immediate response
  const resumeSpeaking = useCallback(() => {
    if ("speechSynthesis" in window && speechSynthesis.paused) {
      setIsPaused(false);
      speechSynthesis.resume();
    }
  }, []);

  // Toggle pause/resume - Immediate response with DOM updates
  const togglePauseSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      if (speechSynthesis.paused) {
        // Immediate DOM updates for instant visual feedback
        const buttons = document.querySelectorAll(
          "#listenButton, #listen2Button"
        );
        buttons.forEach((button) => {
          const icon = button.querySelector("i");
          if (icon) {
            icon.className = "fas fa-pause";
          }
          button.classList.remove("paused");
          button.classList.add("speaking");
          button.title = "Pause listening";
        });

        // Update state and resume
        setIsPaused(false);
        speechSynthesis.resume();
      } else if (speechSynthesis.speaking) {
        // Immediate DOM updates for instant visual feedback
        const buttons = document.querySelectorAll(
          "#listenButton, #listen2Button"
        );
        buttons.forEach((button) => {
          const icon = button.querySelector("i");
          if (icon) {
            icon.className = "fas fa-play";
          }
          button.classList.remove("speaking");
          button.classList.add("paused");
          button.title = "Resume listening";
        });

        // Update state and pause
        setIsPaused(true);
        speechSynthesis.pause();
      }
    }
  }, []);

  // Ultra-fast pause - bypasses React for instant response
  const ultraFastPause = useCallback(() => {
    if ("speechSynthesis" in window && speechSynthesis.speaking) {
      // Immediate DOM manipulation for zero-delay visual feedback
      const listenButtons = document.querySelectorAll(
        "#listenButton, #listen2Button"
      );
      listenButtons.forEach((button) => {
        const icon = button.querySelector("i");
        if (icon) {
          // Add instant-pause class to disable transitions
          button.classList.add("instant-pause");

          if (speechSynthesis.paused) {
            // Resume
            icon.className = "fas fa-pause";
            button.classList.remove("paused");
            button.classList.add("speaking");
            button.title = "Pause listening";
          } else {
            // Pause
            icon.className = "fas fa-play";
            button.classList.remove("speaking");
            button.classList.add("paused");
            button.title = "Resume listening";
          }

          // Remove instant-pause class after a frame to re-enable transitions
          requestAnimationFrame(() => {
            button.classList.remove("instant-pause");
          });
        }
      });

      // Immediate speech API call
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        // Update React state after DOM (non-blocking)
        setTimeout(() => setIsPaused(false), 0);
      } else {
        speechSynthesis.pause();
        // Update React state after DOM (non-blocking)
        setTimeout(() => setIsPaused(true), 0);
      }
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopRecording();
    stopSpeaking();
    deleteRecording();
  }, [stopRecording, stopSpeaking, deleteRecording]);

  return {
    isRecording,
    isSpeaking,
    isPaused,
    isPlayingRecording,
    isRecordingPaused,
    recordingTime,
    speechDetected,
    recordedAudio,
    audioStream,
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    deleteRecording,
    playRecordedAudio,
    pauseRecordedAudio,
    resumeRecordedAudio,
    togglePauseRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    togglePauseSpeaking,
    ultraFastPause,
    cleanup,
  };
};
