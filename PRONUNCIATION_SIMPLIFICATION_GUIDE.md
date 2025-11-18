# Pronunciation Feature Simplification Guide

## ✅ Completed Tasks

### 1. Data Restructuring
- **File**: `public/assets/pronounceData.json`
- **Status**: ✅ COMPLETED
- **Changes**: Flattened structure from `lessons → topics → conversations → sentences` to `lessons → sentences`
- All 10 lessons now have sentences directly under them (9 sentences per lesson)

### 2. Routing Configuration
- **File**: `src/config/routes/routes.jsx`
- **Status**: ✅ COMPLETED
- **Changes**:
  - Removed TopicsPage route `/pronounce/topics/:lessonNumber`
  - Simplified to single route `/pronounce/lesson/:lessonNumber`
  - Removed DesktopConversationPage (merged into MobileLessonPage)

### 3. TopicsPage Component Deletion
- **Files**: `src/pages/TopicsPage.jsx` and `TopicsPage.css`
- **Status**: ✅ COMPLETED
- Deleted both files as topics layer is removed

### 4. PronounceHomePage Navigation
- **File**: `src/pages/PronounceHomePage.jsx`
- **Status**: ✅ COMPLETED
- Updated navigation from `/pronounce/topics/${lessonNumber}` to `/pronounce/lesson/${lessonNumber}`

## ⚠️ Tasks Requiring Manual Completion

### 1. Subtitle Files Renaming
**Status**: ⚠️ NEEDS MANUAL EXECUTION

**Current Format**:
```
lesson1_topic1_conversation1_sentence1.srt
lesson1_topic1_conversation1_sentence2.srt
lesson1_topic1_conversation2_sentence1.srt
...
```

**New Format Required**:
```
lesson1_sentence1.srt
lesson1_sentence2.srt
lesson1_sentence3.srt
...
lesson1_sentence18.srt
lesson2_sentence1.srt
...
```

**Renaming Script** (Already created but needs execution fix):
- Location: `public/assets/subtitles/pronunciation/rename_subtitles.ps1`
- Issue: First files are being named `lesson1_sentence.srt` instead of `lesson1_sentence1.srt`

**Manual Renaming Required**:
For each lesson (1-10), rename subtitle files sequentially:
- Lesson 1: 9 sentences (lesson1_sentence1.srt through lesson1_sentence9.srt)
- Lesson 2: 9 sentences (lesson2_sentence1.srt through lesson2_sentence9.srt)
- And so on...

**Total Files**: 90 subtitle files need renaming (9 sentences × 10 lessons)

### 2. MobileLessonPage Refactoring
**File**: `src/pages/MobileLessonPage.jsx`
**Status**: ⚠️ PARTIALLY COMPLETED - NEEDS FINISHING

**Completed Changes**:
- ✅ Removed `topicId` and `conversationId` from useParams
- ✅ Removed topic and conversation state variables  
- ✅ Changed `conversation.sentences` to `lesson.sentences` (all occurrences)
- ✅ Updated initial data loading logic
- ✅ Updated subtitle loading to remove topicId/conversationId parameters

**Still Needs**:
1. **Remove/Update these functions/callbacks**:
   - `handleConversationCompleted` - Still references topic/conversation
   - `updateTopicProgress` calls
   - `updateLessonProgressByTopics` calls
   
2. **Update completion logic**:
   - Remove `topicCompletedStatus` references
   - Simplify to only track `lessonCompletedStatus`
   
3. **Update progress hooks**:
   - Remove `isConversationCompleted` (or rename to `isLessonCompleted`)
   - Update `useConversationProgress` hook to work with lessons instead

4. **Fix subtitle loading**:
   - Update `loadSubtitlesForSentence` calls to use new format:
     ```javascript
     // Old: loadSubtitlesForSentence(lessonNumber, topicId, conversationId, sentenceIndex)
     // New: loadSubtitlesForSentence(lessonNumber, sentenceIndex)
     ```

5. **Update navigation**:
   - Change "Back to Topics" to "Back to Home"
   - Update all `navigate(/pronounce/topics/...)` to `navigate(/pronounce/home)`

### 3. DesktopConversationPage (Optional - Can Delete)
**File**: `src/pages/DesktopConversationPage.jsx`
**Status**: ⚠️ NOT STARTED

**Options**:
- **Option A**: Delete entirely and use only MobileLessonPage (responsive)
- **Option B**: Refactor similar to MobileLessonPage changes

**If keeping, apply same changes as MobileLessonPage**:
- Remove topicId/conversationId parameters
- Update all conversation.sentences → lesson.sentences
- Remove topic/conversation progress tracking
- Update subtitle loading paths

### 4. Progress Context Simplification
**Files**: Progress context and hooks
**Status**: ⚠️ NOT STARTED

**Functions to Remove/Update**:
```javascript
// Remove these:
- isTopicCompleted()
- isConversationCompleted()
- calculateTopicProgress()
- updateTopicProgress()
- setCurrentTopic()
- setCurrentConversation()
- calculateLessonProgressByTopics()
- updateLessonProgressByTopics()

// Keep/Update these:
- isLessonCompleted()
- isLessonUnlocked()
- getLessonProgress()
- updateLessonProgress()
- setCurrentLesson()
```

**Update localStorage structure**:
```javascript
// Old format:
{
  "lesson-1-topic-1-conversation-1": { completed: true, score: 95 }
}

// New format:
{
  "lesson-1-sentence-1": { completed: true, score: 95 },
  "lesson-1": { progress: 50, completed: false }
}
```

### 5. Subtitle Sync Hook Update
**File**: `src/hooks/useSubtitleSync.js` (or similar)
**Status**: ⚠️ NOT STARTED

**Update subtitle path generation**:
```javascript
// Old:
const subtitlePath = `/assets/subtitles/pronunciation/lesson${lessonNum}_topic${topicId}_conversation${convId}_sentence${sentenceIdx}.srt`;

// New:
const subtitlePath = `/assets/subtitles/pronunciation/lesson${lessonNum}_sentence${sentenceIdx}.srt`;
```

### 6. PronunciationProgressTracker
**File**: `src/modules/PronunciationProgressTracker/PronunciationProgressTracker.jsx`
**Status**: ⚠️ NOT STARTED

**Changes Needed**:
- Remove all topic-related displays and statistics (lines 17-247)
- Update to show only lessons and sentences
- Remove `progress.topics` references
- Simplify to show lesson progress only

## 📋 Summary

### What Works Now:
1. ✅ Data structure is flattened
2. ✅ Routing is simplified
3. ✅ TopicsPage is removed
4. ✅ Home page navigates directly to practice

### What Needs Work:
1. ⚠️ Subtitle files renaming (manual process)
2. ⚠️ MobileLessonPage refactoring (partially done)
3. ⚠️ Progress tracking simplification
4. ⚠️ Subtitle hooks update
5. ⚠️ Progress tracker UI update

## 🎯 Recommended Next Steps

1. **First**: Manually rename subtitle files or fix the PowerShell script
2. **Second**: Complete MobileLessonPage refactoring
3. **Third**: Simplify progress tracking system
4. **Fourth**: Update subtitle sync hooks
5. **Fifth**: Update progress tracker UI
6. **Finally**: Test the complete flow

## 📝 Testing Checklist

Once all changes are complete, test:
- [ ] Click lesson from home → goes directly to practice
- [ ] Sentences load in correct order
- [ ] Subtitles display with new naming
- [ ] Progress saves correctly
- [ ] Lesson completion works
- [ ] Next lesson unlocks properly
- [ ] Progress tracker shows correct stats
- [ ] No console errors
- [ ] Mobile and desktop both work

