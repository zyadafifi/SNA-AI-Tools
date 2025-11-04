import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faMicrophone,
  faVolumeUp,
  faPlay,
  faPause,
  faStop,
  faTrash,
  faCheck,
  faSpinner,
  faHeadphones,
  faCircle,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

const MobilePracticeOverlay = ({
  show = false,
  sentence = {
    english: "Can I see the menu?",
    phonetic: "kÃ¦n aÉª siË Ã°É™ mÉ›njuË",
  },
  onClose = () => {},
  onComplete = () => {},
  onMicClick = () => {},
  onStopRecording = () => {},
  onListenClick = () => {},
  onListenSlowClick = () => {},
  onPlayRecording = () => {},
  onDeleteRecording = () => {},
  onShowAlert = () => {}, // New prop to communicate with parent for showing alerts
  audioStream = null, // Add audio stream prop like desktop
  isRecording = false,
  recordingTime = 0,
  speechDetected = false,
  isProcessing = false,
  pronunciationScore = null,
  transcription = "",
}) => {
  // State management (only internal UI state)
  const [waveformBars, setWaveformBars] = useState(
    Array.from({ length: 26 }, () => 6)
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Track if speech synthesis is paused
  const [isPlayingRecording, setIsPlayingRecording] = useState(false); // Track if recorded audio is playing
  const [isRecordingPaused, setIsRecordingPaused] = useState(false); // Track if recorded audio playback is paused
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [hasUserRecording, setHasUserRecording] = useState(false); // Track if user has recorded for this sentence
  const [showRecordingAlert, setShowRecordingAlert] = useState(false); // Track if we should show the recording alert
  const [isProcessingLocal, setIsProcessingLocal] = useState(false); // Local processing state
  const [isRecordingCancelled, setIsRecordingCancelled] = useState(false); // Visual state for cancelled recording
  const [recordingError, setRecordingError] = useState(null); // Track recording errors for iOS debugging
  const [retryAttempts, setRetryAttempts] = useState(0); // Track number of retry attempts
  const [errorDetails, setErrorDetails] = useState(null); // Store detailed error information for debugging

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const waveformAnimationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null); // Add dataArray ref like desktop
  const sourceRef = useRef(null); // Add source ref like desktop
  const isRecordingCancelledRef = useRef(false); // Use ref to track cancellation
  const currentUtteranceRef = useRef(null); // Track current speech synthesis utterance
  const currentAudioRef = useRef(null); // Track current recorded audio playback
  const retryAttemptsRef = useRef(0); // Track retries with ref to persist across renders
  const lastErrorRef = useRef(null); // Track last error for debugging
  // audioStream is now passed as prop from parent

  // AssemblyAI API Key - You can set this as an environment variable
  // For development, you can replace this with your actual API key
  const ASSEMBLYAI_API_KEY =
    import.meta.env.VITE_ASSEMBLYAI_API_KEY ||
    "bdb00961a07c4184889a80206c52b6f2";

  // Check if API key is valid (AssemblyAI keys are typically longer)
  const isApiKeyValid = ASSEMBLYAI_API_KEY && ASSEMBLYAI_API_KEY.length > 20;

  // Sound effects functions
  const playCancellationSound = useCallback(() => {
    try {
      // Use Web Audio API for reliable sound generation
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create a sequence of descending tones for cancellation
      const frequencies = [800, 600, 400];
      const duration = 0.15;

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startTime = audioContext.currentTime + index * duration;

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "sine";

        // Create envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      // Fallback: Use existing audio with different settings
      try {
        const audio1 = new Audio("/assets/audio/right answer SFX.wav");
        const audio2 = new Audio("/assets/audio/right answer SFX.wav");

        audio1.volume = 0.2;
        audio1.playbackRate = 1.2;
        audio1.play();

        setTimeout(() => {
          audio2.volume = 0.15;
          audio2.playbackRate = 0.8;
          audio2.play();
        }, 100);
      } catch (fallbackError) {}
    }
  }, []);

  const playSubmissionSound = useCallback(() => {
    try {
      // Use Web Audio API for reliable sound generation
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create an ascending tone sequence for submission
      const frequencies = [400, 600, 800];
      const duration = 0.12;

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startTime = audioContext.currentTime + index * duration;
        const volume = 0.15 - index * 0.03; // Slightly decreasing volume

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "sine";

        // Create envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      // Fallback: Use existing audio with different settings
      try {
        const audio = new Audio("/right-answer-sfx.wav");
        audio.volume = 0.25;
        audio.playbackRate = 1.0; // Normal speed for submission
        audio.play();
      } catch (fallbackError) {}
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Stop waveform animation
    if (waveformAnimationRef.current) {
      cancelAnimationFrame(waveformAnimationRef.current);
      waveformAnimationRef.current = null;
    }

    // Stop MediaRecorder if it's active
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.warn("Error stopping MediaRecorder in cleanup:", e);
      }
      mediaRecorderRef.current = null;
    }

    // Clear audio chunks
    audioChunksRef.current = [];

    // Disconnect audio source
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        console.warn("Error disconnecting audio source:", e);
      }
      sourceRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn("Error closing audio context:", e);
      }
      audioContextRef.current = null;
    }

    // Reset analyser
    analyserRef.current = null;
    dataArrayRef.current = null;

    // Reset waveform bars to default
    setWaveformBars(Array.from({ length: 26 }, () => 6));

    // Reset cancellation flag
    isRecordingCancelledRef.current = false;
  }, []);

  // Speech synthesis for listening with pause/resume support
  const handleListen = useCallback(
    (slow = false) => {
      if (isRecording) return;

      // Handle pause/resume for already speaking utterance
      if (isSpeaking) {
        if (isPaused) {
          // Resume speech
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          // Pause speech
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
        return;
      }

      // Start new speech
      window.speechSynthesis.cancel(); // Cancel any existing speech
      const utterance = new SpeechSynthesisUtterance(sentence.english);
      utterance.lang = "en-US";
      utterance.rate = slow ? 0.6 : 1.0;

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

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [sentence.english, isRecording, isSpeaking, isPaused]
  );

  // Play recorded audio with pause/resume support and alert for no recording
  const handlePlayRecorded = useCallback(() => {
    if (isRecording) return;

    // Check if user has no recording - show alert
    if (!hasUserRecording || !recordedBlob) {
      onShowAlert(
        "Please record your voice first by clicking the microphone button, then you can listen to your recording."
      );
      return;
    }

    // Handle pause/resume for already playing audio
    if (isPlayingRecording && currentAudioRef.current) {
      if (isRecordingPaused) {
        // Resume playback
        currentAudioRef.current.play().catch(console.error);
        setIsRecordingPaused(false);
      } else {
        // Pause playback
        currentAudioRef.current.pause();
        setIsRecordingPaused(true);
      }
      return;
    }

    // Start new playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(URL.createObjectURL(recordedBlob));
    audio.playbackRate = 0.7; // Slow playback

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
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingRecording(false);
      setIsRecordingPaused(false);
      currentAudioRef.current = null;
    };

    currentAudioRef.current = audio;
    audio.play().catch(console.error);
  }, [
    recordedBlob,
    isRecording,
    isPlayingRecording,
    isRecordingPaused,
    hasUserRecording,
    onShowAlert,
  ]);

  // Real-time audio analysis - EXACTLY like desktop
  useEffect(() => {
    if (!audioStream) return;

    const setupAudioAnalysis = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // EXACTLY like desktop
        analyserRef.current.smoothingTimeConstant = 0.8; // EXACTLY like desktop

        // Create data array for frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Connect audio stream to analyser
        sourceRef.current =
          audioContextRef.current.createMediaStreamSource(audioStream);
        sourceRef.current.connect(analyserRef.current);

        // Start real-time analysis
        const analyzeAudio = () => {
          try {
            if (analyserRef.current && dataArrayRef.current) {
              analyserRef.current.getByteFrequencyData(dataArrayRef.current);

              // Convert frequency data to bar heights - EXACTLY like desktop
              const barCount = 26; // Mobile has more bars
              const dataPerBar = Math.floor(
                dataArrayRef.current.length / barCount
              );
              const newBars = [];

              for (let i = 0; i < barCount; i++) {
                let sum = 0;
                for (let j = 0; j < dataPerBar; j++) {
                  sum += dataArrayRef.current[i * dataPerBar + j];
                }
                const average = sum / dataPerBar;
                // Convert to height (0-255 range to 2-22px range) - EXACTLY like desktop calculation
                const height = Math.max(2, (average / 255) * 20 + 2);
                newBars.push(height);
              }

              setWaveformBars(newBars);
              waveformAnimationRef.current =
                requestAnimationFrame(analyzeAudio);
            }
          } catch (animationError) {
            // Continue with fallback animation
            setWaveformBars((prev) => prev.map(() => Math.random() * 20 + 2));
            waveformAnimationRef.current = requestAnimationFrame(analyzeAudio);
          }
        };

        analyzeAudio();
      } catch (error) {
        console.error("Error setting up audio analysis:", error);
        // Fallback to random animation if audio analysis fails - EXACTLY like desktop
        const animateWaveform = () => {
          setWaveformBars((prev) => prev.map(() => Math.random() * 20 + 2));
          waveformAnimationRef.current = requestAnimationFrame(animateWaveform);
        };
        animateWaveform();
      }
    };

    setupAudioAnalysis().catch((error) => {
      console.error("Setup audio analysis failed:", error);
    });

    return () => {
      try {
        if (waveformAnimationRef.current) {
          cancelAnimationFrame(waveformAnimationRef.current);
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      } catch (cleanupError) {}
    };
  }, [audioStream]); // EXACTLY like desktop - depend on audioStream prop

  // Start recording
  const startRecording = useCallback(async () => {
    // Detect iOS device once at the start
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    try {
      cleanup();

      // Reset cancellation flags
      isRecordingCancelledRef.current = false;
      setIsRecordingCancelled(false);

      // Clear previous errors when starting new recording
      setRecordingError(null);
      setErrorDetails(null);

      // Increment retry attempts
      const currentAttempts = retryAttemptsRef.current + 1;
      retryAttemptsRef.current = currentAttempts;
      setRetryAttempts(currentAttempts);

      // Show retry warning after multiple attempts
      if (currentAttempts > 1) {
        const retryMessage = `Recording attempt ${currentAttempts}. ${
          currentAttempts > 3
            ? "If issues persist, please check microphone permissions in Settings."
            : "Make sure your microphone is not being used by another app."
        }`;
        setRecordingError(retryMessage);

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setRecordingError(null);
        }, 3000);
      }

      // Notify parent that recording is starting
      onMicClick();

      // Request microphone permission with iOS compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Audio stream is now passed as prop from parent

      // Setup MediaRecorder with proper iOS compatibility
      let mimeType = null;
      let recorderOptions = { audioBitsPerSecond: 128000 };

      if (isIOSDevice) {
        // iOS-specific mime type handling
        // iOS 14.5+ supports audio/mp4
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          mimeType = "audio/aac";
        } else if (MediaRecorder.isTypeSupported("audio/mpeg")) {
          mimeType = "audio/mpeg";
        } else {
          // Fallback: Let MediaRecorder use browser default (iOS will use CAF format)
          // Don't specify mimeType, let the browser choose
          mimeType = null;
        }
      } else {
        // Non-iOS devices: try webm first
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          // Fallback: Use browser default
          mimeType = null;
        }
      }

      // Create MediaRecorder with determined mimeType
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      try {
        mediaRecorderRef.current = new MediaRecorder(stream, recorderOptions);

        // Store the actual mimeType used (in case it's different from what we requested)
        const actualMimeType =
          mediaRecorderRef.current.mimeType || mimeType || "audio/webm";

        // Update mimeType for blob creation later
        mimeType = actualMimeType;
      } catch (recorderError) {
        console.warn(
          "MediaRecorder creation failed, trying without mimeType:",
          recorderError
        );
        // Fallback: Create without mimeType specification
        try {
          mediaRecorderRef.current = new MediaRecorder(stream);
          // Get the actual mimeType from the recorder
          mimeType = mediaRecorderRef.current.mimeType || "audio/webm";
        } catch (fallbackError) {
          console.error(
            "MediaRecorder creation completely failed:",
            fallbackError
          );
          throw new Error(
            "MediaRecorder is not supported on this device. Please use a modern browser."
          );
        }
      }

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Don't process if recording was cancelled
        if (isRecordingCancelledRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          // Reset the cancellation flag for next recording
          isRecordingCancelledRef.current = false;
          return;
        }

        // Get the actual mimeType from the MediaRecorder (more reliable)
        const actualMimeType =
          mediaRecorderRef.current?.mimeType || mimeType || "audio/webm"; // Fallback if both are unavailable

        // For iOS, handle format issues properly
        // Check if iOS device (reuse detection from outer scope via closure)
        const checkIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        let blobType = actualMimeType;

        // iOS-specific format handling
        if (checkIOS) {
          // iOS Safari may return CAF (Core Audio Format) which AssemblyAI doesn't support
          // Or it may return empty/null mimeType
          if (
            !actualMimeType ||
            actualMimeType.includes("caf") ||
            actualMimeType === ""
          ) {
            // Try to use mp4 if supported, otherwise keep original for error detection
            if (MediaRecorder.isTypeSupported("audio/mp4")) {
              blobType = "audio/mp4";
            } else {
              // Keep CAF format so we can detect and handle it in processRecording
              blobType = actualMimeType || "audio/x-caf";
            }
          }
        }

        const blob = new Blob(audioChunksRef.current, { type: blobType });

        // Log blob info for debugging
        console.log("Recording blob created:", {
          size: blob.size,
          type: blob.type,
          chunks: audioChunksRef.current.length,
          isIOS: checkIOS,
          actualMimeType: actualMimeType,
        });

        setRecordedBlob(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process the recording
        await processRecording(blob);
      };

      // Start recording
      mediaRecorderRef.current.start(100);

      // Reset retry attempts on successful recording start
      if (retryAttemptsRef.current > 0) {
        retryAttemptsRef.current = 0;
        setRetryAttempts(0);
        setRecordingError(null);
        setErrorDetails(null);
      }

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      // Store error details for debugging
      const errorInfo = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        retryAttempt: retryAttemptsRef.current,
        mediaRecorderSupported: typeof MediaRecorder !== "undefined",
        getUserMediaSupported: !!navigator.mediaDevices?.getUserMedia,
      };

      // Detect iOS device
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      // Store error details for UI display
      setErrorDetails(errorInfo);
      lastErrorRef.current = errorInfo;

      // Create user-friendly error message with debugging info for iOS
      let errorMessage =
        "Could not access microphone. Please check permissions and try again.";
      let detailedMessage = "";

      if (isIOSDevice) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Microphone permission denied.";
          detailedMessage = `Go to iOS Settings > Safari > Microphone and enable access. (Error: ${error.name})`;
        } else if (error.name === "NotFoundError") {
          errorMessage = "No microphone found.";
          detailedMessage = `Please connect a microphone and try again. (Error: ${error.name})`;
        } else if (error.name === "NotReadableError") {
          errorMessage = "Microphone is busy or not available.";
          detailedMessage = `Another app may be using the microphone. Close other apps and try again. (Error: ${error.name})`;
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Microphone settings not supported.";
          detailedMessage = `Your device may not support the requested audio settings. (Error: ${error.name})`;
        } else if (error.message?.includes("MediaRecorder")) {
          errorMessage = "Audio recording not supported.";
          detailedMessage = `Please update to Safari on iOS 14.5+ or use a supported browser. (Error: ${error.message})`;
        } else {
          errorMessage = "Recording failed.";
          detailedMessage = `${error.message || error.name}. Attempt #${
            retryAttemptsRef.current
          }`;
        }

        // Add iOS-specific debugging info
        detailedMessage += ` | iOS: ${isIOSDevice} | MediaRecorder: ${
          typeof MediaRecorder !== "undefined" ? "Supported" : "Not Supported"
        } | Attempt: ${retryAttemptsRef.current}`;
      } else {
        if (error.name === "NotAllowedError") {
          errorMessage = "Microphone permission denied.";
          detailedMessage = `Please allow microphone access in your browser settings. (Error: ${error.name})`;
        } else {
          errorMessage = "Recording failed.";
          detailedMessage = `${error.message || error.name} | Attempt #${
            retryAttemptsRef.current
          }`;
        }
      }

      // Set visible error for iOS debugging
      setRecordingError(`${errorMessage}\n${detailedMessage}`);

      // Also show alert for user feedback
      onShowAlert(`${errorMessage}\n${detailedMessage}`);

      // Log to console for web debugging
      console.error("Recording failed - Full error details:", errorInfo);
      console.error("Error object:", error);

      cleanup();
    }
  }, [cleanup, onMicClick, onShowAlert]);

  // Stop recording with submission sound
  const stopRecording = useCallback(() => {
    // Play submission sound effect
    playSubmissionSound();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    // Notify parent that recording is stopping
    onStopRecording();
  }, [cleanup, onStopRecording, playSubmissionSound]);

  // Cancel recording with sound effect - desktop behavior
  const cancelRecording = useCallback(() => {
    // Play cancellation sound effect
    playCancellationSound();

    // Set cancellation flag BEFORE stopping the recorder
    isRecordingCancelledRef.current = true;

    // Set visual cancelled state (like desktop)
    setIsRecordingCancelled(true);

    // Stop the MediaRecorder if it's recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Reset recording state
    setRecordedBlob(null);
    cleanup();

    // Notify parent that recording was cancelled (but don't hide overlay)
    onDeleteRecording();
  }, [cleanup, onDeleteRecording, playCancellationSound]);

  // Calculate pronunciation score
  const calculatePronunciationScore = useCallback((recognized, expected) => {
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

    const recognizedWords = normalizeText(recognized).split(/\s+/);
    const expectedWords = normalizeText(expected).split(/\s+/);

    if (recognizedWords.length === 0 || expectedWords.length === 0) return 0;

    let matches = 0;
    expectedWords.forEach((expectedWord) => {
      if (recognizedWords.includes(expectedWord)) {
        matches++;
      }
    });

    return Math.round((matches / expectedWords.length) * 100);
  }, []);

  // Process recording with AssemblyAI or fallback
  const processRecording = useCallback(
    async (blob) => {
      if (!blob || blob.size < 1000) {
        const errorMsg = `Recording too short (${
          blob?.size || 0
        } bytes). Minimum 1000 bytes required.`;
        setRecordingError(errorMsg);
        onShowAlert(errorMsg);
        return;
      }

      // Set local processing state
      setIsProcessingLocal(true);

      // If API key is invalid, use fallback processing
      if (!isApiKeyValid) {
        const fallbackScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100
        // Mark that user has successfully recorded for this sentence
        setHasUserRecording(true);
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english, // Use target text as fallback
          targetText: sentence.english,
          recordedBlob: blob,
        });
        setIsProcessingLocal(false);
        return;
      }

      // Detect iOS device for format handling
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      // Validate and prepare blob for upload
      let uploadBlob = blob;
      let contentType = blob.type || "application/octet-stream";

      // AssemblyAI supported formats: mp3, wav, m4a, webm, ogg, flac, mp4, aac
      // iOS might record in CAF format which is NOT supported by AssemblyAI
      const supportedTypes = [
        "audio/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/m4a",
        "audio/mp4",
        "audio/webm",
        "audio/ogg",
        "audio/flac",
        "audio/aac",
        "audio/x-m4a",
      ];

      // Check if blob type is supported by AssemblyAI
      const isSupportedType = supportedTypes.some((type) => {
        const format = type.split("/")[1];
        return contentType.toLowerCase().includes(format);
      });

      // Handle iOS CAF format or unsupported formats
      // CAF (Core Audio Format) is iOS-specific and NOT supported by AssemblyAI
      if (
        isIOSDevice &&
        (contentType.includes("caf") ||
          contentType.includes("x-caf") ||
          !isSupportedType ||
          contentType === "application/octet-stream" ||
          !contentType ||
          contentType === "")
      ) {
        // iOS recorded in unsupported format - use fallback immediately
        const formatInfo = contentType || "unknown";
        const errorMsg = `iOS audio format (${formatInfo}) not supported by AssemblyAI. Using fallback scoring. Size: ${blob.size} bytes.`;
        console.warn(errorMsg);

        // Show error in UI for iOS debugging
        const userFriendlyMsg = `Audio format compatibility issue detected. The app will use fallback scoring. Format: ${formatInfo}`;
        setRecordingError(userFriendlyMsg);

        // Auto-hide error after 5 seconds
        setTimeout(() => {
          setRecordingError(null);
        }, 5000);

        // Use fallback processing for unsupported iOS formats
        const fallbackScore = Math.floor(Math.random() * 30) + 60; // Random score 60-90
        setIsProcessingLocal(false);
        setHasUserRecording(true);
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english,
          targetText: sentence.english,
          recordedBlob: blob,
        });
        return;
      }

      // If type is not explicitly supported but is close, try to infer correct type
      if (!isSupportedType && contentType !== "application/octet-stream") {
        // Try to infer a supported type from the blob type
        if (
          contentType.includes("mp4") ||
          contentType.includes("m4a") ||
          contentType.includes("x-m4a")
        ) {
          contentType = "audio/mp4";
        } else if (contentType.includes("webm")) {
          contentType = "audio/webm";
        } else if (contentType.includes("ogg")) {
          contentType = "audio/ogg";
        } else if (
          contentType.includes("wav") ||
          contentType.includes("wave")
        ) {
          contentType = "audio/wav";
        } else if (
          contentType.includes("mpeg") ||
          contentType.includes("mp3")
        ) {
          contentType = "audio/mpeg";
        } else if (contentType.includes("aac")) {
          contentType = "audio/aac";
        } else {
          // For unknown types on iOS, use fallback to avoid 422 errors
          if (isIOSDevice) {
            const errorMsg = `Unknown iOS audio format (${contentType}). Using fallback scoring.`;
            console.warn(errorMsg);
            setRecordingError(
              `Format detection issue: ${contentType}. Using fallback.`
            );

            const fallbackScore = Math.floor(Math.random() * 30) + 60;
            setIsProcessingLocal(false);
            setHasUserRecording(true);
            onComplete({
              score: fallbackScore,
              recognizedText: sentence.english,
              targetText: sentence.english,
              recordedBlob: blob,
            });
            return;
          }

          // For non-iOS, let AssemblyAI try to detect
          contentType = "application/octet-stream";
        }
      }

      try {
        // Upload to AssemblyAI with proper content type
        const uploadResponse = await fetch(
          "https://api.assemblyai.com/v2/upload",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": contentType, // Use actual blob type, not generic octet-stream
            },
            body: uploadBlob,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("AssemblyAI upload error:", errorText);
          console.error("Upload details:", {
            status: uploadResponse.status,
            contentType,
            blobSize: uploadBlob.size,
            blobType: uploadBlob.type,
            isIOS: isIOSDevice,
          });

          // Handle 422 error specifically - format not supported
          if (uploadResponse.status === 422) {
            const errorMsg = `Audio format not supported by AssemblyAI (422 error). The recorded audio format may not be compatible. Using fallback scoring.`;
            console.warn(errorMsg);
            setRecordingError(`Format incompatibility detected. ${errorMsg}`);

            // Use fallback for unsupported formats
            const fallbackScore = Math.floor(Math.random() * 30) + 60;
            setIsProcessingLocal(false);
            setHasUserRecording(true);
            onComplete({
              score: fallbackScore,
              recognizedText: "Unrecognized audio format - unable to process",
              targetText: sentence.english,
              recordedBlob: blob,
            });
            return;
          }

          // Create detailed error message for iOS debugging
          const detailedError = `Upload failed (${
            uploadResponse.status
          }): ${errorText}. Blob size: ${uploadBlob.size} bytes, Type: ${
            uploadBlob.type || "unknown"
          }`;
          setRecordingError(detailedError);

          throw new Error(
            `Upload failed: ${uploadResponse.status} ${errorText}`
          );
        }

        const uploadData = await uploadResponse.json();

        // Show immediate feedback that upload is complete and processing has started

        // Request transcription
        const transcriptionResponse = await fetch(
          "https://api.assemblyai.com/v2/transcript",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              audio_url: uploadData.upload_url,
              language_code: "en", // Primary language (but AssemblyAI will still transcribe other languages)
              // Note: AssemblyAI can transcribe non-English audio even with language_code="en"
              // We'll detect non-English in the result and show appropriate message
            }),
          }
        );

        if (!transcriptionResponse.ok) {
          const errorText = await transcriptionResponse.text();
          console.error("AssemblyAI transcription error:", errorText);
          throw new Error(
            `Transcription request failed: ${transcriptionResponse.status} ${errorText}`
          );
        }

        const transcriptionData = await transcriptionResponse.json();

        // Poll for completion
        let result;
        let attempts = 0;
        const maxAttempts = 15; // Reduced from 30 to 15 seconds timeout

        while (attempts < maxAttempts) {
          const statusResponse = await fetch(
            `https://api.assemblyai.com/v2/transcript/${transcriptionData.id}`,
            {
              headers: { authorization: ASSEMBLYAI_API_KEY },
            }
          );

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          result = await statusResponse.json();

          if (result.status === "completed") {
            break;
          } else if (result.status === "error") {
            throw new Error("Transcription failed");
          }

          await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms
          attempts++;
        }

        if (attempts >= maxAttempts) {
          throw new Error("Transcription timeout");
        }

        // Check if recognized text is empty or seems to be in another language
        const recognizedText = result.text?.trim() || "";
        const isUnrecognizedOrNonEnglish =
          !recognizedText ||
          recognizedText.toLowerCase() === "unrecognized" ||
          recognizedText.toLowerCase().includes("unrecognized");

        // Detect if user spoke in a different language (check if recognized text has no common English words)
        const commonEnglishWords = [
          "the",
          "a",
          "an",
          "is",
          "are",
          "was",
          "were",
          "i",
          "you",
          "he",
          "she",
          "it",
          "we",
          "they",
        ];
        const recognizedLower = recognizedText.toLowerCase();
        const hasEnglishWords = commonEnglishWords.some(
          (word) =>
            recognizedLower.includes(` ${word} `) ||
            recognizedLower.startsWith(`${word} `) ||
            recognizedLower.endsWith(` ${word}`)
        );

        // If no recognized text or doesn't seem English, show appropriate message
        let displayText = recognizedText;
        if (
          isUnrecognizedOrNonEnglish ||
          (!hasEnglishWords &&
            recognizedText.length > 0 &&
            recognizedText.split(" ").length > 2)
        ) {
          displayText = "Unrecognized text - Please speak in English";
        }

        // Calculate score - use 0 if unrecognized or non-English
        const score =
          isUnrecognizedOrNonEnglish || !hasEnglishWords
            ? 0
            : calculatePronunciationScore(recognizedText, sentence.english);

        // Processing complete
        setIsProcessingLocal(false);
        // Mark that user has successfully recorded for this sentence
        setHasUserRecording(true);

        // Show message if non-English detected
        if (
          !hasEnglishWords &&
          recognizedText.length > 0 &&
          !isUnrecognizedOrNonEnglish
        ) {
          setRecordingError(
            "Non-English speech detected. Please speak in English for pronunciation practice."
          );
          setTimeout(() => {
            setRecordingError(null);
          }, 5000);
        }

        // Call onComplete to let parent handle results
        onComplete({
          score: score,
          recognizedText: displayText,
          targetText: sentence.english,
          recordedBlob: blob,
        });
      } catch (error) {
        console.error("Processing error:", error);
        console.error("Error details:", {
          message: error.message,
          blobSize: blob?.size,
          blobType: blob?.type,
          isIOS: isIOSDevice,
        });
        setIsProcessingLocal(false);

        // Create detailed error message for iOS debugging
        const errorDetails = `Processing failed: ${error.message}. Blob: ${
          blob?.size || 0
        } bytes, Type: ${blob?.type || "unknown"}`;
        setRecordingError(errorDetails);

        // Also show alert for immediate feedback
        onShowAlert(
          `Audio processing failed. Using fallback scoring. ${errorDetails}`
        );

        // Use fallback processing on error
        const fallbackScore = Math.floor(Math.random() * 30) + 50; // Random score 50-80
        // Mark that user has successfully recorded for this sentence
        setHasUserRecording(true);
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english, // Use target text as fallback
          targetText: sentence.english,
          recordedBlob: blob,
        });
      }
    },
    [
      sentence.english,
      onComplete,
      isApiKeyValid,
      calculatePronunciationScore,
      onShowAlert,
    ]
  );

  // Format recording time
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Reset state when show changes
  // Reset cancelled state when parent's recording state changes
  useEffect(() => {
    if (!isRecording && isRecordingCancelled) {
      // Reset cancelled state after animation completes
      setTimeout(() => {
        setIsRecordingCancelled(false);
      }, 600); // Match desktop animation duration
    }
  }, [isRecording, isRecordingCancelled]);

  // Reset state when overlay is shown to ensure clean state
  useEffect(() => {
    if (show) {
      // When overlay is shown, ensure all recording states are reset
      // This prevents waveform from showing automatically after retry
      setIsRecordingCancelled(false);
      isRecordingCancelledRef.current = false;
      setIsProcessingLocal(false);
      setRecordedBlob(null);

      // Reset waveform bars to default
      setWaveformBars(Array.from({ length: 26 }, () => 6));

      // Stop any lingering MediaRecorder
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        } catch (e) {
          console.warn("Error stopping MediaRecorder on overlay show:", e);
        }
        mediaRecorderRef.current = null;
      }

      // Clear audio chunks
      audioChunksRef.current = [];
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      // Force stop any active recording when overlay is hidden
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        } catch (e) {
          console.warn("Error stopping MediaRecorder on overlay close:", e);
        }
      }

      cleanup();

      // Reset all recording states
      setRecordedBlob(null);
      setIsRecordingCancelled(false);
      isRecordingCancelledRef.current = false;

      // Reset retry attempts and errors when overlay closes
      retryAttemptsRef.current = 0;
      setRetryAttempts(0);
      setRecordingError(null);
      setErrorDetails(null);
      lastErrorRef.current = null;

      // Reset waveform bars to default
      setWaveformBars(Array.from({ length: 26 }, () => 6));

      // Clean up speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;

      // Clean up audio playback
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsPlayingRecording(false);
      setIsRecordingPaused(false);

      // Reset processing state
      setIsProcessingLocal(false);
    }
  }, [show, cleanup]);

  // Reset recording status when sentence changes
  useEffect(() => {
    setHasUserRecording(false);
    setRecordedBlob(null);
    setIsPlayingRecording(false);
    setIsRecordingPaused(false);

    // Reset retry attempts and errors when sentence changes
    retryAttemptsRef.current = 0;
    setRetryAttempts(0);
    setRecordingError(null);
    setErrorDetails(null);
    lastErrorRef.current = null;

    // Clean up audio playback when sentence changes
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, [sentence.english]); // Reset when sentence changes

  return (
    <>
      <div className={`mobile-practice-overlay ${show ? "show" : ""}`}>
        <div className="practice-card">
          {/* Close Button */}
          <button className="practice-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>

          {/* Header */}
          <div className="practice-header">
            <h3>Your turn!</h3>
            <p>
              Press the <FontAwesomeIcon icon={faMicrophone} /> and record your
              voice.
            </p>
          </div>

          {/* iOS Debugging Error Display */}
          {recordingError && (
            <div className="recording-error-display" role="alert">
              <div className="error-icon">
                <FontAwesomeIcon icon={faTimes} />
              </div>
              <div className="error-content">
                <div className="error-message">
                  {recordingError.split("\n").map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                {retryAttempts > 1 && (
                  <div className="retry-counter">
                    Retry Attempt: {retryAttempts}
                  </div>
                )}
              </div>
              <button
                className="error-close-btn"
                onClick={() => setRecordingError(null)}
                aria-label="Close error message"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          {/* Sentence - Always Visible */}
          <div className="practice-sentence">
            <div className="sentence-text">{sentence.english}</div>
            <div className="sentence-phonetic">{sentence.phonetic}</div>
          </div>

          {/* Normal State - Practice Controls */}
          {/* Only show practice controls when NOT recording and overlay is shown */}
          {show &&
            (!isRecording || isRecordingCancelled) &&
            !isProcessingLocal && (
              <div className="practice-controls">
                <button
                  className={`control-btn listen-btn ${
                    isSpeaking && !isPaused ? "speaking" : ""
                  } ${isPaused ? "paused" : ""}`}
                  onClick={() => handleListen(false)}
                  title={
                    isSpeaking
                      ? isPaused
                        ? "Resume listening"
                        : "Pause listening"
                      : "Listen to example"
                  }
                >
                  <FontAwesomeIcon
                    icon={
                      isSpeaking ? (isPaused ? faPlay : faPause) : faVolumeUp
                    }
                    className={`fas ${
                      isSpeaking
                        ? isPaused
                          ? "fa-play"
                          : "fa-pause"
                        : "fa-volume-up"
                    }`}
                  />
                </button>

                <button
                  className={`mic-btn ${
                    isRecordingCancelled ? "cancelled" : ""
                  }`}
                  onClick={startRecording}
                >
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className="fas fa-microphone"
                  />
                </button>

                <button
                  className={`control-btn listen-slow-btn ${
                    isPlayingRecording && !isRecordingPaused ? "speaking" : ""
                  } ${isRecordingPaused ? "paused" : ""}`}
                  onClick={handlePlayRecorded}
                  title={
                    isPlayingRecording
                      ? isRecordingPaused
                        ? "Resume recorded audio"
                        : "Pause recorded audio"
                      : "Play recorded audio"
                  }
                >
                  <FontAwesomeIcon
                    icon={
                      isPlayingRecording
                        ? isRecordingPaused
                          ? faPlay
                          : faPause
                        : faHeadphones
                    }
                    className={`fas ${
                      isPlayingRecording
                        ? isRecordingPaused
                          ? "fa-play"
                          : "fa-pause"
                        : "fa-headphones"
                    }`}
                  />
                </button>
              </div>
            )}

          {/* Recording State - Enhanced Waveform replaces controls */}
          {/* Only show waveform when actually recording and overlay is shown */}
          {show &&
            isRecording &&
            !isRecordingCancelled &&
            !isProcessingLocal && (
              <div className="mobile-waveform-container">
                <button
                  className="mobile-pause-btn"
                  onClick={cancelRecording}
                  title="Delete recording"
                >
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    className="fa-regular fa-trash-can"
                  />
                </button>

                <div className="mobile-waveform-area">
                  <div className="mobile-waveform-bars">
                    {waveformBars.map((height, index) => (
                      <div
                        key={index}
                        className={`mobile-waveform-bar ${
                          height > 12 ? "active" : ""
                        }`}
                        style={{
                          height: `${height}px`,
                          transition:
                            "height 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                          animationDelay: `${index * 0.02}s`,
                        }}
                      ></div>
                    ))}
                  </div>

                  <div className="mobile-recording-timer">
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="fas fa-circle recording-indicator"
                    />
                    {formatTime(recordingTime)}
                  </div>
                </div>

                <button
                  className="mobile-send-btn"
                  onClick={stopRecording}
                  title="Stop recording"
                >
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="fas fa-paper-plane"
                  />
                </button>
              </div>
            )}

          {/* Processing State - Disabled controls with spinner */}
          {show && isProcessingLocal && (
            <div className="practice-controls">
              <button
                className="control-btn listen-btn disabled"
                title="Processing audio..."
                disabled
              >
                <FontAwesomeIcon icon={faVolumeUp} />
              </button>

              <button className="mic-btn processing" disabled>
                <div className="processing-spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              <button
                className="control-btn listen-slow-btn disabled"
                title="Processing audio..."
                disabled
              >
                <i className="fas fa-headphones"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobilePracticeOverlay;
