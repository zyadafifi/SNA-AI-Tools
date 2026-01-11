import { RouterProvider } from "react-router-dom";
import { Routes } from "./config/routes/routes";
import { ProgressProvider } from "./contexts/ProgressContext";
import { WritingProgressProvider } from "./contexts/WritingProgressContext";

function App() {
  return (
    <ProgressProvider>
      <WritingProgressProvider>
        <RouterProvider router={Routes} />
      </WritingProgressProvider>
    </ProgressProvider>
  );
}

export default App;
