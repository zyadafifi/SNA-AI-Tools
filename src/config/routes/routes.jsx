import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../../layouts/Layout";
import {
  ErrorPage,
  Reading,
  ReadingProgressTracker,
  QuizPage,
  ShowLesson,
  ShowLessonFirstRound,
  ShowLessonSecondRound,
  Home,
  ListeningProgressTracker,
  PronunciationProgressTracker,
  LoginPage,
  WritingProgressTracker,
} from "../../modules/index";
import { ListeningHome } from "../../pages/ListeningHome";
import { ListeningLessonPage } from "../../pages/ListeningLessonPage";
import { PronounceHomePage } from "../../pages/PronounceHomePage";
import { MobileLessonPage } from "../../pages/MobileLessonPage";
import { WritingHome } from "../../pages/WritingHome";
import Article from "../../pages/Article";
import Questions from "../../pages/Questions";
import Results from "../../pages/Results";

export const Routes = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "reading",
        element: <Reading />,
      },
      {
        path: "reading/show-lesson/:levelId/:lessonId",
        element: <ShowLesson />,
      },
      {
        path: "reading/show-lesson-first-round/:levelId/:lessonId",
        element: <ShowLessonFirstRound />,
      },
      {
        path: "reading/show-lesson-second-round/:levelId/:lessonId",
        element: <ShowLessonSecondRound />,
      },
      {
        path: "reading/level/:levelId/lesson/:lessonId/quiz",
        element: <QuizPage />,
      },
      {
        path: "reading/progress",
        element: <ReadingProgressTracker />,
      },
      {
        path: "listening/progress",
        element: <ListeningProgressTracker />,
      },
      {
        path: "listening/home",
        element: <ListeningHome />,
      },
      {
        path: "listening/lesson/:id",
        element: <ListeningLessonPage />,
      },
      {
        path: "pronounce/home",
        element: <PronounceHomePage />,
      },
      {
        path: "pronounce/lesson/:lessonNumber",
        element: <MobileLessonPage />,
      },
      {
        path: "pronounce/progress",
        element: <PronunciationProgressTracker />,
      },
      {
        path: "writing/home",
        element: <WritingHome />,
      },
      { path: "article/:topicId", element: <Article /> },
      { path: "questions/:topicId", element: <Questions /> },
      { path: "results/:topicId", element: <Results /> },
      { path: "login", element: <LoginPage /> },
      { path: "writing/progress", element: <WritingProgressTracker /> },
    ],
  },
]);
