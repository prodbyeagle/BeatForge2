import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import { FolderProvider } from "./contexts/FolderContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { DiscordRPCProvider } from "./contexts/DiscordRPCContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <FolderProvider>
        <DiscordRPCProvider>
          <App />
        </DiscordRPCProvider>
      </FolderProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
