import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import { FolderProvider } from "./contexts/FolderContext";
import { SettingsProvider } from "./contexts/SettingsContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <FolderProvider>
        <App />
      </FolderProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
