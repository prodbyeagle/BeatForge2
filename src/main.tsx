import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import { FolderProvider } from "./contexts/FolderContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FolderProvider>
      <App />
    </FolderProvider>
  </React.StrictMode>,
);
