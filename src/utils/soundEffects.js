// Sound effects utility with iOS compatibility
class SoundEffects {
  constructor() {
    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    this.audioPool = {
      right: [],
      wrong: [],
    };
    this.poolSize = 3; // Pre-create multiple audio instances
    this.isInitialized = false;
    this.initPromise = null;

    // Initialize on first user interaction (iOS requirement)
    if (typeof window !== "undefined") {
      const initEvents = ["touchstart", "click", "keydown"];
      const initAudio = () => {
        this.initialize();
        initEvents.forEach((event) => {
          document.removeEventListener(event, initAudio);
        });
      };

      initEvents.forEach((event) => {
        document.addEventListener(event, initAudio, {
          once: true,
          passive: true,
        });
      });
    }
  }

  async initialize() {
    if (this.isInitialized) return this.initPromise;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise(async (resolve) => {
      try {
        // Create audio pool for better iOS performance
        const rightUrl = "/assets/audio/right answer SFX.wav";
        const wrongUrl = "/assets/audio/wrong answer SFX.wav";

        // Pre-create audio instances (don't call load() - it causes ERR_CACHE_OPERATION_NOT_SUPPORTED)
        for (let i = 0; i < this.poolSize; i++) {
          const rightAudio = new Audio(rightUrl);
          const wrongAudio = new Audio(wrongUrl);

          rightAudio.preload = "auto";
          wrongAudio.preload = "auto";
          rightAudio.volume = 0.7;
          wrongAudio.volume = 0.7;

          // Don't call load() - let browser handle it naturally
          // The preload="auto" attribute will trigger loading
          // We'll wait for canplaythrough event if needed during play

          this.audioPool.right.push(rightAudio);
          this.audioPool.wrong.push(wrongAudio);
        }

        this.isInitialized = true;
        console.log("Sound effects initialized successfully");
        resolve(true);
      } catch (error) {
        console.warn("Failed to initialize sound effects:", error);
        this.isInitialized = false;
        resolve(false);
      }
    });

    return this.initPromise;
  }

  getAvailableAudio(soundType) {
    const pool = this.audioPool[soundType];
    if (!pool || pool.length === 0) return null;

    // Find an audio instance that's not currently playing
    for (const audio of pool) {
      if (audio.paused || audio.ended) {
        return audio;
      }
    }

    // If all are playing, return the first one (will reset it)
    return pool[0];
  }

  async playSound(soundType, retries = 3) {
    try {
      // Ensure initialization
      if (!this.isInitialized) {
        await this.initialize();
      }

      const audio = this.getAvailableAudio(soundType);

      if (!audio) {
        // Fallback: create new audio on the fly
        console.warn("No audio in pool, creating new instance");
        return this.playNewAudio(soundType, retries);
      }

      // Reset audio to beginning
      audio.currentTime = 0;
      audio.volume = 0.7;

      // Attempt to play
      const attemptPlay = async (attempt = 1) => {
        try {
          await audio.play();
          return true;
        } catch (error) {
          if (attempt < retries) {
            // Wait a bit and retry
            await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
            return attemptPlay(attempt + 1);
          } else {
            console.warn(
              `Failed to play ${soundType} sound after ${retries} attempts:`,
              error
            );
            return false;
          }
        }
      };

      return await attemptPlay();
    } catch (error) {
      console.error("Error playing sound:", error);
      // Last resort fallback
      return this.playNewAudio(soundType, 1);
    }
  }

  async playNewAudio(soundType, retries = 3) {
    const url =
      soundType === "right"
        ? "/assets/audio/right answer SFX.wav"
        : "/assets/audio/wrong answer SFX.wav";

    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = 0.7;

      const attemptPlay = (attempt = 1) => {
        audio.currentTime = 0;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              if (attempt < retries) {
                setTimeout(() => attemptPlay(attempt + 1), 50 * attempt);
              } else {
                console.warn(
                  `Fallback play failed for ${soundType} sound:`,
                  error
                );
                resolve(false);
              }
            });
        } else {
          resolve(true);
        }
      };

      // Play - browser will load if needed
      if (audio.readyState >= 2) {
        // Already loaded, play immediately
        attemptPlay();
      } else {
        // Wait for audio to be ready, then play
        audio.addEventListener("canplaythrough", () => attemptPlay(), {
          once: true,
        });
        audio.addEventListener(
          "error",
          () => {
            console.error("Audio load error:", url);
            resolve(false);
          },
          { once: true }
        );
        // Don't call load() - setting src or accessing play() will trigger loading
        // Try to play, which will trigger loading if needed
        attemptPlay();
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
    // Update volume for all pooled audio
    for (const soundType in this.audioPool) {
      this.audioPool[soundType].forEach((audio) => {
        audio.volume = volume;
      });
    }
  }
}

const soundEffects = new SoundEffects();

export default soundEffects;
