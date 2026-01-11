// Data service for loading and managing lesson data
class DataService {
  constructor() {
    // Lazy load lessons to improve initial performance
    this.lessons = null;
    this.lessonsData = null;
    this.tipsDatabase = null;
    this.isInitialized = false;
    this.isLoading = false;
  }

  // Load lessons data from assets
  async loadLessonsData() {
    if (this.lessonsData) return this.lessonsData;
    if (this.isLoading) {
      // Wait for existing load to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isLoading && this.lessonsData) {
            clearInterval(checkInterval);
            resolve(this.lessonsData);
          }
        }, 100);
      });
    }

    this.isLoading = true;
    try {
      const response = await fetch("/assets/listeningData.json");
      this.lessonsData = await response.json();
      this.tipsDatabase = this.lessonsData.tipsDatabase || {};
      return this.lessonsData;
    } catch (error) {
      console.error("Error loading lessons data:", error);
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  // Initialize lessons only when needed
  async initializeLessons() {
    if (!this.isInitialized) {
      const lessonsData = await this.loadLessonsData();
      if (lessonsData) {
        // Use real lessons from JSON file
        this.lessons = lessonsData.lessons;
        this.lessons = this.lessons.map((lesson, index) => ({
          ...lesson,
          // Keep videoSrc as is (direct CDN URL)
          isUnlocked: index === 0, // Only first lesson is unlocked by default
          isCompleted: false,
          progress: 0,
          order: index + 1,
        }));
        this.isInitialized = true;
        this.loadProgress();
      }
    }
  }

  // Get all lessons
  async getAllLessons() {
    await this.initializeLessons();
    return this.lessons || [];
  }

  // Get lessons with pagination
  async getLessons(page = 1, limit = 20) {
    await this.initializeLessons();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return (this.lessons || []).slice(startIndex, endIndex);
  }

  // Get total number of lessons
  async getTotalLessons() {
    await this.initializeLessons();
    return (this.lessons || []).length;
  }

  // Get a specific lesson by ID
  async getLessonById(id) {
    await this.initializeLessons();
    return (this.lessons || []).find((lesson) => lesson.id === parseInt(id));
  }

  // Get normalized questions for a lesson (fallback from exercises)
  async getLessonQuestions(lessonId) {
    const lesson = await this.getLessonById(lessonId);
    if (!lesson) return [];
    if (Array.isArray(lesson.questions) && lesson.questions.length > 0) {
      return lesson.questions;
    }
    // Fallback: derive 5 questions from exercises/text using lesson.videoSrc when per‑question videos are not yet provided
    const source = Array.isArray(lesson.exercises) ? lesson.exercises : [];
    const derived = source.slice(0, 5).map((ex, idx) => ({
      id: idx + 1,
      text: ex.text || "",
      videoSrc: ex.videoSrc || lesson.videoSrc || "",
    }));
    return derived;
  }

  async getQuestion(lessonId, questionIndex) {
    const qs = await this.getLessonQuestions(lessonId);
    return qs[questionIndex] || null;
  }

  // Get tips database
  getTipsDatabase() {
    return this.tipsDatabase || {};
  }

  // Check if lesson is unlocked
  async isLessonUnlocked(lessonId) {
    await this.initializeLessons();
    const lesson = await this.getLessonById(lessonId);
    return lesson ? lesson.isUnlocked : false;
  }

  // Check if lesson is completed
  async isLessonCompleted(lessonId) {
    await this.initializeLessons();
    const lesson = await this.getLessonById(lessonId);
    return lesson ? lesson.isCompleted : false;
  }

  // Unlock a lesson
  async unlockLesson(lessonId) {
    await this.initializeLessons();
    const lesson = await this.getLessonById(lessonId);
    if (lesson) {
      lesson.isUnlocked = true;
      this.saveProgress();
    }
  }

  // Mark lesson as completed
  async completeLesson(lessonId) {
    await this.initializeLessons();
    const lesson = await this.getLessonById(lessonId);
    if (lesson) {
      lesson.isCompleted = true;
      lesson.progress = 100;

      // Unlock next lesson
      const nextLessonId = lessonId + 1;
      if (nextLessonId <= (this.lessons || []).length) {
        await this.unlockLesson(nextLessonId);
      }

      this.saveProgress();
    }
  }

  // Update lesson progress
  async updateLessonProgress(lessonId, progress) {
    await this.initializeLessons();
    const lesson = await this.getLessonById(lessonId);
    if (lesson) {
      lesson.progress = Math.min(100, Math.max(0, progress));
      this.saveProgress();
    }
  }

  // Save progress to localStorage
  saveProgress() {
    try {
      if (this.lessons) {
        const progressData = this.lessons.map((lesson) => ({
          id: lesson.id,
          isUnlocked: lesson.isUnlocked,
          isCompleted: lesson.isCompleted,
          progress: lesson.progress,
        }));
        localStorage.setItem(
          "sna-lesson-progress",
          JSON.stringify(progressData)
        );
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }

  // Load progress from localStorage
  async loadProgress() {
    try {
      await this.initializeLessons();
      const savedProgress = localStorage.getItem("sna-lesson-progress");
      if (savedProgress && this.lessons) {
        const progressData = JSON.parse(savedProgress);
        for (const progress of progressData) {
          const lesson = await this.getLessonById(progress.id);
          if (lesson) {
            lesson.isUnlocked = progress.isUnlocked;
            lesson.isCompleted = progress.isCompleted;
            lesson.progress = progress.progress;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  }

  // Get user's overall progress
  async getOverallProgress() {
    await this.initializeLessons();
    const completedLessons = (this.lessons || []).filter(
      (lesson) => lesson.isCompleted
    ).length;
    const totalLessons = (this.lessons || []).length;
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: Math.round((completedLessons / totalLessons) * 100),
    };
  }

  // Reset all progress
  async resetProgress() {
    await this.initializeLessons();
    if (this.lessons) {
      this.lessons.forEach((lesson, index) => {
        lesson.isUnlocked = index === 0;
        lesson.isCompleted = false;
        lesson.progress = 0;
      });
      this.saveProgress();
    }
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
