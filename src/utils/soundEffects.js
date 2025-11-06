// Sound effects utility with iOS compatibility
class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.isUnlocked = false;
    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    this.audioBuffers = {
      right: null,
      wrong: null,
    };
    this.isLoading = false;
    this.loadPromise = null;

    // Initialize audio context (will be unlocked on first user interaction)
    this.initAudioContext();

    // Preload audio files
    this.preloadSounds();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      // iOS: Context starts suspended, needs user interaction to resume
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    } catch (error) {
      console.warn(
        "AudioContext not supported, falling back to HTML5 Audio",
        error
      );
      this.audioContext = null;
    }
  }

  async unlockAudioContext() {
    if (this.isUnlocked) return true;

    try {
      if (this.audioContext) {
        // Resume suspended context (iOS requirement)
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }

        // Create silent buffer and play to unlock (iOS requirement)
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);

        this.isUnlocked = true;
        return true;
      }
    } catch (error) {
      console.warn("Failed to unlock audio context:", error);
    }

    return false;
  }

  async loadAudioFile(url) {
    try {
      if (!this.audioContext) {
        // Fallback to HTML5 Audio
        return null;
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn("Failed to load audio file:", url, error);
      return null;
    }
  }

  async preloadSounds() {
    if (this.isLoading) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = Promise.all([
      this.loadAudioFile("/assets/audio/right answer SFX.wav").then(
        (buffer) => {
          this.audioBuffers.right = buffer;
        }
      ),
      this.loadAudioFile("/assets/audio/wrong answer SFX.wav").then(
        (buffer) => {
          this.audioBuffers.wrong = buffer;
        }
      ),
    ]).finally(() => {
      this.isLoading = false;
    });

    return this.loadPromise;
  }

  async playSound(soundType, retries = 3) {
    // Ensure audio context is unlocked (iOS requirement)
    await this.unlockAudioContext();

    // Ensure sounds are loaded
    await this.preloadSounds();

    // Ensure context is resumed (iOS can suspend it)
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const buffer =
      soundType === "right" ? this.audioBuffers.right : this.audioBuffers.wrong;

    if (!buffer && this.audioContext) {
      // Fallback to HTML5 Audio if Web Audio API fails
      return this.playSoundFallback(soundType);
    }

    if (this.audioContext && buffer) {
      try {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        gainNode.gain.value = 0.7;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
        return true;
      } catch (error) {
        console.warn("Web Audio API play failed, using fallback:", error);
        return this.playSoundFallback(soundType, retries);
      }
    }

    return this.playSoundFallback(soundType, retries);
  }

  playSoundFallback(soundType, retries = 3) {
    const url =
      soundType === "right"
        ? "/assets/audio/right answer SFX.wav"
        : "/assets/audio/wrong answer SFX.wav";

    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.volume = 0.7;
      audio.preload = "auto";

      const attemptPlay = (attempt = 1) => {
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              if (attempt < retries) {
                // Retry after short delay
                setTimeout(() => attemptPlay(attempt + 1), 100 * attempt);
              } else {
                console.warn(
                  `Failed to play ${soundType} sound after ${retries} attempts:`,
                  error
                );
                resolve(false);
              }
            });
        } else {
          resolve(true);
        }
      };

      // Wait for audio to be ready
      if (audio.readyState >= 2) {
        attemptPlay();
      } else {
        audio.addEventListener("canplaythrough", () => attemptPlay(), {
          once: true,
        });
        audio.addEventListener("error", () => resolve(false), { once: true });
      }
    });
  }

  async playRightAnswer() {
    return this.playSound("right");
  }

  async playWrongAnswer() {
    return this.playSound("wrong");
  }

  setVolume(volume) {
    // Volume is handled per-play in Web Audio API
    // This is kept for backward compatibility
  }
}

const soundEffects = new SoundEffects();

// Unlock audio on first user interaction (iOS requirement)
if (typeof window !== "undefined") {
  const unlockEvents = ["touchstart", "touchend", "mousedown", "keydown"];
  const unlockAudio = () => {
    soundEffects.unlockAudioContext();
    unlockEvents.forEach((event) => {
      document.removeEventListener(event, unlockAudio);
    });
  };

  unlockEvents.forEach((event) => {
    document.addEventListener(event, unlockAudio, {
      once: true,
      passive: true,
    });
  });
}

export default soundEffects;
