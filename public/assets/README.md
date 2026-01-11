# Assets Folder Structure

This folder contains all static assets and data files for the SNA AI Tools application.

## Structure

```
public/assets/
├── audio/              # Audio files for UI feedback
│   ├── right answer SFX.wav
│   └── wrong answer SFX.wav
│
├── images/            # Image assets
│   ├── courses_image/ # Course-related images
│   ├── icons/         # Application icons
│   └── [various logo and background images]
│
├── sounds/            # Sound effects
│   ├── accepter-2-394924.mp3
│   ├── error-04-199275.mp3
│   ├── mouse-click-4-393911.mp3
│   └── rightanswer-95219.mp3
│
├── subtitles/         # Subtitle files (SRT format)
│   └── [150+ subtitle files]
│
├── listeningData.json # Listening lessons data
├── pronounceData.json # Pronunciation lessons data
└── writingData.json  # Writing lessons data
```

## Data Files

### listeningData.json

Contains all listening lesson data including:

- Lesson metadata (title, description, duration)
- Video sources (CDN URLs)
- Exercises with audio URLs
- Exercise text and choices

### pronounceData.json

Contains pronunciation lesson data with:

- Lesson structure (lessons → topics → conversations → sentences)
- Video sources for each sentence
- English and Arabic text

### writingData.json

Contains writing exercise data.

## Notes

- All data files should remain in the root of `/public/assets/` folder
- Do not create subdirectories for data files
- Video sources use CDN URLs: `https://cdn13674550.b-cdn.net/`
- Audio sources use CDN URLs: `https://cdn13674550.b-cdn.net/SNA-audio/`
- Subtitle files (SRT) are stored in `/public/assets/subtitles/`

## Usage

Data files are loaded at runtime via fetch:

- Listening: `/assets/listeningData.json`
- Pronunciation: `/assets/pronounceData.json`
- Writing: `/assets/writingData.json`

Do not import these files directly in source code - always fetch them at runtime to allow for easy updates without rebuilding the application.
