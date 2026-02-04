import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faTimes,
  faVolumeUp,
  faHeadphones,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import soundEffects from "../../../utils/soundEffects";
import "./MobileResultsDialog.css";

const MobileResultsDialog = ({
  show = false,
  score = 0,
  recognizedText = "",
  targetText = "Can I see the menu?",
  recordedBlob = null,
  onRetry = () => {},
  onContinue = () => {},
  onClose = () => {},
  onListenClick = () => {},
  onPlayRecording = () => {},
  isPlayingRecording = false, // From controller when using onPlayRecording prop
  isRecordingPaused = false, // From controller when using onPlayRecording prop
  togglePauseRecordedAudio = null, // From controller - toggle pause/resume
  missingWords = [],
  isProcessing = false,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [internalAudioRef, setInternalAudioRef] = useState(null);

  // Play audio feedback based on score when dialog opens
  useEffect(() => {
    if (show && score >= 0 && !audioPlayed) {
      // Play audio feedback after a short delay
      setTimeout(async () => {
        if (score >= 50) {
          // Play success sound for scores 50% and above
          await soundEffects.playRightAnswer();
        } else {
          // Play error sound for scores less than 50%
          await soundEffects.playWrongAnswer();
        }
        setAudioPlayed(true);
      }, 500);
    }
  }, [show, score, audioPlayed]);

  // Animate score circle when dialog opens
  useEffect(() => {
    if (show && score > 0) {
      const duration = 1000; // 1 second animation
      const steps = 30;
      const increment = score / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const currentScore = Math.min(increment * currentStep, score);
        setAnimatedScore(Math.round(currentScore));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [show, score]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!show) {
      setAnimatedScore(0);
      setIsPlayingOriginal(false);
      setIsPlayingRecorded(false);
      setAudioPlayed(false);
      if (internalAudioRef) {
        internalAudioRef.pause();
        setInternalAudioRef(null);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [show, internalAudioRef]);

  // Play original sentence using speech synthesis
  const handleListenOriginal = useCallback(() => {
    if (isPlayingOriginal) {
      window.speechSynthesis.cancel();
      setIsPlayingOriginal(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = "en-US";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsPlayingOriginal(true);
    utterance.onend = () => setIsPlayingOriginal(false);
    utterance.onerror = () => setIsPlayingOriginal(false);

    window.speechSynthesis.speak(utterance);
  }, [targetText, isPlayingOriginal]);

  // Play recorded audio - use onPlayRecording prop if provided, otherwise use internal handler
  const handlePlayRecorded = useCallback(() => {
    // If onPlayRecording prop is provided, use controller's play/pause toggle
    if (onPlayRecording && togglePauseRecordedAudio) {
      if (isPlayingRecording && !isRecordingPaused) {
        // Currently playing - pause it
        togglePauseRecordedAudio();
      } else if (isPlayingRecording && isRecordingPaused) {
        // Currently paused - resume it
        togglePauseRecordedAudio();
      } else {
        // Not playing - start playing
        onPlayRecording();
      }
      return;
    }

    // If only onPlayRecording is provided (no toggle), just call it
    if (onPlayRecording) {
      onPlayRecording();
      return;
    }

    // Fallback to internal handler if no prop provided
    if (!recordedBlob) {
      alert("No recorded audio available.");
      return;
    }

    if (isPlayingRecorded && internalAudioRef) {
      // Pause if playing
      if (!internalAudioRef.paused) {
        internalAudioRef.pause();
        setIsPlayingRecorded(false);
      } else {
        // Resume if paused
        internalAudioRef.play();
        setIsPlayingRecorded(true);
      }
      return;
    }

    // Start playing
    try {
      const audioUrl = URL.createObjectURL(recordedBlob);
      const audio = new Audio(audioUrl);
      setInternalAudioRef(audio);

      audio.onplay = () => setIsPlayingRecorded(true);
      audio.onpause = () => setIsPlayingRecorded(false);
      audio.onended = () => {
        setIsPlayingRecorded(false);
        setInternalAudioRef(null);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlayingRecorded(false);
        setInternalAudioRef(null);
        URL.revokeObjectURL(audioUrl);
        alert("Error playing recorded audio.");
      };

      audio.play().catch(() => {
        setIsPlayingRecorded(false);
        setInternalAudioRef(null);
        URL.revokeObjectURL(audioUrl);
        alert("Could not play recorded audio.");
      });
    } catch (error) {
      console.error("Error playing recorded audio:", error);
      alert("Error playing recorded audio.");
    }
  }, [
    recordedBlob,
    isPlayingRecorded,
    onPlayRecording,
    togglePauseRecordedAudio,
    isPlayingRecording,
    isRecordingPaused,
    internalAudioRef,
  ]);

  // Process recognized text for display
  const processRecognizedText = useCallback(() => {
    if (!recognizedText) {
      return "No recording detected";
    }

    // Simple word matching for color coding
    const normalizeText = (text) => text.toLowerCase().replace(/[^\w\s]/g, "");
    const targetWords = normalizeText(targetText).split(/\s+/);
    const recognizedWords = normalizeText(recognizedText).split(/\s+/);

    return recognizedWords
      .map((word, index) => {
        const isCorrect = targetWords.some((targetWord) => {
          if (targetWord === word) return true;
          // Simple similarity check
          const similarity = calculateWordSimilarity(word, targetWord);
          return similarity > 0.7;
        });

        return `<span style="color: ${isCorrect ? "#28a745" : "#dc3545"}">${
          recognizedText.split(/\s+/)[index] || word
        }</span>`;
      })
      .join(" ");
  }, [recognizedText, targetText]);

  // Calculate word similarity
  const calculateWordSimilarity = useCallback((word1, word2) => {
    if (word1 === word2) return 1;

    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;

    if (longer.length === 0) return 1;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++;
      }
    }

    return matches / longer.length;
  }, []);

  // Calculate score circle stroke
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (show) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [show]);

  if (!show) return null;

  // Render via Portal to ensure it's above everything
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="mobile-dialog-container active">
      <div
        className="mobile-dialog-backdrop"
        onClick={handleBackdropClick}
      ></div>
      <div className="mobile-dialog-content">
        {/* Close Button */}
        <button className="mobile-close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} className="fas fa-times" />
        </button>

        {/* Dialog Header */}
        <div className="mobile-dialog-header">
          <div className="mobile-dialog-icon">
            <FontAwesomeIcon
              icon={faMicrophone}
              className="fas fa-microphone"
            />
          </div>
          <h4>Your Pronunciation Review</h4>

          {/* Pronunciation Score Circle */}
          <div className="mobile-score-circle-container">
            <svg className="mobile-score-circle" width="120" height="120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="#e9ecef"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="#ffc515"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 60 60)"
                style={{
                  transition: "stroke-dashoffset 1s ease-in-out",
                }}
              />
            </svg>
            <div className="mobile-score-percentage">{animatedScore}%</div>
          </div>
        </div>

        {/* Results Content */}
        <div className="mobile-results-content">
          <div className="mobile-sentence-comparison">
            <div className="mobile-original-sentence">
              <strong>Original:</strong>
              <p>{targetText}</p>
            </div>
            <div className="mobile-user-sentence">
              <strong>You said:</strong>
              <p
                className={score >= 80 ? "correct-text" : "incorrect-text"}
                dangerouslySetInnerHTML={{
                  __html: processRecognizedText(),
                }}
              ></p>
            </div>
          </div>
        </div>

        {/* Dialog Controls */}
        <div className="mobile-dialog-controls">
          {/* Listen Button */}
          <button
            className={`mobile-control-btn mobile-listen-btn ${
              isPlayingOriginal ? "playing" : ""
            }`}
            title="Listen to example"
            onClick={handleListenOriginal}
          >
            <FontAwesomeIcon
              icon={isPlayingOriginal ? faPause : faVolumeUp}
              className={`fas ${
                isPlayingOriginal ? "fa-pause" : "fa-volume-up"
              }`}
            />
          </button>

          {/* Action Buttons */}
          <div className="mobile-dialog-buttons">
            <button
              className="mobile-btn mobile-btn-secondary"
              onClick={() => {
                // Reset audio played state for retry
                setAudioPlayed(false);
                onRetry();
              }}
            >
              <i className="fas fa-redo"></i> Retry
            </button>
            <button
              className={`mobile-btn mobile-btn-primary ${
                score >= 50 ? "success" : "error"
              }`}
              onClick={onContinue}
            >
              <i
                className={`fas ${score >= 50 ? "fa-check" : "fa-arrow-right"}`}
              ></i>
              Continue
            </button>
          </div>

          {/* Play Recording Button */}
          <button
            className={`mobile-control-btn mobile-play-btn ${
              (isPlayingRecording && !isRecordingPaused) || isPlayingRecorded
                ? "playing"
                : ""
            }`}
            title={
              (isPlayingRecording && !isRecordingPaused) || isPlayingRecorded
                ? "Pause recorded audio"
                : "Play recorded audio"
            }
            onClick={handlePlayRecorded}
            disabled={!recordedBlob && !onPlayRecording}
            style={{
              opacity: recordedBlob || onPlayRecording ? 1 : 0.5,
              cursor:
                recordedBlob || onPlayRecording ? "pointer" : "not-allowed",
            }}
          >
            <FontAwesomeIcon
              icon={
                (isPlayingRecording && !isRecordingPaused) || isPlayingRecorded
                  ? faPause
                  : faHeadphones
              }
              className={`fas ${
                (isPlayingRecording && !isRecordingPaused) || isPlayingRecorded
                  ? "fa-pause"
                  : "fa-headphones"
              }`}
            />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileResultsDialog;
